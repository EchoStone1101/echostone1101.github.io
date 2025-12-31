---
draft: true
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

>[!info] P.S.
>Turns out that `vstd` also provides the [`arbitrary()`](https://verus-lang.github.io/verus/verusdoc/vstd/pervasive/fn.arbitrary.html) function, which produces an uninterpreted value of any type.

# `ghost` and `tracked`

The concept of [function modes](https://verus-lang.github.io/verus/guide/modes.html) (i.e., `spec`, `proof`, and `exec`) in Verus is rather straightforward to understand. Basically, `spec` and `proof` are for "ghost" code that gets erased during compilation, and `exec` is for your normal executable Rust code. Further, the distinction between `spec` and `proof` is clear if you realize Verus proofs are just instructions to an underlying SMT solver - both modes represent pure mathematical functions, while only the `proof` mode is allowed to have "side effects" on the SMT solver states, like introducing an axiom by calling a lemma.

This is not the case for [variable modes](https://verus-lang.github.io/verus/guide/reference-var-modes.html#cheat-sheet) (i.e., `ghost` and `tracked`; also, the `Ghost` and `Tracked` types), which are mentioned [here](https://verus-lang.github.io/verus/guide/syntax.html), [here](https://verus-lang.github.io/verus/state_machines/intro.html), and [here](https://www.andrew.cmu.edu/user/bparno/papers/hance_thesis.pdf), but are never given an upfront and complete explanation (the book has referred to `tracked` as "an advanced feature"; indeed, that last link I provided is a Ph.D. thesis!). Worse is the fact that the naming of the `ghost` mode also collides with the more familiar term "ghost" code - yet they mean different things! 

Here is my best attempt at a full description of these concepts:

### `tracked` is an opt-in choice

The one-liner answer for the difference between `ghost` and `tracked`: **`tracked` is `ghost` but lifetime-checked**; or if you have background knowledge in type theories, **`tracked` is for linear `ghost` types** (hence its usage in [concurrency verification](https://verus-lang.github.io/verus/state_machines/intro.html)).
Every variable in a `spec` or `proof` function, including the input and return parameters, is `ghost` by default (indeed, these are "ghost" code), and you may optionally mark one as `tracked` so that Rust's lifetime checking is enabled. Eventually, both `ghost` and `tracked` variables are erased in compilation.

To see this in action:
```rust
// Does *not* implement `Copy` (nor `Clone`)
struct Witness();

proof fn test_tracked(tracked w: Witness) -> (Witness, Witness) {
	(w, w)
}
```
Running this through Verus will produce:
```txt
error[E0382]: use of moved value: `w`
```

In short, making a variable `tracked` in `proof`-mode code brings back Rust's classical ownership rules. Otherwise, in the example above, `w` will be `ghost` by default, and it is then OK to duplicate `w` at well.

By the way, `tracked` is only allowed in `proof`- or `exec`-mode code, whereas in `spec`-mode all variables are always (implicitly) `ghost`. See [this table](https://verus-lang.github.io/verus/guide/reference-var-modes.html?highlight=tracked#variable-modes-and-function-modes) from the book.

>[!info] Maintaining linearity
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

OK, but what about

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

In practice, I find the `iter` syntax to be much more convenient than an index-based `while` loop approach, especially when I'm looping over some collections. Here is how I used it to implement a loop of handler application:
```rust
// TODO
```

# Proof By Contradiction


# Getting Mathematical

## Recursive Specs

## Using `assume`

## Mathematical Lemmas 

# String Operations

# Specification or Implementation

# External States

# State Machines

