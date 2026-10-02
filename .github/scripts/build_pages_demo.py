#!/usr/bin/env python3
"""Build docs-build/index.org: a copy of examples/demo.org pointed at the
published #+SETUPFILE: for the tag that triggered this workflow, with an
intro paragraph suited to a public visitor instead of a local developer.

Usage: build_pages_demo.py <tag> <owner/repo>

Fails loudly (nonzero exit) if either expected marker is missing, instead
of silently writing a broken page, since examples/demo.org's structure
could change without this script changing to match.
"""
import re
import sys
import pathlib

SETUPFILE_LINE = re.compile(r"^#\+SETUPFILE:.*$", re.MULTILINE)
INTRO_MARKER = "This file exercises the Org elements the theme styles."
INTRO_PARAGRAPH = re.compile(re.escape(INTRO_MARKER) + r".*?(?=\n\n\* )", re.DOTALL)


def main():
    if len(sys.argv) != 3:
        sys.exit("usage: build_pages_demo.py <tag> <owner/repo>")
    tag, repo = sys.argv[1], sys.argv[2]
    name = repo.split("/")[-1]

    src = pathlib.Path("examples/demo.org")
    text = src.read_text()

    new_setupfile = (
        f'#+SETUPFILE: "https://cdn.jsdelivr.net/gh/{repo}@{tag}/theme.setup"'
    )
    text, count = SETUPFILE_LINE.subn(new_setupfile, text, count=1)
    if count != 1:
        sys.exit(f"Expected exactly one #+SETUPFILE: line in {src}, found {count}.")

    new_intro = (
        f"This page is a live demo of [[https://github.com/{repo}][{name}]], "
        "a simple, modern, responsive theme\n"
        "for Emacs Org-mode's HTML export. It exercises every element the theme\n"
        "styles, exported straight from the same =examples/demo.org= file in the\n"
        "repository, using the theme's own published =#+SETUPFILE:= line. See the\n"
        "repository's =README.md= for how to use it in your own files."
    )
    text, count = INTRO_PARAGRAPH.subn(new_intro, text, count=1)
    if count != 1:
        sys.exit(f"Could not find the intro paragraph marker in {src}.")

    out_dir = pathlib.Path("docs-build")
    out_dir.mkdir(exist_ok=True)
    (out_dir / "index.org").write_text(text)
    print(f"Wrote {out_dir / 'index.org'} for tag {tag} ({repo}).")


if __name__ == "__main__":
    main()
