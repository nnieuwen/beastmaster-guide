---
title: Rotation & the affinity system
status: draft
author: FC guide
updated: 2026-09-12
---

## Rotation basics

- Open with **Shield Charge** to close the gap, then run the **1-2-3 combo** (Smash Axe → Axeblade Bite → Shieldsplitter) to build TP. Use **Tempered Release** or **Borrow** depending on what your current beast is best for — you only get one of the two per summon.
- Whenever both your TP and your familiar's TP hit 100, combo **Trick** into an axe skill, moving **clockwise** around the affinity wheel, to bank a Mastered Instinct diamond. At two diamonds, one more combo grants the third; then **Rally** and close with the opposite Sunstrider / Moonstalker action (the 250-TP versions of the axes — see the box above the wheel).
- Use **Parting Blow** right before swapping horns, never as generic filler. Use **Rallying Cheer** when it lines up — especially to double up Trick usage across a beast swap.

Full rotation and openers: [Icy Veins — Beastmaster DPS rotation, openers and abilities](https://www.icy-veins.com/ffxiv/beastmaster-pve-dps-rotation-openers-abilities).

## Instinctual combos (the affinity system)

Chaining instinctual skills — your axes and your beast's Trick — builds a combo. From the **second hit onward**, each hit deals bonus damage equal to

> that hit's damage × combo multiplier × interaction multiplier

**Combo multiplier** scales with combo length:

| Combo length | Multiplier |
|---|---|
| 2 hits | 1.0× |
| 3 hits | 1.5× |
| 4 hits | 2.0× |
| 5 hits | 2.5× |
| 6+ hits | 3.0× |

**Interaction multiplier** depends on how the new skill's affinity relates to the current one:

| Interaction | Multiplier | When it triggers |
|---|---|---|
| **Infinitive** | 2.0× | a Sunstrider skill during Moonstalker affinity, or vice versa |
| **Intentional** | 1.5× | a skill whose affinity sits *clockwise* on the compass from the current one — or a Sunstrider/Moonstalker skill that doesn't trigger Infinitive |
| **Instinctual** | 1.2× | any other non-Sunstrider/Moonstalker skill that doesn't trigger Intentional |

Once an **Infinitive** interaction fires the combo can't be extended. Intentional and Instinctual hits chain indefinitely as long as you have the resources.

### Worked example

Red Trick (A) → Green Axe (B) → Red Trick (C) → Moon Axe (D):

- **B** is *Instinctual* — green isn't clockwise of red → 1.0 × 1.2 = **1.20×** B's damage.
- **C** is *Intentional* — red is clockwise of green, and it produces Sunstrider affinity → 1.5 × 1.5 = **2.25×** C's damage.
- **D** is *Infinitive* — Moonstalker played into Sunstrider → 2.0 × 2.0 = **4.00×** D's damage, and the combo ends there.

Video breakdown: [Beastmaster Infinitive Combo Demonstration — Gwen Nitsah](https://www.youtube.com/watch?v=88tW6EKLgYM).
