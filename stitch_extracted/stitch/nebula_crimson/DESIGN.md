# Design System Specification

## 1. Overview & Creative North Star
This design system is built upon the Creative North Star of **"The Hyper-Lucid Fluid."** 

We are moving away from the rigid, boxy constraints of traditional academic software. Instead, we are creating a digital environment that feels like a high-end editorial experience—fluid, immersive, and premium. The layout rejects the "template" look by utilizing intentional asymmetry, overlapping glass surfaces, and a massive scale for typography. By treating the UI as a series of translucent layers suspended over a dynamic, liquid background, we create a sense of depth that feels visceral rather than functional.

## 2. Colors & Surface Philosophy
The palette is rooted in the contrast between the deep, infinite **Space Charcoal** and the high-energy **Mars Red**.

### The "No-Line" Rule
To maintain a premium editorial feel, **1px solid borders for sectioning are strictly prohibited.** Boundaries must be defined through tonal shifts or backdrop blur density. A section ends where the surface color shifts from `surface_container_low` to `surface_container_highest`, not where a line is drawn.

### Surface Hierarchy & Nesting
Hierarchy is achieved through "Stacking." Think of the UI as physical sheets of frosted glass.
- **Base Layer:** `surface` (#11131A).
- **Secondary Tier:** `surface_container_low` for large grouping areas.
- **Interactive Tier:** `surface_container_highest` with `rgba(255,255,255,0.05)` and a 30px backdrop-blur for primary interactive cards.

### The Glass & Gradient Rule
All floating components must utilize **Glassmorphism**. 
- **Backdrop Blur:** 25px to 40px.
- **Surface Fill:** `rgba(255,255,255,0.05)`.
- **Signature Glow:** Main actions and hero elements should utilize a radial gradient transition from `primary` (#FF3B3B) to `primary_container`. This provides a "soul" to the UI that flat color cannot replicate.

## 3. Typography
We use **Manrope** for its clean, technical yet approachable geometric structure. The typography hierarchy is designed to feel like a premium magazine.

- **Display (Large/Medium):** Reserved for hero moments (e.g., "Ready to join?"). Use tight letter-spacing (-0.02em) and high contrast against the liquid background.
- **Headline & Title:** Used to anchor glass cards. These should always be `#FFFFFF` to ensure readability over the red radial gradients.
- **Body & Labels:** Use `body-md` for general metadata. Use `Text Secondary` (#9CA3AF) for non-essential information to pull focus toward primary interactions.

## 4. Elevation & Depth
In this design system, depth is a functional tool, not a decoration.

### The Layering Principle
Instead of traditional drop shadows, stack tokens. Place a `surface_container_lowest` card inside a `surface_container_high` section to create a "recessed" or "inset" look.

### Ambient Shadows
When an element must float (like a video call control bar), use an **Ambient Glow** instead of a shadow.
- **Color:** A tinted version of `primary` (#FF3B3B) at 8% opacity.
- **Blur:** 40px - 60px.
- **Effect:** This mimics the way a red light would bleed through frosted glass in a physical space.

### The Ghost Border
If an interface requires an edge for accessibility, use a **Ghost Border**:
- **Stroke:** 1.5px.
- **Color:** `outline_variant` at 15% opacity.
- **Rule:** Never use 100% opaque borders.

## 5. Components

### Glowing Action Buttons
The primary interaction point.
- **Background:** `primary` (#FF3B3B).
- **Shape:** `xl` (3rem) roundedness for a pill-like, organic feel.
- **Effect:** An inner "light sweep" (a 10% white linear gradient at 45 degrees) and a pulsing red shadow (`surface_tint`) to indicate the app's "live" nature.

### Glass Video Cards
- **Corner Radius:** `lg` (2rem) minimum.
- **Reflection:** A subtle 1px top-left highlight using `rgba(255,255,255,0.12)`.
- **Content:** Forbid divider lines. Use `vertical white space` (24px-32px) to separate the participant's name from call metadata.

### Inputs & Fields
- **State:** Active inputs should lose their background and gain a `primary` ghost border.
- **Style:** Text should be `title-md`. Helper text should be `label-md` in `Text Secondary`.

### Fluid Chips
- **Usage:** Used for "Interests" or "Major" tags.
- **Style:** Semi-transparent `surface_variant` with `full` roundedness. No borders.

## 6. Do's and Don'ts

### Do:
- **Do** overlap glass cards slightly to emphasize the `backdrop-filter` effect.
- **Do** use the liquid background’s red radial gradients to "point" toward the primary CTA.
- **Do** use `display-lg` for empty states to create a bold, editorial look.

### Don't:
- **Don't** use pure black (#000000). Use `surface_container_lowest`.
- **Don't** use standard 4px or 8px border radii. This system demands the "Liquid" feel of `24px+`.
- **Don't** use high-contrast dividers. If you feel the need for a line, increase the padding instead.
- **Don't** place red text on a red gradient. All text on colored surfaces must be `on_primary` or pure white.