# Aetherquill Style Guide

Aetherquill is a high-fantasy, story-generating engine with mechanical overtones. This guide defines the project’s visual, UI, and content style in modular components.

## 1. Visual Overview

Before diving into specifics, here's a visual overview of the key elements of the Aetherquill style:

| Element          | Description                                                   | Example                                                                   |
|------------------|---------------------------------------------------------------|---------------------------------------------------------------------------|
| **Color Palette** | Defines the primary colors used throughout the UI and branding. | See the "Color Palette" section below.                                   |
| **Typography**    | Specifies the fonts used for headings, body text, and special elements. | See the "Typography" section below.                                    |
| **Imagery**        | Illustrates the types of images and visual motifs to use.       | Celestial motifs, gears, clockwork shapes subtly incorporated into UI elements. |

## 2. Color Palette
Objective: Define a consistent color scheme for the UI and branding.

Color Definitions:

| Name          | Hex Code | Use                                                   | Visual Example |
|---------------|----------|-------------------------------------------------------|----------------|
| Deep Indigo   | `#2B2D42` | Backgrounds, primary text, headers                   | ![Deep Indigo Color](https://via.placeholder.com/20x20/2B2D42/FFFFFF?text=) |
| Aether Teal   | `#519CA6` | Buttons, highlights                                   | ![Aether Teal Color](https://via.placeholder.com/20x20/519CA6/FFFFFF?text=) |
| Runic Gold    | `#D4AF37` | Decorative borders, icons                            | ![Runic Gold Color](https://via.placeholder.com/20x20/D4AF37/000000?text=) |
| Forged Iron   | `#707070` | Text dividers, hover effects                          | ![Forged Iron Color](https://via.placeholder.com/20x20/707070/FFFFFF?text=) |

```json
{
  "primary": {
    "name": "Deep Indigo",
    "hex": "#2B2D42",
    "use": ["backgrounds", "text", "headers"]
  },
  "secondary": {
    "name": "Aether Teal",
    "hex": "#519CA6",
    "use": ["buttons", "highlights"]
  },
  "accent_gold": {
    "name": "Runic Gold",
    "hex": "#D4AF37",
    "use": ["decorative borders", "icons"]
  },
  "accent_gray": {
    "name": "Forged Iron",
    "hex": "#707070",
    "use": ["text dividers", "hover effects"]
  }
}
```

### Directive:
* Use primary as the default background.
* Use secondary for buttons and important action elements.
* Accent with Runic Gold for status indicators or UI flourishes.
* Use secondary for buttons and important action elements.
* Accent with Runic Gold for status indicators or UI flourishes.

## 3. Typography
Objective: Establish fonts for headings, body text, and special elements.

Font Definitions:

| Font Name          | Type       | Use                                          | Example Text          |
|-------------------|------------|----------------------------------------------|-----------------------|
| Cinzel            | Serif      | Page titles, section headings                | `<h1>Aetherquill</h1>` |
| Quattrocento Sans | Sans-serif | Paragraphs, tooltips, instructions           | `This is body text.`  |
| Great Vibes       | Handwritten| Quotes, story titles                         | `“Aetherquill Quote”` |

```json
{
  "header_font": {
    "name": "Cinzel",
    "type": "serif",
    "use": ["page titles", "section headings"],
    "fallback": ["Times New Roman", "serif"]
  },
  "body_font": {
    "name": "Quattrocento Sans",
    "type": "sans-serif",
    "use": ["paragraphs", "tooltips", "instructions"],
    "fallback": ["Arial", "sans-serif"]
  },
  "special_elements_font": {
    "name": "Great Vibes",
    "type": "handwritten",
    "use": ["quotes", "story titles"],
    "fallback": ["cursive", "serif"]
  }
}
```

### Directive:
* Apply Cinzel to all headers using h1, h2, and h3 tags.
* Use Quattrocento Sans for all paragraph text.
* Use Great Vibes sparingly for quotes and unique headings.

## 4. Logo Design
Objective: Create a logo to reflect the magical-mechanical theme of Aetherquill.

**Logo Concept:**
* A quill with trailing aether ink, forming arcane runes or spirals.
* A celestial quill resting on an ancient mechanical gear.

### Directive:
* Ensure the logo scales from 32x32px (favicon) to 1024x1024px (high-res).
* Provide SVG and PNG formats.
* Implement color variations:
  * Primary color scheme (Deep Indigo + Runic Gold).
  * Monochrome version for dark/light backgrounds.

## 5. UI Component Style
Objective: Define visual behaviors for buttons, backgrounds, dividers, and hover states.

**Backgrounds:**
* Use a parchment-like texture or solid Deep Indigo for page backgrounds.

Buttons:
```json
{
  "default": {
    "background": "#519CA6",
    "border_radius": "8px",
    "padding": "10px 16px",
    "text_color": "#FFFFFF"
  },
  "hover": {
    "background": "#D4AF37",
    "effect": "pulse"
  },
  "active": {
    "background": "#707070",
    "effect": "slight-shimmer"
  }
}
```

Directive:
* Add rounded corners (8px) to all buttons.
* Apply pulse on hover and slight shimmer when clicked.

## 6. Imagery
Objective: Incorporate imagery that evokes high-fantasy and mystical storytelling.

### Imagery Concept:
* Use **celestial motifs** (stars, moons, constellations) and ancient runes in backgrounds and dividers.
* Incorporate **gears or clockwork** shapes subtly into UI elements for mechanical flavor.

Directive:
* Provide image assets in 2x resolution for retina displays.
* Maintain a consistent visual theme across all pages.
* Ensure all images are optimized for web (max 300kb per image).

## 7. Interactive Tone
Objective: Establish a consistent narrative voice for all UI text and prompts.

### Tone Guide:
**Primary Tone:** Authoritative but whimsical, like an ancient scribe guiding the user through a magical world.

**Example Prompts:**
> "The quill awaits your command. Begin your tale."
> "Your legend is just a page away. Ready?"
> "Mystical energies swirl… What path will you choose?"

Directive:
* Avoid overly modern or technical language.
* Use vivid, evocative descriptions when presenting choices or actions.

## 8. Implementation Notes
* **Framework:** Ensure all CSS styles are modular and reusable across different UI components.
* **Accessibility:**
  * Provide high contrast for text and buttons.
  * Add alt text to all images for screen reader support.
* **Consistency:** Apply all style rules globally to ensure branding cohesion.

## 9. Implementation Details
For detailed guidance on how to implement the styles and UI patterns described in this document, please refer to the [Development Practices Guide](DevelopmentPractices.md).

## Final Steps:
**Asset Creation:** Develop the logo, backgrounds, and icons according to the style guide.
**UI Styling:** Implement CSS rules and confirm proper hover/active states.
**Tone Testing:** Run through sample user prompts to ensure tone consistency.
**Validation:** Test across multiple screen sizes and browsers for visual fidelity.
