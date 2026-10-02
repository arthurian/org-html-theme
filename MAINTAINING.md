# Maintaining org-html-theme

This file covers the release process and day-to-day development of the
theme itself. See [README.md](README.md) for how to use the theme in your
own `.org` files.

## Release an update

The CDN URLs are pinned to a tag. A change to `css/theme.css` or
`js/theme.js` has no effect on anyone using this theme until you push a new
tag. After committing a change, create and push one:

```sh
git tag v0.1.3
git push origin main v0.1.3
```

Then update the tag name to match in `theme.setup`'s two `jsdelivr.net`
lines, one `#+HTML_HEAD:` line (the CSS) and one `#+HTML_HEAD_EXTRA:` line
(the JS). Leave the two `cdnjs.cloudflare.com` lines alone. Those track the
highlight.js version instead, not this theme's own tag. Update the
`#+SETUPFILE:` example in the README too.

`docs/index.html`, the live demo, is a static snapshot. A tag change does
not update it on its own. Regenerate it from `examples/demo.org`, pointed
at the new tag, and commit the result alongside the rest of this release:

```sh
emacs --batch \
  --eval "(require 'ox-html)" \
  --eval "(setq org-export-allow-bind-keywords t)" \
  --eval "(setq org-resource-download-policy t)" \
  --visit=examples/demo.org --funcall org-html-export-to-html
```

Copy the result to `docs/index.html`. Replace its `#+SETUPFILE:` line with
the published CDN URL at the new tag. Point its intro paragraph's link at
this repository. Commit everything together, then push.

## Update the highlight.js version

`theme.setup` loads highlight.js version `11.9.0` from the cdnjs CDN
(content delivery network). The version is pinned in the URL, not
`latest`, so an update to highlight.js never changes anyone's exported
pages without your choice. To use a newer version, edit all three cdnjs
URLs in `theme.setup` to match: two stylesheets and one script.

The two stylesheets are a light and a dark highlight.js color theme,
"github" and "github-dark". Each `<link>` tag carries a `media` attribute,
`(prefers-color-scheme: light)` or `(prefers-color-scheme: dark)`, so the
browser loads only the one that matches. Keep both lines pinned to the same highlight.js version. If you ever
change which themes they load, keep a light/dark pair.

## Develop this theme

`examples/demo.org` uses `theme-local.setup`, not `theme.setup`. It points
`css/theme.css` and `js/theme.js` at your local clone of this repo, with
relative paths. A change to either file shows up the next time you export
`demo.org`, with no need to push a tag first. `theme-local.setup` is not
meant for your own `.org` files. Use `theme.setup` for those, as shown in
the README.

## Verify a change

There is no automated test suite for a static theme. Verification is
manual.

1. Export `examples/demo.org` to HTML with a running Emacs server, for
   example through the `emacsclient` command.
2. Open the exported `demo.html` file in a browser. Confirm the sidebar
   layout, the code block highlighting, the table, the blockquote, the
   footnote, the verse block, and the figure all look correct.
3. Resize the browser below 768 pixels wide. Confirm the sidebar toggle
   button appears and works.
4. Turn on dark mode, either in your OS appearance setting or your
   browser's developer tools. Confirm the page re-themes without a reload,
   and confirm the code blocks switch to a dark syntax theme too.
5. Click a toggle arrow next to a sidebar entry that has sub-headings.
   Confirm its nested list collapses and expands again on a second click.
6. Click "Collapse all" above the sidebar list. Confirm every entry with
   sub-headings collapses. Click "Expand all". Confirm they all reopen.
7. Drag the thin strip at the sidebar's right edge. Confirm the sidebar,
   the title area, and the main content all resize together.
8. Open your browser's print preview. Confirm the sidebar reflows above
   the content as a plain table of contents. Confirm every section shows
   expanded. Confirm the code blocks print in plain black text, not a
   syntax color theme.
9. Confirm the Math section renders an inline equation and a numbered
   display equation, not raw LaTeX text.
