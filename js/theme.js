// org-html-theme — syntax-highlighting adapter + mobile sidebar toggle.
// See ../theme.setup and ../README.md.

document.addEventListener("DOMContentLoaded", function () {
  highlightCodeBlocks();
  setUpSidebarToggle();
  setUpCollapsibleToc();
  setUpSidebarResizer();
});

// Org emits `src-LANG` on <pre> (or on <code> when line numbers are on),
// but highlight.js looks for `language-LANG` on a <code> element. Plain
// `org-html-export-to-html` output puts the code text directly inside
// <pre class="src src-LANG">, with no inner <code> at all, so this also
// adds that wrapper when it is missing before calling hljs.
function highlightCodeBlocks() {
  var blocks = document.querySelectorAll('pre[class*="src-"], code[class*="src-"]');
  blocks.forEach(function (el) {
    var match = el.className.match(/\bsrc-(\S+)/);
    if (!match) return;
    var lang = match[1];
    var codeEl = el.tagName === "CODE" ? el : el.querySelector("code");
    if (!codeEl && el.tagName === "PRE") {
      codeEl = document.createElement("code");
      while (el.firstChild) {
        codeEl.appendChild(el.firstChild);
      }
      el.appendChild(codeEl);
    }
    if (codeEl && !/\blanguage-/.test(codeEl.className)) {
      codeEl.classList.add("language-" + lang);
    }
  });
  if (window.hljs) {
    window.hljs.highlightAll();
  }
}

// theme.setup cannot inject body HTML on its own, so the toggle button and
// overlay are added here rather than requiring every .org file to author
// them by hand.
function setUpSidebarToggle() {
  var sidebar = document.getElementById("table-of-contents");
  if (!sidebar) return;

  var toggle = document.createElement("button");
  toggle.className = "sidebar-toggle";
  toggle.setAttribute("aria-label", "Toggle table of contents");
  toggle.setAttribute("aria-expanded", "false");
  toggle.textContent = "☰";

  var overlay = document.createElement("div");
  overlay.className = "sidebar-overlay";

  document.body.prepend(overlay);
  document.body.prepend(toggle);

  function closeSidebar() {
    document.body.classList.remove("sidebar-open");
    toggle.setAttribute("aria-expanded", "false");
  }

  function toggleSidebar() {
    var isOpen = document.body.classList.toggle("sidebar-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  }

  toggle.addEventListener("click", toggleSidebar);
  overlay.addEventListener("click", closeSidebar);
}

// Each TOC <li> with a nested <ul> gets a toggle button, expanded by
// default, so long outlines can be collapsed without leaving the page.
// An "Expand all" / "Collapse all" row above the list batches that same
// toggle across every collapsible entry.
function setUpCollapsibleToc() {
  var container = document.getElementById("text-table-of-contents");
  if (!container) return;

  var entries = [];

  container.querySelectorAll("li").forEach(function (item) {
    var childList = item.querySelector(":scope > ul");
    if (!childList) return;

    var toggle = document.createElement("button");
    toggle.className = "toc-toggle";
    toggle.setAttribute("aria-label", "Toggle section");
    toggle.setAttribute("aria-expanded", "true");
    toggle.addEventListener("click", function () {
      var collapsed = item.classList.toggle("toc-collapsed");
      toggle.setAttribute("aria-expanded", String(!collapsed));
    });

    item.insertBefore(toggle, item.firstChild);
    entries.push({ item: item, toggle: toggle });
  });

  if (entries.length === 0) return;

  function setAllCollapsed(collapsed) {
    entries.forEach(function (entry) {
      entry.item.classList.toggle("toc-collapsed", collapsed);
      entry.toggle.setAttribute("aria-expanded", String(!collapsed));
    });
  }

  var controls = document.createElement("div");
  controls.className = "toc-controls";

  var expandAll = document.createElement("button");
  expandAll.type = "button";
  expandAll.textContent = "Expand all";
  expandAll.addEventListener("click", function () {
    setAllCollapsed(false);
  });

  var collapseAll = document.createElement("button");
  collapseAll.type = "button";
  collapseAll.textContent = "Collapse all";
  collapseAll.addEventListener("click", function () {
    setAllCollapsed(true);
  });

  controls.appendChild(expandAll);
  controls.appendChild(collapseAll);
  container.parentNode.insertBefore(controls, container);
}

// A thin draggable strip on the sidebar's right edge updates
// --sidebar-width directly, which #table-of-contents, #preamble,
// #content, and #postamble all read, so the whole layout follows in
// sync. Desktop only: CSS hides the strip below the mobile breakpoint.
// The chosen width is not saved. It resets on the next page load.
function setUpSidebarResizer() {
  var sidebar = document.getElementById("table-of-contents");
  if (!sidebar) return;

  var MIN_WIDTH = 180;
  var MAX_WIDTH = 500;
  var startX = 0;
  var startWidth = 0;

  var resizer = document.createElement("div");
  resizer.className = "sidebar-resizer";
  document.body.appendChild(resizer);

  function clientX(e) {
    return e.touches ? e.touches[0].clientX : e.clientX;
  }

  function onMove(e) {
    var newWidth = startWidth + (clientX(e) - startX);
    newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, newWidth));
    document.documentElement.style.setProperty("--sidebar-width", newWidth + "px");
  }

  function onEnd() {
    document.body.classList.remove("resizing");
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onEnd);
    document.removeEventListener("touchmove", onMove);
    document.removeEventListener("touchend", onEnd);
  }

  function onStart(e) {
    startX = clientX(e);
    startWidth = sidebar.getBoundingClientRect().width;
    document.body.classList.add("resizing");
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onEnd);
    document.addEventListener("touchmove", onMove, { passive: false });
    document.addEventListener("touchend", onEnd);
    e.preventDefault();
  }

  resizer.addEventListener("mousedown", onStart);
  resizer.addEventListener("touchstart", onStart, { passive: false });
}
