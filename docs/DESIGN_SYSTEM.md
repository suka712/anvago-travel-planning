# Anvago Design System

This document defines the complete design system for the Anvago travel planning application. Use this as a reference to maintain visual consistency across all implementations.

## Design Philosophy

Anvago uses a **playful, bold, and modern design language** characterized by:

- **Bold borders and shadows**: Black 2px borders with offset drop shadows create depth and a distinctive visual style
- **Rounded corners**: Soft, friendly rounded corners throughout
- **Sky blue primary color**: A vibrant, saturated sky blue as the primary brand color
- **High contrast**: Black borders and shadows on light backgrounds for excellent readability
- **Interactive feedback**: Hover effects that provide tactile, satisfying interactions
- **Minimal but expressive**: Clean layouts with strategic use of color and shadows

## Color Palette

### Primary Colors (Sky Blue)

The primary color palette uses saturated sky blue tones:

```css
/* Primary Sky Blue - Main brand color */
--color-sky-primary: #4FC3F7;

/* Dark Sky Blue - Hover states, accents */
--color-sky-dark: #2196F3;

/* Light Sky Blue - Backgrounds, subtle accents */
--color-sky-light: #81D4FA;
```

**Usage:**
- Primary buttons: `bg-[#4FC3F7]`
- Hover states: `bg-[#2196F3]`
- Background gradients: `from-[#4FC3F7]/20`, `to-[#81D4FA]/20`
- Accent backgrounds: `bg-[#4FC3F7]/10`

### Background Colors

```css
/* Main background - Slightly off-white */
--color-background: #FAFAF8;

/* Surface/Card background - Pure white */
--color-surface: #FFFFFF;
```

**Usage:**
- Page backgrounds: `bg-[#FAFAF8]` or `bg-[var(--color-background)]`
- Cards and surfaces: `bg-white` or `bg-[#FFFFFF]`
- Gradient backgrounds: `bg-gradient-to-br from-[#4FC3F7]/10 via-[#FAFAF8] to-[#81D4FA]/10`

### Text Colors

```css
/* Primary text - Almost black */
--color-text-primary: #1A1A1A;

/* Secondary text - Medium gray */
--color-text-secondary: #666666;
```

**Usage:**
- Headings and primary text: `text-[#1A1A1A]` or `text-black`
- Body text: `text-gray-700` or `text-gray-600`
- Secondary/muted text: `text-gray-500` or `text-gray-400`

### Border and Shadow Colors

```css
/* All borders are black */
--color-border: #000000;

/* All shadows are black */
--color-shadow: #000000;
```

**Usage:**
- Borders: `border-2 border-black` or `border-black`
- Shadows: `shadow-[4px_4px_0px_#000]` (see Shadow System below)

### Semantic Colors

```css
/* Success - Green */
--color-success: #4CAF50;

/* Warning - Yellow/Amber */
--color-warning: #FFC107;

/* Error - Red */
--color-error: #F44336;
```

**Usage:**
- Success states: `bg-green-500`, `text-green-500`, `bg-green-100`
- Warning states: `bg-yellow-400`, `text-yellow-800`, `bg-yellow-100`
- Error states: `bg-red-500`, `text-red-500`, `bg-red-100`

## Typography

### Font Family

**Primary Font: DM Sans**

```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap" rel="stylesheet" />
```

```css
--font-family-sans: 'DM Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

**Font Weights Available:**
- 300: Light
- 400: Regular (default)
- 500: Medium
- 600: Semi-bold
- 700: Bold
- 800: Extra-bold

**Usage:**
- Apply font globally: `font-family: 'DM Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;`
- Use `font-medium` (500) for emphasis
- Use `font-bold` (700) for headings
- Use `font-semibold` (600) for subheadings

### Type Scale

- **H1 (Hero)**: `text-5xl lg:text-6xl font-bold`
- **H1 (Page Title)**: `text-3xl font-bold`
- **H2**: `text-2xl font-bold` or `text-xl font-bold`
- **H3**: `text-lg font-bold` or `text-lg font-medium`
- **Body**: `text-base` (16px default)
- **Small**: `text-sm`
- **Extra Small**: `text-xs`

## Border Radius

Rounded corners are used throughout for a friendly, modern feel:

- **Small**: `rounded-lg` (0.5rem / 8px) - Buttons, inputs, badges
- **Medium**: `rounded-xl` (0.75rem / 12px) - Cards
- **Large**: `rounded-2xl` (1rem / 16px) - Large cards, hero sections
- **Full**: `rounded-full` - Badges, avatars, circular elements

**Usage:**
- Buttons: `rounded-lg`
- Cards: `rounded-xl`
- Inputs: `rounded-lg`
- Badges: `rounded-full`
- Large containers: `rounded-2xl`

## Border System

All borders follow these rules:

- **Width**: Always `2px` (`border-2`)
- **Color**: Always black (`border-black`)
- **Style**: Solid (default)

**Exceptions:**
- Error states: `border-red-500`
- Focus states: `border-[#4FC3F7]` (sky blue)
- Subtle dividers: `border-gray-200` or `border-gray-100` (1px, no border-2)

## Shadow System

The shadow system is a key part of the design language. All shadows are **black** and **offset to the bottom-right**.

### Shadow Specifications

**Card Shadows:**
- Default: `shadow-[6px_6px_0px_#000]` (6px offset)
- Hover: `shadow-[8px_8px_0px_#000]` (8px offset, larger)

**Button Shadows:**
- Default: `shadow-[4px_4px_0px_#000]` (4px offset)
- Hover: `shadow-[2px_2px_0px_#000]` (2px offset, smaller)
- Active: `shadow-none` (no shadow, pressed effect)

**Input/Form Shadows:**
- Focus: `shadow-[4px_4px_0px_#4FC3F7]` (sky blue shadow on focus)
- Error focus: `shadow-[4px_4px_0px_#ef4444]` (red shadow on error)

**Large Elements:**
- Hero sections: `shadow-[8px_8px_0px_#000]` (8px offset)

### Shadow Interaction States

**Buttons:**
```css
/* Default state */
shadow-[4px_4px_0px_#000]

/* Hover state - shadow gets smaller, element moves down-right */
hover:shadow-[2px_2px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px]

/* Active state - shadow removed, element moves further */
active:shadow-none active:translate-x-[4px] active:translate-y-[4px]
```

**Cards:**
```css
/* Default state */
shadow-[6px_6px_0px_#000]

/* Hover state - shadow gets larger, element moves up-left */
hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[8px_8px_0px_#000]
```

## Component Specifications

### Button

**Base Styles:**
```css
inline-flex items-center justify-center font-medium rounded-lg border-2 border-black transition-all duration-200
```

**Variants:**

1. **Primary** (Default):
   - Background: `bg-[#4FC3F7]`
   - Text: `text-black`
   - Hover: `hover:bg-[#2196F3]`
   - Shadow: `shadow-[4px_4px_0px_#000]` → `hover:shadow-[2px_2px_0px_#000]`
   - Transform: `hover:translate-x-[2px] hover:translate-y-[2px]`
   - Active: `active:shadow-none active:translate-x-[4px] active:translate-y-[4px]`

2. **Secondary**:
   - Background: `bg-white`
   - Text: `text-black`
   - Hover: `hover:bg-gray-100`
   - Shadow: Same as primary

3. **Danger**:
   - Background: `bg-red-500`
   - Text: `text-white`
   - Hover: `hover:bg-red-600`
   - Shadow: Same as primary

4. **Ghost**:
   - Background: `bg-transparent`
   - Border: `border-transparent`
   - Shadow: `shadow-none`
   - Hover: `hover:bg-gray-100`

**Sizes:**
- Small: `px-3 py-1.5 text-sm`
- Medium: `px-5 py-2.5 text-base` (default)
- Large: `px-7 py-3.5 text-lg`

### Card

**Base Styles:**
```css
bg-white rounded-xl border-2 border-black p-5 shadow-[6px_6px_0px_#000]
```

**Hover Effect:**
```css
transition-all duration-200 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[8px_8px_0px_#000]
```

**Props:**
- `hoverable` (default: `false`): Enables hover effect - **only use for interactive/clickable cards**
- `static` (default: `false`): Explicitly disables hover effect

**Usage Guidelines:**
- **DO use `hoverable={true}`** for:
  - Clickable/selectable cards (e.g., itinerary cards in grid, persona cards)
  - Cards that act as buttons or links
  - Interactive elements that respond to user action
  
- **DO NOT use hover effect** (default or `static={true}`) for:
  - Informational/display cards (e.g., welcome cards, question containers)
  - Timeline cards
  - Summary cards
  - Loading states
  - Any card that is purely informational

**Example:**
```tsx
// Informational card - no hover
<Card static>
  <h2>Welcome</h2>
  <p>Content here</p>
</Card>

// Interactive card - with hover
<Card hoverable onClick={handleClick}>
  <h3>Select Me</h3>
</Card>
```

**Padding:**
- Default: `p-5` (1.25rem / 20px)
- Custom: Can be overridden with `p-4`, `p-6`, etc.

### Input

**Base Styles:**
```css
w-full px-4 py-3 bg-white border-2 rounded-lg text-base transition-shadow duration-200
```

**States:**
- Default: `border-black`
- Focus: `focus:shadow-[4px_4px_0px_#4FC3F7]` (sky blue shadow)
- Error: `border-red-500 focus:shadow-[4px_4px_0px_#ef4444]`

**Label:**
```css
block text-sm font-medium text-gray-700 mb-1
```

### Select

Same as Input, with custom dropdown arrow styling.

### Textarea

Same as Input, with `resize-none` added.

### Badge

**Base Styles:**
```css
inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border-2 border-black
```

**Variants:**
- Primary: `bg-[#4FC3F7] text-black`
- Secondary: `bg-gray-100 text-gray-800`
- Success: `bg-green-100 text-green-800`
- Warning: `bg-yellow-100 text-yellow-800`
- Error: `bg-red-100 text-red-800`

### Checkbox

**Base Styles:**
```css
w-6 h-6 border-2 border-black rounded bg-white transition-all duration-200
```

**Checked State:**
```css
peer-checked:bg-[#4FC3F7]
```

**Focus State:**
```css
peer-focus:shadow-[3px_3px_0px_#4FC3F7]
```

## Spacing System

Use Tailwind's spacing scale consistently:

- **Tight**: `gap-2` (0.5rem / 8px) - Between related items
- **Normal**: `gap-3` (0.75rem / 12px) - Between buttons, form elements
- **Comfortable**: `gap-4` (1rem / 16px) - Between sections
- **Loose**: `gap-6` (1.5rem / 24px) - Between major sections
- **Very Loose**: `gap-8` (2rem / 32px) - Between page sections

**Common Patterns:**
- Button groups: `gap-2` or `gap-3`
- Form fields: `space-y-4` or `space-y-6`
- Card grids: `gap-6`
- Page sections: `py-8`, `py-12`, `py-20`

## Layout Patterns

### Container

**Max Width:**
- Standard pages: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- Forms: `max-w-2xl mx-auto`
- Narrow content: `max-w-4xl mx-auto`

**Padding:**
- Page padding: `px-4 sm:px-6 lg:px-8 py-8`
- Section padding: `py-12` or `py-20`

### Grid Systems

**Common Grid Patterns:**
- 2 columns: `grid md:grid-cols-2 gap-6`
- 3 columns: `grid md:grid-cols-2 lg:grid-cols-3 gap-6`
- 4 columns: `grid grid-cols-2 md:grid-cols-4 gap-4` or `gap-8`

### Page Backgrounds

**Common Patterns:**
- Solid: `bg-white` or `bg-[#FAFAF8]`
- Gradient: `bg-gradient-to-br from-[#4FC3F7]/10 via-[#FAFAF8] to-[#81D4FA]/10`
- Hero gradient: `bg-gradient-to-br from-[#4FC3F7]/20 via-[#FAFAF8] to-[#81D4FA]/20`

## Interaction Patterns

### Hover Effects

**Buttons:**
- Shadow reduces, element moves down-right
- Background color darkens (primary: `#4FC3F7` → `#2196F3`)

**Cards:**
- Shadow increases, element moves up-left
- Creates a "lifting" effect

**Links:**
- Text color changes: `text-gray-600 hover:text-black`
- Underline on hover (if applicable): `hover:underline`

### Transition Timing

All transitions use: `transition-all duration-200` for smooth, quick animations.

### Focus States

- Inputs/Selects: Sky blue shadow appears
- Buttons: Maintain border and shadow
- Links: Text color change

## Icon System

**Icon Library:** Lucide React

**Common Sizes:**
- Small: `w-4 h-4` (16px) - Inline with text
- Medium: `w-5 h-5` (20px) - Buttons, cards
- Large: `w-6 h-6` (24px) - Headings, feature icons
- Extra Large: `w-8 h-8` (32px) - Hero sections, large features

**Icon Colors:**
- Default: Inherit text color
- Primary: `text-[#4FC3F7]` or `text-[#2196F3]`
- Muted: `text-gray-400` or `text-gray-500`
- Success: `text-green-500`
- Warning: `text-yellow-400`
- Error: `text-red-500`

## Badge/Status Indicators

**Status Colors:**
- Completed/Success: Green (`bg-green-100 text-green-800` or `bg-green-500 text-white`)
- In Progress/Warning: Yellow/Amber (`bg-yellow-100 text-yellow-800` or `bg-yellow-400`)
- Scheduled/Info: Sky Blue (`bg-[#4FC3F7] text-black`)
- Error/Cancelled: Red (`bg-red-100 text-red-800` or `bg-red-500 text-white`)

## Empty States

**Common Pattern:**
```jsx
<Card className="text-center py-12" static={true}>
  <Icon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
  <h3 className="text-lg font-medium mb-2">No items found</h3>
  <p className="text-gray-600">Descriptive message here.</p>
</Card>
```

## Loading States

**Spinner:**
- Use `Loader2` from Lucide React
- Color: `text-[#4FC3F7]`
- Size: `w-8 h-8` or `w-12 h-12`
- Animation: `animate-spin`

**Skeleton Loaders:**
- Match the shape of the content
- Use `bg-gray-200` or `bg-gray-100`
- Rounded corners matching the final content

## Z-Index Scale

- Base: `z-0` (default)
- Sticky headers: `z-10`
- Dropdowns: `z-20`
- Modals/Overlays: `z-30`
- Toast notifications: `z-50`

## Responsive Breakpoints

Use Tailwind's default breakpoints:

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

**Common Patterns:**
- Hide on mobile: `hidden md:flex`
- Stack on mobile: `flex-col md:flex-row`
- Grid columns: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

## Accessibility

- All interactive elements should have focus states
- Use semantic HTML elements
- Maintain sufficient color contrast (black on white, black on sky blue)
- Provide alt text for images
- Use ARIA labels where appropriate

## Implementation Notes

### Tailwind CSS Configuration

This design system uses Tailwind CSS v4 with custom theme variables. The color variables are defined in `@theme` block:

```css
@theme {
  --color-sky-primary: #4FC3F7;
  --color-sky-dark: #2196F3;
  --color-sky-light: #81D4FA;
  /* ... other variables ... */
}
```

### React Component Patterns

All UI components should:
- Accept `className` prop for customization
- Use `forwardRef` for proper ref forwarding
- Follow TypeScript interfaces
- Support all standard HTML attributes via spread props

### Example Component Structure

```tsx
import { type HTMLAttributes, forwardRef } from 'react';

interface ComponentProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary';
}

export const Component = forwardRef<HTMLDivElement, ComponentProps>(
  ({ className = '', variant = 'primary', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`base-styles variant-styles ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Component.displayName = 'Component';
```

## Quick Reference

### Color Values
- Primary: `#4FC3F7`
- Dark: `#2196F3`
- Light: `#81D4FA`
- Background: `#FAFAF8`
- Surface: `#FFFFFF`
- Text Primary: `#1A1A1A`
- Text Secondary: `#666666`

### Common Classes
- Button: `rounded-lg border-2 border-black shadow-[4px_4px_0px_#000]`
- Card: `rounded-xl border-2 border-black shadow-[6px_6px_0px_#000]`
- Input: `rounded-lg border-2 border-black`
- Badge: `rounded-full border-2 border-black`

### Shadow Offsets
- Buttons: `4px 4px`
- Cards: `6px 6px`
- Large elements: `8px 8px`

---

**Last Updated:** 2025-12-06
**Version:** 1.0.0

