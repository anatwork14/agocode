# AgoCode Brand Guidelines

## 1. Brand idea

AgoCode is an **interactive algorithm notebook**: editorial enough to feel considered, technical enough to feel precise, and visual enough to make algorithm state memorable.

The brand should communicate:

- structured reasoning,
- visual learning,
- algorithmic state and progression,
- calm technical confidence,
- human teaching rather than automated answer generation.

It must not look like a generic AI startup, competitive-programming clone, neon hacker product, or enterprise dashboard.

## 2. Name

Canonical display name: **AgoCode**

Canonical machine/repository name: `agocode`

Do not introduce alternate spellings such as `AlgoCode`, `AGO Code`, or `Ago Code` unless the brand is explicitly renamed.

## 3. Logo concept

The mark is a geometric letter **A** whose crossbar is a three-node path.

The geometry encodes two ideas at once:

1. **A** — the first letter of AgoCode and a stable editorial monogram.
2. **Node path** — algorithm state moving through discrete steps.

The center node uses the signature editorial red to represent the current state / active decision. This is intentionally consistent with the product visualization grammar, where the accent highlights the currently meaningful object.

The logo is not intended to literally depict a brain, book, code bracket, or terminal. Those symbols are too generic for the product.

## 4. Canonical assets

- `/public/brand/agocode-mark.svg` — primary mark
- `/public/brand/agocode-mark-mono.svg` — monochrome/currentColor mark
- `/public/brand/agocode-logo-horizontal.svg` — horizontal lockup

The mark is the canonical favicon and compact navigation identity.

## 5. Preferred lockup

In the product UI, use the vector mark followed by the text lockup:

```text
[mark] AgoCode
```

`Ago` uses Ink and `Code` uses the signature red when color is available.

Do not compress the mark and wordmark until they visually touch. The mark must read as an independent symbol.

## 6. Color

Primary brand colors:

```text
Paper       #FCFBF7
Ink         #171717
Ago Red     #A62424
```

Secondary system colors remain defined in `DESIGN_SYSTEM.md`.

### Color priority

Preferred logo treatment on the canonical paper background:

- A geometry: Ink
- path endpoints: Paper + Ink outline
- active center node: Ago Red
- wordmark: Ink with `Code` in Ago Red

### Monochrome

Use the monochrome mark when:

- printing in one color,
- displaying inside a constrained system surface,
- using the mark as an icon mask,
- the surrounding context already provides the brand color.

## 7. Clear space

Keep at least **one center-node diameter** of empty space around the mark.

For the horizontal lockup, keep at least one mark-node diameter on all sides.

Do not allow borders, text, illustrations, or controls to enter this clear-space area.

## 8. Minimum size

Recommended digital minimums:

- mark: 20 × 20 CSS px
- normal navigation mark: 36–40 CSS px
- horizontal logo: 112 CSS px wide

For favicon use, simplify only if legibility testing shows the endpoint nodes becoming unclear. Do not redraw the symbol casually at each size.

## 9. Shape behavior

The logo should remain geometrically quiet:

- round line caps,
- no gradient,
- no glow,
- no drop shadow,
- no surrounding badge by default,
- no 3D extrusion,
- no glass treatment.

The product itself provides context; the mark does not need decorative containment.

## 10. Motion

If animated, motion must reinforce the algorithm/state idea.

Approved motion concept:

1. A geometry draws in.
2. left path node appears,
3. center active node becomes red,
4. right path node appears.

Total duration should be short and restrained (roughly 500–800 ms), and motion must be skipped for `prefers-reduced-motion`.

Do not spin, bounce, pulse continuously, or apply loading shimmer to the logo.

## 11. Relationship to product visualizations

The logo's node grammar is intentionally reusable:

- inactive state → outlined node,
- current state → red filled node,
- path → ink connection.

This connection should stay subtle. Do not force every visualization to resemble the logo.

## 12. Illustration relationship

AgoCode lessons may use original hand-drawn educational illustrations. The logo stays cleaner and more geometric so it can anchor those illustrations without competing with them.

Use this hierarchy:

```text
brand mark      precise / geometric
algorithm state precise / systematic
analogy art      human / hand-drawn
```

## 13. Forbidden treatments

Do not:

- replace the center node with a lightning bolt, brain, or AI sparkle,
- put `</>` around the mark,
- turn it into a mascot face,
- use rainbow or purple gradients,
- place the logo in a glossy rounded square by default,
- distort the A geometry,
- move nodes independently in static assets,
- recolor the red node arbitrarily,
- use scanned artwork from *Grokking Algorithms* as brand art.

## 14. Accessibility

The logo must not be the sole label for unfamiliar primary navigation. Compact icon-only use must include an accessible name.

The red node is brand emphasis, not information required to understand a UI state. Product state must always remain understandable without color alone.

## 15. Source-of-truth rule

If implementation differs from these guidelines, update this document deliberately rather than allowing one-off visual drift.
