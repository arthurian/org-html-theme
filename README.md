# org-html-theme

A simple, modern, responsive theme for Emacs Org-mode's HTML export
(`ox-html`). It has one design, with three parts:

- a fixed sidebar table of contents.
- a syntax-highlighted code block style, powered by
  [highlight.js](https://highlightjs.org/).
- a dark mode that follows the reader's operating system setting.
- LaTeX math, through Org's own built-in MathJax support. No setup needed.
- a print stylesheet, for "Print to PDF" and paper.

This project has no build step and no dependencies to install. It contains
only plain `.css`, `.js`, and `.org` files.

**[Live demo](https://arthurian.github.io/org-html-theme/)**. It is the
same `examples/demo.org` file, exported with the theme's own published
`#+SETUPFILE:` line and hosted on GitHub Pages from `docs/index.html`.

All four screenshots below render the same file.

![Sidebar, title, badges, and an inline timestamp.](docs/screenshot.jpg)

![Code blocks and a table.](docs/screenshot-code.jpg)

Dark mode, shown next, needs no setup of its own. The browser applies it
based on the reader's system appearance.

![The same sidebar in dark mode.](docs/screenshot-dark.jpg)

![The same code blocks in dark mode.](docs/screenshot-code-dark.jpg)

Both pairs come from the same file.

## Files

```
org-html-theme/
├── LICENSE
├── README.md
├── theme.setup        # the #+SETUPFILE: target for your own .org files
├── theme-local.setup  # the same, but for local testing (see MAINTAINING.md)
├── css/theme.css      # the stylesheet
├── js/theme.js        # the syntax-highlighting adapter and sidebar toggle
└── examples/demo.org  # a test fixture that exercises every styled element
```

## Use this theme

Add one line near the top of any `.org` file:

```org
#+SETUPFILE: "https://cdn.jsdelivr.net/gh/arthurian/org-html-theme@v0.1.2/theme.setup"
```

Org's `#+SETUPFILE:` keyword accepts a URL directly, so this line needs no
local clone of this repo at all, on any machine. [jsdelivr](https://www.jsdelivr.com/)
serves `theme.setup` and the `css/theme.css` and `js/theme.js` files it
links to straight from this GitHub repo, each pinned to the `v0.1.2` tag.

This means exporting a `.org` file needs internet access, the same
requirement the highlight.js CDN link already has. A tag, once pushed, never
changes, so your exported pages keep looking the same even after this repo
moves on. See [MAINTAINING.md](MAINTAINING.md) for how to move to a newer
tag.

For a copy that does not depend on jsdelivr, clone this repo. Copy
`css/theme.css`, `js/theme.js`, and `theme.setup` into your own project.
In your copy of `theme.setup`, change the two CDN lines to relative paths
instead. Point them at `css/theme.css` and `js/theme.js`, wherever you put
those files.

## One Emacs prompt on first export

Org's `org-resource-download-policy` defaults to `prompt`. The first time
you export a file using the remote `#+SETUPFILE:` line above, Emacs asks
whether to download it from `cdn.jsdelivr.net`. Approve it.

A batch or scripted export has no one to answer that prompt. Org then
treats it as "no" and silently skips the whole setup file. A scripted
pipeline needs this line first instead:

```elisp
(setq org-resource-download-policy t)
```

To skip the interactive prompt every time instead, trust this one source
permanently:

```elisp
(add-to-list 'org-safe-remote-resources
             "\\`https://cdn\\.jsdelivr\\.net/gh/arthurian/org-html-theme@")
```

## One required Emacs setting

`theme.setup` includes this line:

```org
#+BIND: org-html-htmlize-output-type nil
```

This line tells Org to export plain code blocks that highlight.js can read,
instead of baking your local Emacs theme's colors into the HTML. By default,
Org blocks this kind of per-file setting for safety. You have two ways to
allow it.

- Add `(setq org-export-allow-bind-keywords t)` to your Emacs configuration.
  This allows `#+BIND` in every file you export, with no further prompts.
- Approve the safety prompt Emacs shows each time you open a file that uses
  `#+BIND`, without changing your configuration.

As a simpler path that avoids `#+BIND` entirely, add this line to your Emacs
configuration instead:

```elisp
(setq-default org-html-htmlize-output-type nil)
```

## highlight.js version and dark mode

`theme.setup` loads highlight.js version `11.9.0` from the cdnjs CDN
(content delivery network). The version is pinned in the URL, not
`latest`. An update to highlight.js never changes your exported pages
without your choice.

Two stylesheets load, a light and a dark highlight.js color theme,
"github" and "github-dark". Each `<link>` tag carries a `media` attribute,
`(prefers-color-scheme: light)` or `(prefers-color-scheme: dark)`, so the
browser loads only the one that matches. This needs no JavaScript. It
follows the same system setting as the rest of the page.

## Author and date near the title

By default, Org's HTML export only shows the author and date in the page
footer, never next to the title. `theme.setup` adds one more line to also
show them above the title, near the top of the page:

```org
#+BIND: org-html-preamble-format (("en" "<p class=\"author\">%a</p>\n<p class=\"date\">%d</p>\n"))
```

One difference from the footer version: `#+OPTIONS: author:nil` or
`date:nil` turns the matching line off in the footer. The preamble line
always shows both instead, because a custom format string skips that test.
To turn off the top placement only, delete this `#+BIND` line from
`theme.setup`. You can also override it with your own `#+BIND` line in a
single `.org` file.

## Math

Write LaTeX math in your `.org` file, inline as `\(e^{i\pi} + 1 = 0\)` or
as a display equation. Org detects it and adds [MathJax](https://www.mathjax.org/)
to the page on its own, with no line needed in `theme.setup` and no
`#+OPTIONS` to set. A file with no math loads no MathJax script at all.

## Print to PDF

The stylesheet includes a `@media print` block, used automatically by
"Print" or "Print to PDF" in your browser. It makes three changes.

- It forces light, ink-sparing colors on paper, no matter the screen's
  current mode. A dark background belongs on a screen, not in a PDF.
- It turns the fixed sidebar into a normal table of contents ahead of the
  content, instead of hiding it. Every section prints expanded, no matter
  what is collapsed on screen.
- It removes controls that only make sense on screen: the TODO sidebar
  toggle, the expand/collapse-all buttons, each section's toggle arrow,
  and the sidebar resize handle.

## Known limitations

- **Only the two base TODO classes are styled.** Org always emits `.todo`
  and `.done`, and this theme styles both. Org also emits a class named
  after each custom keyword you define, such as `.WAITING`. Those keyword
  classes are unstyled here, because keyword sets vary per user. Add your
  own rule for a custom keyword with an extra `#+HTML_HEAD_EXTRA:` line in
  your `.org` file.
- **No scroll-based active-section highlighting.** The sidebar does not
  highlight the section you are currently reading. A manual dark-mode
  toggle is still a possible future addition, not part of this version.
- **Nothing is remembered between page loads.** You can drag the sidebar's
  right edge to resize it. You can also collapse sections of the nested
  TOC tree. Both reset to their defaults on the next page load. Saving
  either choice needs `localStorage`, which this theme does not use.

## Maintaining this theme

See [MAINTAINING.md](MAINTAINING.md) for the release process, local
development setup, and the manual verification checklist.

## Credit

This theme takes architectural inspiration, not code, from the "material"
theme in the [fniessen/org-html-themes](https://github.com/fniessen/org-html-themes)
project. It borrows that theme's use of CSS custom properties, vanilla
JavaScript, and a responsive sidebar.
