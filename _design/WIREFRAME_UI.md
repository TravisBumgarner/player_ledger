# Wireframe UI — global design language

This is the house style for **every screen** in this product from now on. It replaced an earlier dark themed direction; do not reintroduce that. New screens are authored in this language first, and only leave it when the team explicitly decides to skin a screen.

## Why
It is a deliberately low-chroma, hairline-and-label style: greyscale, one type family, thin borders, no rounded corners, no shadows except on floating layers, no brand color. It keeps arguments about the design on structure, hierarchy, and what information a screen owes the user — which is where the value is while the product's information model is still moving.

## Rules

1. **Greyscale only.** No hue anywhere except the reserved alert grey-red, used for genuinely urgent numbers and destructive items. Nothing else gets color. The alert is a **ramp of that one hue**, not one value: a tint at surface weight, the mark itself, and a step past it — so a warning can be layered on itself (a control standing on a warning band, a destructive verb hovering) without borrowing a grey or reaching for a second hue.
2. **One family throughout.** Source Sans 3, 400/500/600. Uppercase + wide tracking for labels; sentence case for content. It replaced IBM Plex Mono, which the app declared but never loaded — every screen was drawn in the platform's default monospace rather than the one named here.
3. **Hairline borders instead of fills.** `1px solid` at rest; `1.5px solid #6e6e68` to promote something (a promoted card, the active input, a modal). Border weight is the primary emphasis tool.
4. **Square corners.** `border-radius` is 0 everywhere except avatars (50%) and small annotation chips (4px).
5. **One filled button per screen.** `background #3c3c38`, text `#fbfbfa`, uppercase, 600. Everything else is an outlined button (`#f0f0ed` on `1px #9a9a94`) or a text link with a `1px #b4b4ae` underline.
6. **Images are striped placeholders.** `repeating-linear-gradient(135deg, #ececE8 0 7px, #e0e0db 7px 14px)` with a small tracked caption on a `#ffffffd9` chip saying what belongs there. Never draw illustrative SVG.
7. **Icons are outlined boxes.** A `1px #9a9a94` box on `#e4e4e0`, sized to the real icon's footprint. Do not substitute real icons while in wireframe.
8. **Segmented controls, not dropdowns,** for 2–3 mutually exclusive options: a bordered row, active segment filled `#3c3c38`/`#fbfbfa`, inactive transparent/`#5c5c57`, `1px #cfcfc9` between segments.
9. **State is shown, not implied.** Every list item carries its own status badge, counts, and recency. A row that is only a name is a bug.
10. **Object actions live on the object** — right-click and a `···` affordance on every card/row, opening the same menu, with no exceptions: a row showing an object somebody else owns still shows that object's menu, and `···` never means anything but the menu. Destructive items sit last, prefixed by a rule, in the alert grey. `Archive` always appears above `Delete`. Labels carry no trailing `…`.
11. **Numbered annotations** below each frame, `01`, `02`, … in `#8a8a85`, explaining the reasoning. These are part of the deliverable, not scaffolding.

## Tokens

| Token | Hex | Use |
|---|---|---|
| desk | `#e8e8e6` | page background around a frame |
| surface | `#fbfbfa` | frame background |
| surface alt | `#f7f7f4` | secondary cards, row hover |
| surface sunken | `#f4f4f1` / `#f0f0ed` | control tracks, outlined buttons, menu hover |
| white | `#ffffff` | cards, inputs, tables |
| placeholder stripes | `#ececE8` / `#e0e0db` | image stand-ins |
| border strong | `#6e6e68` | promoted borders, menus, modals |
| border | `#b4b4ae` | frame + card borders |
| border light | `#cfcfc9` | internal dividers, controls |
| border faint | `#e4e4e0` / `#ececE8` / `#dcdcd6` | in-card rules, dormant cards, section rules |
| ink | `#1c1c1a` | primary text |
| ink filled | `#3c3c38` | filled buttons, active segments, live dots |
| text body | `#5c5c57` | annotations, secondary controls |
| text muted | `#77776f` | metadata |
| text faint | `#8a8a85` | uppercase labels, counts |
| text ghost | `#a0a099` / `#a8a8a2` | input placeholders, carets, dashed borders |
| alert tint | `#f2e2de` | a hovered destructive row, a field that failed |
| alert | `#8a3c30` | urgent counts, destructive items |
| alert strong | `#6d2d23` | what a filled alert hovers to |
| alert band | `#8a3c30` ground / `#fbfbfa` ink | a warning across a surface |
| alert band raised | `#a4503f` / `#b85e4c` hover | a control standing on that band |
| scrim | `#dededbe6` | modal backdrop |
| crop scrim | `#e8e8e6bf` | the part of a picture a crop leaves out |

**Type scale** — 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 16, 18, 20, 24px. Uppercase labels carry `letter-spacing` `.06em`–`.16em`; headings 18px+ carry `-0.01em`.

**Spacing** — 2, 3, 5, 6, 8, 9, 10, 11, 12, 13, 14, 16, 18, 20, 22, 26, 30, 34, 40px.

**Shadows** — floating layers only: menus `0 10px 26px #0000001f`, modals `0 16px 40px #00000026`.

## Applying it to future work
Any queued screen should be wireframed in this language before any visual design happens. Reuse the tokens above verbatim so frames from different sessions sit next to each other without drift.

## Dark

The language survives inversion because its emphasis tool is **border weight, not
colour** — a `1.5px` border promotes something on either ground. So dark is a
value flip, not a second design: same rules, same scales, same hierarchy.

Derived here rather than in the original handoff. **The relationships are the
specification, not the hexes** — if a value needs adjusting, keep the steps
between neighbours rather than matching a number.

| Token | Light | Dark |
|---|---|---|
| desk | `#e8e8e6` | `#0d0d0c` |
| surface | `#fbfbfa` | `#151513` |
| surface alt | `#f7f7f4` | `#1a1a18` |
| surface sunken | `#f4f4f1` / `#f0f0ed` | `#100f0e` / `#1e1e1b` |
| white (cards, inputs) | `#ffffff` | `#191917` |
| placeholder stripes | `#ececE8` / `#e0e0db` | `#212120` / `#1a1a19` |
| border strong | `#6e6e68` | `#8f8a80` |
| border | `#b4b4ae` | `#4a4842` |
| border light | `#cfcfc9` | `#39382f` |
| border faint | `#e4e4e0` / `#ececE8` / `#dcdcd6` | `#2a2925` / `#242320` / `#302f29` |
| ink | `#1c1c1a` | `#eae7df` |
| ink filled | `#3c3c38` | `#ddd8cd` |
| text body | `#5c5c57` | `#c2bcb1` |
| text muted | `#77776f` | `#a29c91` |
| text faint | `#8a8a85` | `#8a8579` |
| text ghost | `#a0a099` / `#a8a8a2` | `#6f6a60` / `#65605a` |
| alert tint | `#f2e2de` | `#3a221c` |
| alert | `#8a3c30` | `#c98168` |
| alert strong | `#6d2d23` | `#e2a08a` |
| scrim | `#dededbe6` | `#080807e6` |
| crop scrim | `#e8e8e6bf` | `#0d0d0cbf` |

Three things the flip is not:

- **The filled button inverts fully.** Light is dark-on-light (`#3c3c38` /
  `#fbfbfa`); dark is light-on-dark (`#ddd8cd` / `#151513`). It stays the one
  filled thing on the screen either way.
- **Alert lifts rather than inverting.** `#8a3c30` is nearly black on a dark
  ground. `#c98168` keeps the same "muted brick" reading at a legible value. It
  is still the only hue in the language — and its ramp steps away from the
  ground rather than always downward: `alert strong` is deeper in light and
  brighter in dark, because in both it is the step further from what it sits on.
  The band is the exception to the flip: a warning is the same dark red with the
  same light ink in either scheme, since a warning that changes colour with the
  reader's theme is two warnings to design.
- **Shadows stay, and matter more.** A dark surface separates from a dark
  backdrop less than a white one does from grey, so the menu and modal shadows
  are load-bearing rather than decorative.

Everything else holds unchanged: one family, hairlines, square corners, one filled
button, striped placeholders, state shown rather than implied.

## Standing deviations

Decided after this document was written. Everything not listed here still applies.

### Icons are real, not boxes

**Overrides rule 7.** Use `@mui/icons-material`, chosen for legibility rather than
for style. Three identical grey boxes on one row are distinguishable only by
tooltip, and the cost landed harder in use than on paper.

Provisional in the *choice*, not in the decision: which icon means which verb is
open and will be revisited. That icons are real is settled — do not return them
to outlined boxes when reading rule 7.
