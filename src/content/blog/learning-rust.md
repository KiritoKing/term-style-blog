---
title: Rewriting everything in Rust
date: "2026-02-15"
category: Tech
tags: ["rust", "programming"]
description: A quick story about embracing Rust and the benefits that followed.
---

It finally happened. I succumbed to the crab. Here is my journey of rewriting my side projects in Rust.

The borrow checker is notoriously difficult to grasp at first, but once it clicks, it feels like you have a superpower. No more null pointer dereferences, no more data races. Just pure, unadulterated performance and safety.

```rust
fn main() {
    println!("Hello, world!");
}
```

I started by porting a small CLI tool I wrote in Node.js. The performance difference was staggering. What used to take 500ms now takes 12ms. I am officially a Rustacean.
