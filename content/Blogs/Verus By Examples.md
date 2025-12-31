---
draft: false
tags:
  - Verus
  - Formal-Stuff
  - Tutorials
---
For the last few months I've been familiarizing myself with [Verus](https://github.com/verus-lang/verus), the systems verification framework built upon Rust. In many ways, Verus is not a completely new concept if you know Dafny, F*, or other automated theorem proving languages - it essentially lifts the proof capability of a powerful [SMT solver](https://en.wikipedia.org/wiki/Z3_Theorem_Prover) to a high-level language that doesn't feel *insane* to write programs in.

Verus has got certain things right, though:

* Reasoning about memory is a lot easier, due to Rust's innate ownership rules and the type system.

* Better practicality thanks to Rust's impact as a systems programming language. [Many projects are starting to use Verus](https://verus-lang.github.io/verus/publications-and-projects/).

* Blazingly fast verification and execution speed, courtesy of clever SMT encoding principles and probably LLVM.

As per the wonderful tradition of Rust projects, Verus has a decent [online book](https://verus-lang.github.io/verus/guide/) as a learning source. However, given the scale and the iteration speed of the Verus project, the book (understandably) remains a work-in-progress, and can feel a bit lacking when it comes to actually using its knowledge to write Verus programs. 

This post contains just that: a list of curated code snippets that I wrote as I was learning Verus. Each example should be a standalone program that compiles in Verus, covering various interesting aspects of the language. 

---
# Unspecified Constants

It isn't immediately clear, after reading the Verus book, how one would create an "unspecified" value of a certain type - e.g., a term of type `u16` that represents some `a` in the range of `[0, 65535]`, without an actual concrete value. Indeed, an input parameter of a function works just like that; but how could one construct them *programmatically*?

Well, someone who is familiar with the [SMT-LIB](https://smt-lib.org/) format would probably recognize these as *constants* or *symbolics*, for which you write something like:
```
(declare-const a Int)
```
where `a` is just "some certain value" of the type `Int` (in Verus, `int`). And that someone would probably also know that `declare-const` is just syntax sugar for *uninterpreted functions*:
```
(declare-fun a () Int) ; a is a constant
```

In Verus, we can do exactly the same thing:
```rust
using verus::prelude::*;

verus!{

uninterp spec fn a() -> int;

fn main() {
	assert(a() == a());
}

}
```

What if we want to create and identify many of them? Just add arguments to the uninterpreted `spec` function!
```rust
using verus::prelude::*;

verus!{

uninterp spec fn symbolic(id: int) -> int;

fn main() {
	assert(symbolic(1) == symbolic(1));
	assert(symbolic(2) == symbolic(2));
}

}
```

>[!hint] P.S.
>Turns out that `vstd` also provides the [`arbitrary()`](https://verus-lang.github.io/verus/verusdoc/vstd/pervasive/fn.arbitrary.html) function, which produces an uninterpreted value of any type.

# `ghost` and `tracked`

The concept of [function modes](https://verus-lang.github.io/verus/guide/modes.html) (i.e., `spec`, `proof`, and `exec`) in Verus is rather straightforward to understand. Basically, `spec` and `proof` are for "ghost" code that gets erased during compilation, and `exec` is for your normal executable Rust code. Further, the distinction between `spec` and `proof` is clear if you realize Verus proofs are just instructions to an underlying SMT solver - both modes represent pure mathematical functions, while only the `proof` mode is allowed to have "side effects" on the SMT solver states, like introducing an axiom by calling a lemma.

Things are not quite so clear for [variable modes](https://verus-lang.github.io/verus/guide/reference-var-modes.html#cheat-sheet) (i.e., `ghost` and `tracked`; also, the `Ghost` and `Tracked` types), which are mentioned [here](https://verus-lang.github.io/verus/guide/syntax.html), [here](https://verus-lang.github.io/verus/state_machines/intro.html), and [here](https://www.andrew.cmu.edu/user/bparno/papers/hance_thesis.pdf), but are never given an upfront and complete explanation (the book has referred to `tracked` as "an advanced feature"; indeed, that last link I provided is a Ph.D. thesis!). Worse is the fact that the naming of the `ghost` mode also collides with the more familiar term "ghost" code - yet they mean different things! 

Here is my best attempt at a full description of these concepts:

### `tracked` is an opt-in choice

The one-liner answer for the difference between `ghost` and `tracked`: **`tracked` is `ghost` but lifetime-checked**; or if you have background knowledge in type theories, **`tracked` is for linear `ghost` types** (hence its usage in [concurrency verification](https://verus-lang.github.io/verus/state_machines/intro.html)).
Every variable in a `spec` or `proof` function, including the input and return parameters, is `ghost` by default (indeed, these are "ghost" code), and you may optionally mark one as `tracked` so that Rust's lifetime checking is enabled. Eventually, both `ghost` and `tracked` variables are erased in compilation.

To see this in action:
```rust
// Does *not* implement `Copy` (nor `Clone`)
struct Witness();

proof fn consume(tracked w: Witness) {}

proof fn test_tracked(tracked w: Witness) {
    consume(w);
    consume(w);
}
```
Running this through Verus will produce:
```txt
error[E0382]: use of moved value: `w`
  --> test.rs:10:13
   |
 8 | proof fn test_tracked(tracked w: Witness) {
   |                               - move occurs because `w` has type `Witness`,
   |                                 which does not implement the `Copy` trait
 9 |     consume(w);
   |             - value moved here
10 |     consume(w);
   |             ^ value used here after move
```

In short, making a variable `tracked` in `proof`-mode code brings back Rust's classical ownership rules. Otherwise, in the example above, `w` will be `ghost` by default, and it is then OK to reuse `w` at will.

By the way, `tracked` is only allowed in `proof`- or `exec`-mode code, whereas in `spec`-mode all variables are always (implicitly) `ghost`. See [this table](https://verus-lang.github.io/verus/guide/reference-var-modes.html?highlight=tracked#variable-modes-and-function-modes) from the book.

>[!info] Maintaining Linearity
>Verus allows you to use a `tracked` variable wherever a `ghost` one is required, but forbids the other way around:
>```rust
>struct Witness();
>proof fn make() -> tracked Witness { Witness() }
>proof fn consume(tracked w: Witness) {}
>proof fn dup(w: Witness) -> (Witness, Witness) { (w, w) }
>//                          ^ By the way, you cannot cheat by adding 
>//                           `tracked` here, as `(w, w)` is only `ghost`.
>
>fn test_make() {
>	let tracked w = make();
>	let (w1, w2) = dup(w); // OK; used a `tracked` for a `ghost`
>	consume(w1); // Not OK; used a `ghost` for a `tracked`
>}
>```
>Indeed, this rule preserves linearity of `tracked` and the soundness of proofs - by using `tracked` variable as a `ghost`, you give up a privilege that is never restored, as you cannot ever make the `ghost` variable return to `tracked`. Anything you end up proving does not rely on the linearity of the `tracked` variable, because you simply cannot invoke any `proof` function that takes a `tracked`-version of that variable. 

### `Ghost` and `Tracked` types

However, `ghost` and `tracked` alone do not solve lifetime-checking in all scenarios. One such case is `exec` functions - [all arguments and return values need to have the `exec` mode](https://verus-lang.github.io/verus/guide/reference-exec-signature.html#function-arguments) in an `exec` function. Meanwhile, we often do need to pass around "ghost" states across `exec` functions to facilitate proofs of our implementation. 

For example, you may write something along the lines of:
```rust
use vstd::prelude::*;
use std::ptr;

verus! {

struct Witness();
proof fn authorize() -> tracked Witness { Witness() }
proof fn consume(tracked w: Witness) {}

#[verifier::external_body]
unsafe fn ptr_read<T>(t: *const T) -> T {
    ptr::read(t)
}

fn witnessed_read<T>(tracked w: Witness, t: *const T) -> T {
    proof { consume(w); }
    unsafe { ptr_read(t) }
}

fn test(ptr: *const u8) -> u8 {
    let tracked w = authorize();
    witnessed_read(w, ptr)
}

}

fn main() {}
```

But running the example above through Verus gives you:
```txt
error: cannot access proof-mode place in executable context
  --> test.rs:22:20
   |
22 |     witnessed_read(w, ptr)
   |                    ^
```

Why is that? Well, that `tracked w: Witness` parameter in `witnessed_read` (Verus indeed accepts this syntax) is not actually interpreted as "treat `w` as a `tracked`-mode variable"; `w` is always `exec`-mode. If anything, `tracked` is redundant here because `exec`-mode variables are always lifetime-checked by `rustc`. Consequently, the proof object is not properly isolated in "ghost" code as we want it.

To handle this properly, Verus provides the corresponding [`Ghost`](https://verus-lang.github.io/verus/verusdoc/vstd/prelude/struct.Ghost.html) and [`Tracked`](https://verus-lang.github.io/verus/verusdoc/vstd/prelude/struct.Tracked.html) structs in `vstd`. To reiterate - these are `exec`-mode, ordinary Rust structs, with their properties reflected by trait implementations (e.g., [`Ghost<A>` is always `Copy`](https://verus-lang.github.io/verus/verusdoc/vstd/prelude/struct.Ghost.html#impl-Copy-for-Ghost%3CA%3E), whereas [`Tracked<A>` is `Copy` only when `A` is `Copy`](https://verus-lang.github.io/verus/verusdoc/vstd/prelude/struct.Tracked.html#impl-Copy-for-Tracked%3CA%3E)). You simply use them in place of `ghost` and `tracked` in `exec` functions:
```rust
use vstd::prelude::*;
use std::ptr;

verus! {

struct Witness();
proof fn authorize() -> tracked Witness { Witness() }
proof fn consume(tracked w: Witness) {}

#[verifier::external_body]
unsafe fn ptr_read<T>(t: *const T) -> T {
    ptr::read(t)
}

fn witnessed_read<T>(w: Tracked<Witness>, t: *const T) -> T {
    proof { consume(w.get()); }
    unsafe { ptr_read(t) }
}

fn test(ptr: *const u8) -> u8 {
    let tracked w = authorize();
    witnessed_read(Tracked(w), ptr)
}

}

fn main() {}
```
which now passes verification.

Another common use case of `Ghost` and `Tracked` is specifying different modes in an returned tuple:
```rust
proof fn some_call() -> (tracked ret: (Tracked<X>, Ghost<Y>)) { ... }
```
Note that `tracked ret: (X, Y)` is fully `tracked` otherwise, and `ret: (tracked X, ghost Y)` is not valid syntax. You may also pattern-match with `Ghost` and `Tracked`:
```rust
proof fn example() {
    // The lower-case `tracked` keyword is used to indicate the right-hand side
    // has `proof` mode, in order to allow the `tracked` call.
    let tracked (Tracked(x), Ghost(y)) = some_call();
    // `x` is `tracked` X, `y` is `ghost` Y
}
```

Finally, for the purpose of "ghost" code erasure, the `Ghost` and `Tracked` types are treated as the [`PhantomData`](https://doc.rust-lang.org/std/marker/struct.PhantomData.html) type during compilation.

### Variable modes in datatypes (`struct` and `enum`)

The last piece of the puzzle is how variable modes are handled in datatype definitions (a.k.a., `struct` and `enum`). 

We'll use `struct` here as an example. The rules are in fact consistent with what we've seen previously, so hopefully it should feel obvious now:
* `struct` fields can be selectively marked as `ghost` or `tracked`.
* A `ghost`/`tracked` field is considered `ghost`/`tracked` when the entire `struct` is `tracked`; for example, in a `tracked p: Pair` where `Pair` is `struct Pair { ghost fst: X, tracked snd: Y }`, `p.fst` has mode `ghost`, and `p.snd` has mode `tracked`.
* The field modes do not otherwise matter when the `struct` is `ghost` or `exec`. In the former case, every field is just `ghost`; in the latter case, every field is `exec` (similar to how a `tracked` argument in an `exec` function is not actually "ghost" code). We can verify this with:
```rust
struct Witness(u32);

#[verifier::external_body]
fn print_size<T>() {
    println!(
        "Type {} has size {}", 
        std::any::type_name::<T>(), 
        std::mem::size_of::<T>()
    );
}

struct WitnessPair {
    tracked w1: Witness,
    ghost w2: Witness,
}

fn main() {
    print_size::<WitnessPair>(); 
    // ^ prints "Type WitnessPair has size 8"
}
```
* Use `Ghost` and `Tracked` types for fields that you want erased in `exec` code.

That's it. Now the [cheat sheet](https://verus-lang.github.io/verus/guide/reference-var-modes.html?highlight=Tracked#cheat-sheet) in the book should make much more sense. 

>[!help] `ghost` and `track` for datatypes themselves?
>It is also possible to write the following in Verus:
>```rust
>ghost struct GhostStruct { ... }
>```
>Admittedly, I do not know what `ghost` or `tracked` does in this scenario, and I have not yet figured out any difference in a concrete example. ***Help wanted***!

# Proof By Contradiction

Most people love a bit of proof by contradiction (unless you are an [intuitionist](https://math.stackexchange.com/questions/243770/can-every-proof-by-contradiction-also-be-shown-without-contradiction), in which case, well, you do you). Good news - Verus allows you to use proof by contradiction just like you're doing your math homework.

Here is an exemplar proof of the [Pigeonhole Principle](https://en.wikipedia.org/wiki/Pigeonhole_principle):
```rust
use vstd::prelude::*;
use vstd::set_lib::*;

verus! {
proof fn pigeonhole(s: Seq<int>, m: int)
    requires
        1 <= m < s.len(),
        forall|i: int|
            0 <= i < s.len() ==> 0 <= s[i] && s[i] < m,
    ensures
        exists|i: int, j: int|
            0 <= i < j < s.len() && s[i] == s[j],
{
    if !exists|i: int, j: int| 0 <= i < j < s.len() && s[i] == s[j] {
        // Lemma from contradiction
        assert(forall|i: int, j: int| 0 <= i < j < s.len() ==> s[i] != s[j]);

        // ..follow through
        assert(s.no_duplicates());
        let set = s.to_set();
        s.unique_seq_to_set();
        assert(set.len() == s.len());
        assert(set.len() > m);

        // ..meanwhile
        assert(forall|x: int| set.contains(x) ==> 0 <= x < m);
        assert(set.subset_of(set_int_range(0, m)));
        lemma_int_range(0, m);
        lemma_len_subset(set, set_int_range(0, m));
        assert(set.len() <= m);

        // Contradiction!
        assert(false);
    }
}

}

fn main() {}
```

# Getting Mathematical

Speaking of mathematics - the code above feels much more like a mathematical proof than a normal program. Indeed, Verus allows you to do some decent mathematical reasoning with the help of appropriate lemmas from `vstd` (e.g., `lemma_int_range` is from `vstd::set_lib`; it states that a set containing integers from `lo` to `hi`, or `set_int_range(lo, hi)`, has a length of `hi - lo`).

Here we show a more involved mathematical example - computing [Euler's totient function](https://en.wikipedia.org/wiki/Euler%27s_totient_function).
## Recursive Specs

## Using `assume`

## Mathematical Lemmas 


# Iterators and `for` loops

The usage of `for` loops in Verus is documented in this [subsection](https://verus-lang.github.io/verus/guide/for.html) of the book, with a brief mention of the `iter` syntax:
```rust
for idx in iter: 0..n { ... }
/// `iter.start` - the start of the iterator
/// `iter.cur` - the current of the iterator
/// `iter.end` - the end of the iterator
/// `iter@` - all the elements that the iterator has iterated so far, as a `Seq`
```
which I believe boils down to the [`ForLoopGhostIterator`](https://verus-lang.github.io/verus/verusdoc/vstd/pervasive/trait.ForLoopGhostIterator.html) trait in the `vstd` documentation. For the case above, the actual iterator in action is [`RangeGhostIterator`](https://verus-lang.github.io/verus/verusdoc/vstd/std_specs/range/struct.RangeGhostIterator.html) which implements the `ForLoopGhostIterator` trait (you can in fact validate this by checking out how the [`View`](https://verus-lang.github.io/verus/verusdoc/vstd/view/trait.View.html) trait is implemented, corresponding to the `@` syntax).

`iter` is an alternative to the index-based `while` loop approach for writing loops in Verus, and can feel more convenient when looping over some collections. Here is how I used it to implement a loop of handler application:
```rust
// `VFS` specs (for a virtual file system) omitted

pub uninterp spec fn handler_spec(policy: Seq<char>, m: Model) -> Model;

pub open spec fn apply_policies(
    m: Model,
    policies: Seq<String>,
) -> (ret: Model)
    decreases policies.len(),
{
    let n = policies.len();
    if n == 0 {
        m
    } else {
        handler_spec(
            policies.last()@, 
            apply_policies(m, policies.subrange(0, n-1))
        )
    }
}

pub assume_specification<T> [std::mem::take] (x: &mut T) -> (ret: T)
where T: std::default::Default,
    ensures
        *old(x) =~= ret;

impl FileAdapter {
    pub fn load_policy_file(
        &self,
        Tracked(vfs): Tracked(VFS),
        m: &mut Model,
        handler: impl Fn(String, Model) -> Model,
    )
        requires
            vfs_file_exists(vfs, &self.file_path),
            vfs_file_readable(vfs, &self.file_path),
            forall |policy: String, _m: Model|
                call_requires(handler, (policy, _m)),
            forall |policy: String, _m: Model, ret: Model|
                #![auto] call_ensures(handler, (policy, _m), ret) 
                ==> ret =~= handler_spec(policy@, _m),
        ensures
            *m =~= apply_policies(
                *old(m), vfs_file_content(vfs, &self.file_path)),
{
    let file = File::open(Tracked(vfs), &self.file_path);
    let lines = file.read_lines(Tracked(vfs));
    let ghost mut lines_applied = seq![];
    
    #[verifier::loop_isolation(false)]
    for line in iter: lines
    //          ^^^^
        invariant
            *m =~= apply_policies(*old(m), iter@),
            lines_applied =~= iter@,
    {
        let _m: Model = std::mem::take(m);
        *m = handler(line, _m);
        proof {
            assert(handler_spec(line@, _m) =~= *m);
            let ghost lines_applied_post = lines@.subrange(0, iter.pos + 1int);
            assert(
                lines_applied_post.subrange(0, lines_applied_post.len()-1) =~= 
                lines_applied
            );
            assert(
                apply_policies(*old(m), lines_applied_post) ==
                handler_spec(
                    lines_applied_post.last()@, 
                    apply_policies(*old(m), lines_applied)
                )
            );
        lines_applied = lines_applied_post;
        }
    }
    assert(*m =~= apply_policies(*old(m), lines_applied));
    assert(lines_applied =~= vfs_file_content(vfs, &self.file_path));
}
```

Also note the `call_requires` and `call_ensures` clauses for specifying [higher-order functions](https://verus-lang.github.io/verus/guide/higher-order-fns.html).
# String Operations

# Specification or Implementation

# External States

# State Machines

