# Frontend Design System

## Overview

- **Theme:** Dark mode first
- **Framework:** Next.js 16 App Router + Tailwind CSS v4
- **Font stack:** System sans-serif (`font-sans`) with `antialiased`
- **Radius convention:** `rounded-xl` for inputs/buttons, `rounded-3xl` for major cards

---

## Color Palette

### Neutrals (Slate)

| Role                  | Tailwind Class | Hex       | Usage                                        |
|-----------------------|---------------|-----------|----------------------------------------------|
| Background            | `slate-900`   | `#0f172a` | Page background, body background             |
| Surface               | `slate-800`   | `#1e293b` | Cards, inputs, nav background                |
| Elevated surface      | `slate-800/80` + `backdrop-blur-xl` | — | Glassmorphism cards and panels |
| Border                | `slate-700/50` or `slate-600` | `#334155` / `#475569` | Card borders, input borders, dividers |
| Text primary          | `slate-200` / `white` | `#e2e8f0` / `#ffffff` | Headings, input text, primary text |
| Text secondary        | `slate-300`   | `#cbd5e1` | Body text, labels, nav links                 |
| Text tertiary         | `slate-400`   | `#94a3b8` | Placeholder, hint text, disabled states      |
| Text on primary       | `white`       | `#ffffff` | Button text inside colored buttons           |

### Primary (Indigo)

| Role          | Tailwind Class | Hex       | Usage                                |
|---------------|---------------|-----------|--------------------------------------|
| Primary base  | `indigo-500`  | `#6366f1` | Primary buttons, links, focus rings  |
| Primary hover | `indigo-600`  | `#4f46e5` | Hover state for primary buttons     |
| Primary disabled | `indigo-400` | `#818cf8` | Disabled primary buttons             |
| Focus ring    | `ring-indigo-400` | `#818cf8` | Focus outlines on inputs/buttons    |
| Shadow accent | `shadow-indigo-900/50` | `rgba(49, 46, 129, 0.5)` | Button and card shadows |

### Accent (Blue → Cyan)

| Role              | Tailwind Class | Hex           | Usage                |
|-------------------|---------------|---------------|-----------------------|
| Gradient start    | `blue-600`    | `#2563eb`     | Gradient text, links  |
| Gradient end      | `cyan-500`    | `#06b6d4`     | Gradient text, links  |
| CTA / secondary   | `blue-600`    | `#2563eb`     | Secondary buttons     |
| CTA hover         | `blue-700`    | `#1d4ed8`     | Secondary hover state |

### Error

| Role        | Tailwind Class | Hex       | Usage                            |
|-------------|---------------|-----------|----------------------------------|
| Error text  | `red-400`     | `#f87171` | Validation messages, error text  |
| Error border| `red-400`     | `#f87171` | Error state on inputs            |
| Error focus | `ring-red-500`| `#ef4444` | Focus ring for invalid fields    |

### Global

```css
html {
  color-scheme: dark;
}

body {
  background-color: #0f172a; /* slate-900 */
}
```

---

## Typography

- **Family:** System sans-serif (`font-sans`), globally `antialiased`
- **Hero / large numbers:** `text-6xl font-bold`
- **Section headings:** `text-4xl` or `text-5xl font-bold`
- **Body:** `text-xl`
- **Labels / nav items:** `text-sm font-medium`
- **Helper / hint text:** `text-xs`
- **Error microcopy:** `text-sm` with error color

---

## Button System

### Base

```tsx
className="font-semibold rounded-xl transition-all duration-200
           focus:outline-none focus:ring-2 focus:ring-offset-2
           active:scale-[0.98] flex items-center justify-center gap-2
           disabled:cursor-not-allowed"
```

### Sizes

| Size | Classes                   |
|------|---------------------------|
| sm   | `px-4 py-2 text-sm`       |
| md   | `px-6 py-3.5 text-sm`     |
| lg   | `px-8 py-4 text-base`     |

### Variants

| Variant  | Classes                                                                                     |
|----------|----------------------------------------------------------------------------------------------|
| primary  | `bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-400 text-white shadow-lg shadow-indigo-900/50 hover:shadow-xl focus:ring-indigo-400` |
| outline  | `border border-slate-600 hover:border-slate-500 hover:bg-slate-800 text-slate-300 focus:ring-slate-400` |
| dark     | `bg-slate-800 hover:bg-slate-700 text-white shadow-lg hover:shadow-xl focus:ring-slate-500` |

### Full width behavior

- Default: `w-full`
- Optional: `w-auto` via `fullWidth={false}` prop

---

## Input System

### Field

```tsx
className="w-full py-2.5 bg-slate-800 border rounded-xl text-slate-200
           placeholder-slate-400 focus:outline-none focus:ring-2
           focus:border-transparent focus:bg-slate-700 transition duration-200"
```

### States

| State     | Classes                                                       |
|-----------|---------------------------------------------------------------|
| Default   | `border-slate-600 focus:ring-indigo-400`                       |
| Error     | `border-red-400 focus:ring-red-500`                           |
| Autofill  | `-webkit-box-shadow: 0 0 0px 1000px #1e293b inset`           |

### Layout

- **Icon prefix:** `absolute inset-y-0 left-0 pl-3.5 pointer-events-none`
- **Suffix actions (toggle, etc.):** `absolute inset-y-0 right-0 pr-3.5 flex items-center`

### Label & Helpers

```tsx
<label className="block text-sm font-medium text-slate-300">...</label>
<p className="mt-1.5 text-xs text-slate-400">...</p>
<p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">...</p>
```

---

## Card / Panel Pattern

```tsx
className="bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl
           border border-slate-700/50"
```

Used for:
- Auth forms (login/register cards)
- Landing page CTAs
- Dashboard containers

---

## Navigation

### Top nav

```tsx
<nav className="fixed top-0 left-0 right-0 z-50
                bg-slate-900/70 backdrop-blur-xl
                border-b border-slate-700/50">
```

### Nav links

```tsx
className="text-sm font-medium text-slate-300 hover:text-indigo-400 transition-colors"
```

### Container

```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <div className="flex items-center justify-between h-16">
```

---

## Form Layout

```tsx
<form className="space-y-5" noValidate>
  <InputField ... />
  <Button type="submit" isLoading={...}>...</Button>
</form>
```

- Vertical spacing: `space-y-5`
- Horizontal alignment: `flex items-center gap-2.5`
- Checkbox rows: `flex items-start gap-3`

---

## Spacing & Layout

### Auth pages

```tsx
<main className="bg-slate-900 font-sans min-h-screen
                 flex items-center justify-center
                 p-4 sm:p-6 relative overflow-hidden">
```

### Dashboard / internal pages

```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
```

### Common containers

- Max width: `max-w-md` (forms), `max-w-7xl` (sections)
- Padding responsive: `p-4 sm:p-6 lg:px-8`

---

## Effects & Animations

### Floating blobs

```css
@keyframes float {
  0%   { transform: translateY(0px); }
  50%  { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
}
.animate-float {
  animation: float 6s ease-in-out infinite;
}
.animate-float-delayed {
  animation: float 8s ease-in-out infinite 2s;
}
```

### 3D float

```css
@keyframes float-3d {
  0%   { transform: translateY(0px) rotateX(10deg) rotateY(-5deg) rotateZ(2deg); }
  50%  { transform: translateY(-15px) rotateX(10deg) rotateY(-5deg) rotateZ(2deg); }
  100% { transform: translateY(0px) rotateX(10deg) rotateY(-5deg) rotateZ(2deg); }
}
.animate-float-3d {
  animation: float-3d 6s ease-in-out infinite;
  transform-style: preserve-3d;
  perspective: 1000px;
}
```

### Gradient text

```css
.text-gradient {
  background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### Button interactions

- Press feedback: `active:scale-[0.98]`
- Focus rings: `focus:ring-2 focus:ring-offset-2`

---

## States

| State        | Pattern                                  |
|--------------|------------------------------------------|
| Loading      | `isLoading` prop on `Button` renders `Loader2` spinner |
| Disabled     | `disabled:cursor-not-allowed` + `disabled:bg-indigo-400` |
| Error        | Red border + `text-red-400` message row with dot indicator |
| Success toast| `toast.success(...)` via `sonner`       |
| Error toast  | `toast.error(...)` via `sonner`         |

---

## Accessibility

- Interactive elements: `focus:ring-2 focus:ring-offset-2`
- Inputs: `aria-invalid={error ? "true" : "false"}`
- Icon-only buttons: `aria-label` for screen readers
- Color contrast: Slate text on dark backgrounds, indigo for interactive elements

---

## Usage Notes

- All new components should preserve the **dark-first** aesthetic
- Use `slate-*` tokens for structure and `indigo-*` for actions
- Avoid introducing new accent colors unless absolutely necessary
- Reusable atoms: `Button`, `InputField`
- Compose pages from sections/landing components rather than inline styles
