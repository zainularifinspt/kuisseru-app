---
name: Luminous Academy
colors:
  surface: '#fbf8ff'
  surface-dim: '#d9d9e7'
  surface-bright: '#fbf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f2ff'
  surface-container: '#ededfb'
  surface-container-high: '#e7e7f5'
  surface-container-highest: '#e1e1ef'
  on-surface: '#191b25'
  on-surface-variant: '#434656'
  inverse-surface: '#2e303a'
  inverse-on-surface: '#f0effe'
  outline: '#737688'
  outline-variant: '#c3c5d9'
  surface-tint: '#004ced'
  primary: '#003ec7'
  on-primary: '#ffffff'
  primary-container: '#0052ff'
  on-primary-container: '#dfe3ff'
  inverse-primary: '#b7c4ff'
  secondary: '#6b38d4'
  on-secondary: '#ffffff'
  secondary-container: '#8455ef'
  on-secondary-container: '#fffbff'
  tertiary: '#425400'
  on-tertiary: '#ffffff'
  tertiary-container: '#576e00'
  on-tertiary-container: '#c5f600'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b7c4ff'
  on-primary-fixed: '#001452'
  on-primary-fixed-variant: '#0038b6'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d0bcff'
  on-secondary-fixed: '#23005c'
  on-secondary-fixed-variant: '#5516be'
  tertiary-fixed: '#c3f400'
  tertiary-fixed-dim: '#abd600'
  on-tertiary-fixed: '#161e00'
  on-tertiary-fixed-variant: '#3c4d00'
  background: '#fbf8ff'
  on-background: '#191b25'
  surface-variant: '#e1e1ef'
  electric-blue: '#0052FF'
  soft-violet: '#8B5CF6'
  cyber-lime: '#CCFF00'
  deep-obsidian: '#0A0A0A'
  mesh-pink: '#FF00E5'
typography:
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-bold:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  quiz-option:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '500'
    lineHeight: '1.4'
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

The design system is a "Future-Edu" framework that bridges the gap between structured Bauhaus geometry and the ethereal, fluid aesthetics of the Google Gemini era. It is designed specifically for K-12 students, aiming to transform the classroom from a static environment into a vibrant, high-energy gaming arena.

The core personality is **Intelligently Playful**. It maintains the authority of an educational tool through bold lines and Space Grotesk's technical precision, but softens the experience with "ethereal glow" layers and mesh gradients. This evokes a sense of limitless potential and digital magic, keeping students engaged and motivated during competitive sessions.

The design style is a hybrid of **Minimalism** (for focus) and **Glassmorphism** (for depth), characterized by:
- Clean, stark white backgrounds that provide a "laboratory" feel.
- Vibrant, multi-color mesh gradients that suggest energy and movement.
- High-contrast black borders and text to ground the airy visual effects.
- A "Pill" shape language that removes sharp edges, making the UI feel approachable and friendly.

## Colors

The palette is anchored by high-saturation "Gemini" hues. **Electric Blue** serves as the primary action color, providing a sense of reliability and tech-forwardness. **Soft Violet** is used for secondary elements and transitions, while **Cyber Lime** acts as a high-impact accent for success states, "Correct" answers, and progress indicators.

The background is a clinical white to ensure maximum readability, but it is frequently interrupted by translucent mesh gradients. These gradients should blend Electric Blue, Soft Violet, and a hint of Mesh Pink to create a "digital nebula" effect behind cards and modals. To maintain the Bauhaus influence, all text and structural borders should use **Deep Obsidian** to ensure high-contrast accessibility.

## Typography

The typography strategy emphasizes the "Future-Edu" vibe through a mix of technical character and extreme legibility. 

**Space Grotesk** is used for all display and label roles. Its geometric, slightly quirky terminals provide the "playful" edge required for a student-centric app while referencing the Bauhaus love for industrial geometry. Headlines should use tight letter-spacing and bold weights to command attention.

**Inter** is utilized for body text and long-form descriptions. It provides a neutral, highly readable counterpoint to the expressive headlines, ensuring that quiz questions and instructions are consumed without friction. 

For the "Leaderboard" and "Live Score" numbers, use Space Grotesk with tabular figures to ensure numbers align perfectly during real-time updates.

## Layout & Spacing

The layout follows a **Fluid Grid** model with generous white space to allow the mesh gradients to "breathe." 

- **Mobile (Siswa):** A single-column flow with 16px margins. Elements like quiz options should be stacked vertically with 12px gaps for easy thumb-tapping.
- **Desktop (Guru Dashboard):** A 12-column grid. The dashboard uses a "modular tile" approach where real-time stats and the leaderboard occupy distinct cards that can reflow based on screen width.

Spacing follows an 8px base unit. To maintain the Bauhaus aesthetic, use consistent padding (24px or 32px) within cards to create a sense of structural integrity. Use "Airy" margins between sections to ensure the UI never feels cluttered, even when high-energy animations are occurring.

## Elevation & Depth

This design system eschews traditional shadows in favor of **Tonal Layers and Ethereal Glows**.

Depth is created through:
1.  **Backdrop Blurs:** Modals and "floating" elements use a high-saturation blur (20px-40px) that catches the colors of the mesh gradients beneath them.
2.  **Inner Glows:** Instead of drop shadows, active elements (like a selected quiz answer) feature a subtle inner glow in the primary color (Electric Blue).
3.  **Bauhaus Outlines:** All containers have a crisp 2px border in Deep Obsidian. When an element is "elevated," the border thickness might increase to 4px, rather than adding a shadow.
4.  **Luminescent States:** Critical UI elements like the "Start Quiz" button emit a soft outer glow in Cyber Lime, suggesting they are "powered on."

## Shapes

The shape language is dominated by the **Pill (ROUND_FULL)**. This is a departure from traditional Bauhaus squares, intended to make the interface feel safe and modern for younger users.

- **Buttons & Inputs:** Must always be fully rounded (pill-shaped).
- **Cards:** Use the `rounded-xl` (1.5rem / 24px) setting to create a friendly, "container" look that feels like a modern gadget.
- **Icons:** Should be housed in circular containers with vibrant background colors to mimic "game tokens."

## Components

### Buttons
Buttons are the primary interactive element. They are fully pill-shaped, using Electric Blue for primary actions and Deep Obsidian for secondary actions. They feature a "tactile" hover state: a subtle scale-up (1.05x) and a glowing border.

### Quiz Choice Cards
These are the heart of the student experience. Each card has a thick 2px black border, a white background, and a unique geometric glyph (Triangle, Circle, Square, Star) in the corner. Upon selection, the card fills with a gradient of the primary color and the border thickens.

### Progress Bars
Horizontal bars with a Cyber Lime fill. The "track" of the progress bar should be a semi-transparent version of the fill color, emphasizing the glassmorphic theme.

### Chips & Badges
Small, fully rounded pills used for "Subject" tags or "Live" indicators. They use a high-contrast black background with Cyber Lime or Electric Blue text.

### Leaderboard Rows
Rows should be semi-transparent glass panels. The "Top 3" students get special treatment with mesh-gradient backgrounds and an enlarged "Pill" avatar frame.

### Input Fields (Nickname)
Clean, oversized pill-shaped inputs with Space Grotesk text. The focus state replaces the black border with a vibrant Electric Blue glow.