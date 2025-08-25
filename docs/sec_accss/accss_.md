# Accessibility Reference

This is my WCAG 2.1 AA–based accessibility reference/cheat sheet.


## Core Principles: POUR

| Principle | Meaning        | Implementation Focus                                           |
| ----------- | ---------------- | ---------------------------------------------------------------- |
| **P**     | Perceivable    | Content must be visible and understandable                     |
| **O**     | Operable       | Users must be able to interact via keyboard and assistive tech |
| **U**     | Understandable | Content and UI must be predictable and readable                |
| **R**     | Robust         | Must work across technologies and assistive tools              |

## Text Content

* Use clear, readable language (avoid jargon unless defined)
* Ensure sufficient contrast (minimum 4.5:1 for body text)
* Use semantic HTML (`<h1>`–`<h6>`, `<p>`, `<ul>`, etc.)
* Avoid relying on color alone to convey meaning
* Provide skip links or landmarks for navigation

## Keyboard Navigation

* All interactive elements must be reachable via keyboard
* Focus order must be logical and intuitive
* Avoid keyboard traps (e.g., modals that can't be exited)
* Use visible focus indicators

## Images & Diagrams

* Provide descriptive `alt` text for informative images
* Use `role="img"` + `aria-labelledby` or `aria-describedby` for SVGs
* Avoid embedding text inside images unless necessary
* Ensure diagrams have sufficient contrast and are readable when zoomed
* For complex diagrams, provide a text alternative or summary

## Tables & Data

* Use `<th>` for headers and scope attributes (`scope="col"`, `scope="row"`)
* Avoid merged cells unless absolutely necessary
* Provide captions (`<caption>`) and summaries if needed

## Forms & UI Elements

* Label all inputs with `<label>` or `aria-label`
* Group related fields with `<fieldset>` and `<legend>`
* Provide error messages with clear instructions
* Ensure form validation is accessible (e.g., not just color-based)

## Responsive & Zoom

* Content must reflow without loss at 320px width
* Support zoom up to 200% without breaking layout
* Avoid fixed pixel sizes for containers and text


## Other Essentials

* Language attribute (`<html lang="en">`) must be set
* Avoid auto-playing media or flashing content
* Provide pause/stop controls for animations
* Ensure headings follow a logical hierarchy
* Use ARIA roles only when native HTML is insufficient
