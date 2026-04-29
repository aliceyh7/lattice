# Day 1: Rebuilding the Foundations Beneath Machine Learning

*Autograd, prefix sums, vectors, and compiled languages all point to the same lesson: abstractions are only useful when I understand what they are hiding.*

Today was the first day of a more structured learning plan, and it felt slower than I expected.

But looking back at the notes, the slowness makes sense. Almost everything I touched was foundational:

- How gradients move through computations
- How ranges can be counted efficiently
- How vectors can represent both geometry and data
- How programming languages turn source code into something a machine can execute

I was not learning a new model architecture or reading a production recommender systems paper yet. I was rebuilding the primitives underneath that future work.

That is slower work, but it compounds.

## 1. Micrograd: Backprop Is Less Mysterious Than It Looks

The main ML topic today was the beginning of Andrej Karpathy's micrograd walkthrough.

The biggest takeaway:

> Backpropagation is less magical than I expected.

Micrograd is an automatic gradient engine. In practical terms, it is a small software system that calculates derivatives of a function, usually a loss function, with respect to model parameters.

The core question is simple:

> If I change one input slightly, how does the output change?

That is the derivative: the slope, or rate of change.

In neural networks, this matters because the model needs to know how each parameter contributed to the loss. Backpropagation moves backward through the computation and calculates those contributions using the chain rule.

Micrograd makes this feel approachable because it is built around a small number of pieces:

- `engine.py`: the core autograd engine
- `nn.py`: neural network components like `Neuron`, `Layer`, and `MLP`
- `Value`: the core object that stores data and tracks how each value was produced

The `Value` object is the key abstraction. It represents a number, but also remembers the operation that created it. That makes it possible to walk backward through the graph and compute gradients.

Before today, backpropagation felt like a large framework feature.

After today, it feels more like careful bookkeeping over arithmetic operations.

## 2. LeetCode: Sliding Window Is Not Always the Right Hammer

For the Python drill, I worked on **Subarray Sum Equals K**.

My first instinct was to use a sliding window. That instinct was wrong.

The issue is negative numbers.

Example:

    nums = [1, -1, 1]
    k = 1

A sliding window approach relies on the window sum moving predictably as the window expands or shrinks.

That works when all numbers are positive:

- Adding a number increases the sum.
- Removing a number decreases the sum.

But with negative numbers, that monotonic behavior disappears.

The correct approach is:

    prefix sum + hashmap

The idea:

1. Keep a running prefix sum.
2. Store how often each prefix sum has appeared.
3. At each position, ask whether there was a previous prefix sum that would make the current subarray sum to `k`.

If the current prefix sum is `current`, then we want a previous prefix sum equal to:

    current - k

This reframes the problem.

Instead of asking, "How do I move this window?" the better question is:

> How many previous states would make the current state valid?

My takeaway:

> Use prefix sums and hashmaps when a range condition can be written as a relationship between the current state and some previous state.

That pattern feels important beyond this one problem. It shows up whenever the task is about counting ranges, pairs, intervals, or accumulated state.

## 3. Linear Algebra: A Vector Is Both Geometry and Data

I also started 3Blue1Brown's *Essence of Linear Algebra* with the first episode on vectors.

The useful part was seeing the dual interpretation:

- In physics, a vector is often a length plus a direction.
- In computer science, a vector is often an ordered list of numbers.

Those are not conflicting definitions. They are two views of the same object.

A vector like `[3, 2]` can be understood as:

- A point
- An arrow
- A movement
- A pair of coordinates
- An ordered list of numbers

Vector addition can be understood geometrically as taking one step and then another.

This matters for machine learning because so much of ML is built on vector representations:

- Embeddings
- Feature vectors
- Gradients
- Activations
- Parameters

These are easier to reason about when vectors are not just "arrays of numbers," but objects with structure and interpretation.

Today was only the first step, but it set up the mental model:

> Vectors are not just containers. They represent movement, direction, and relationships.

## 4. C++: Source Code Is Not the Program Yet

The C++ reading was introductory, but useful because it clarified the path from code to execution.

A computer program is a sequence of instructions that tells hardware what to do.

At the lowest level, those instructions are represented in machine language: sequences of bits specific to a CPU family like x86 or ARM64.

High-level languages like C++ sit far above that. They are written for humans first, then translated for machines.

The pipeline looks roughly like this:

    C++ source code
    -> compiler
    -> object files
    -> linker
    -> executable
    -> hardware runs the program

The compiler checks whether the source code follows the rules of C++, then translates it into machine instructions stored in object files.

The linker combines object files and libraries, resolves dependencies, and produces the final executable.

This helped me separate a few concepts that are easy to blur together:

- A source file is not an executable.
- Compiling and linking are different phases.
- Libraries are connected into the final program through the build process.
- C++ gives more control over memory and performance than many higher-level languages.

That control is why C++ shows up in performance-sensitive areas:

- Video games
- Real-time systems
- High-frequency trading
- AI infrastructure
- Productivity applications

The first C++ program was simple:

    #include <iostream>

    int main() {
        std::cout << "Here is some text.";
        return 0;
    }

But even this tiny example depends on the compiler, linker, standard library, and runtime environment.

## 5. The Common Theme: Understanding the Layer Below

The surprising thing about Day 1 is that the topics looked unrelated:

- Automatic differentiation
- Prefix sums
- Vectors
- Compiled languages

But they all pointed to the same idea:

> Understand the layer below the abstraction.

Autograd is easier to understand when I see the chain rule and computation graph underneath.

A LeetCode pattern is easier to apply when I understand why sliding window fails and prefix sum works.

Vectors are more useful when I can move between the geometric and data-structure interpretations.

C++ is less mysterious when I understand what compilation and linking actually do.

That makes today feel less like "slow introductory material" and more like foundation repair.

## Final Takeaway

Day 1 was not about speed.

It was about lowering the mystery around core tools.

Backpropagation became a little less magical. Prefix sums became a more precise pattern. Vectors became more than lists. C++ became less like a black box between code and execution.

The pace should pick up later, but this kind of slow work matters because these are the concepts everything else will lean on.
