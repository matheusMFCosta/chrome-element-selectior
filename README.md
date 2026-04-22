# Element Inspector

A Chrome extension to inspect React components and DOM elements. Select multiple elements, add notes, and copy structured context in one click.

## Features

- **Picking mode** — hover shows a blue highlight and tooltip with the React component name and source file
- **Multi-select** — click elements one by one; each gets a persistent orange highlight with a numbered label on screen
- **↑ Parent** per item — navigate any selection up the DOM tree without losing others
- **Notes** — write a note on each selected element before copying
- **Clear** — remove all selections at once
- **Copy All** — copies every selection as a structured block, ready to paste into any AI tool
- Works with **React components** (name, file, parent component) and **plain DOM elements** (tag, id, classes, CSS selector, HTML snippet)

## Installation

1. Clone this repository
   ```bash
   git clone git@github.com:matheusMFCosta/chrome-element-selectior.git
   ```
2. Open Chrome and navigate to `chrome://extensions`
3. Enable **Developer Mode** (toggle in the top-right corner)
4. Click **Load unpacked** and select the cloned folder
5. The extension icon will appear in your Chrome toolbar

## Usage

1. Navigate to any webpage
2. Click the **Element Inspector** icon — the panel opens and picking mode activates automatically
3. Hover over elements to preview component info in the tooltip
4. **Click an element** — it gets added to the list with a numbered orange highlight on the page
5. Click **+ Add Element** to pick another element
6. Use **↑ Parent** on any item to move its selection up the DOM tree
7. Add optional notes to each selection
8. Click **Copy All** and paste the result into your conversation

## Screenshots

### Picking mode — hover shows component and file
![Hover state](images/demo-hover.svg)

### Multi-select — persistent highlights, notes, and copy
![Selection panel](images/demo-panel.svg)

## Snippet format

Each selection is separated and labeled. With multiple elements:

```
────────────────────────────────────────
Selection 1: <InvoiceRow>
────────────────────────────────────────
Note: the empty state here is broken

[Component: <InvoiceRow>]
File: src/pages/invoices/components/invoice-row.tsx:8
Parent: <InvoicesTable>
Route: /invoices
URL: http://localhost:3000/invoices
DOM: <tr class="invoice-row">
Selector: table > tbody > tr

HTML:
<tr class="invoice-row"><td>Jan 12…

────────────────────────────────────────
Selection 2: <InvoicesTable>
────────────────────────────────────────
[Component: <InvoicesTable>]
File: src/pages/invoices/components/invoices-table.tsx:12
...
```

## How it works

The extension injects a content script that reads React's internal fiber tree (`__reactFiber$`) directly from DOM nodes to resolve component names and source file locations — no build plugin or source map configuration required. Works on both development and production builds (production builds may have minified component names).

## License

MIT
