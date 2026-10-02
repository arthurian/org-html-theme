# Maintaining org-html-theme

This file covers the release process and day-to-day development of the
theme itself. See [README.md](README.md) for how to use the theme in your
own `.org` files.

## Release an update

The CDN URLs are pinned to a tag. A change to `css/theme.css` or
`js/theme.js` has no effect on anyone using this theme until you push a new
tag.

`theme.setup` is itself served from the same tag. It also points its own
two `jsdelivr.net` lines at that same tag: one `#+HTML_HEAD:` line for the
CSS, one `#+HTML_HEAD_EXTRA:` line for the JS. Those two lines must change
in the same commit the tag points to, never a commit after it. Tag a
commit first, then update those two lines in a second commit. From then
on, `theme.setup` points at the previous tag's `css/theme.css` and
`js/theme.js`, not its own. Decide the next version number before
committing anything, not after:

1. Make the real change (to `css/theme.css`, `js/theme.js`, or elsewhere).
2. In the same change, update `theme.setup`'s two `jsdelivr.net` lines to
   the version number you decided. Leave the two `cdnjs.cloudflare.com`
   lines alone. Those track the highlight.js version instead, not this
   theme's own tag.
3. Update the `#+SETUPFILE:` example in the README to match.
4. Commit everything above together, as one commit.
5. Tag that commit with the version number from step 1, and push both:

   ```sh
   git tag v0.1.5
   git push origin main v0.1.5
   ```

Pushing the tag is the last manual step. The
[`deploy-pages-demo.yml`](.github/workflows/deploy-pages-demo.yml)
workflow does the rest on its own. It waits for the new tag to resolve on
jsdelivr. It builds a copy of `examples/demo.org` pointed at that tag,
using [`build_pages_demo.py`](.github/scripts/build_pages_demo.py). It
exports that copy. When the result changed, it commits that to
`docs/index.html`. If the live demo has not updated a few minutes after a tag push,
confirm the workflow run in the repository's Actions tab.

## Update the highlight.js version

`theme.setup` loads highlight.js version `11.11.2` from the cdnjs CDN
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
