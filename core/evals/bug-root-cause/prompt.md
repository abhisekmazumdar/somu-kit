---
runs: 2
max_turns: 4
allowed_tools: [Skill, Read, Glob, Grep]
tags: [trigger]
---

Our checkout page throws "Cannot read properties of undefined (reading 'price')" when the cart has a removed product. A teammate wants to add `if (!item) return;` in the render loop. How should I fix it?
