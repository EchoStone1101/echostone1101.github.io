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
# Ghost and Tracked States

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

>[!info] TODO: `arbitrary()`


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

