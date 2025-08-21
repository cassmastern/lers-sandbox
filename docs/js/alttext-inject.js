// Improved ALT/ARIA injector with MutationObserver and safety guards


document.addEventListener("DOMContentLoaded", () => {
const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_COMMENT, null, false);
const altComments = [];


while (walker.nextNode()) {
const comment = walker.currentNode;
const match = comment.nodeValue.trim().match(/^ALT:\s*(.+)$/);
if (match) {
altComments.push({ node: comment, text: match[1] });
}
}


const injectMetadata = (svg, text) => {
if (!svg || svg.querySelector("title")) return; // dedupe
svg.setAttribute("role", "img");
svg.setAttribute("aria-label", text);
svg.setAttribute("tabindex", "0");


const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
title.textContent = text;
const desc = document.createElementNS("http://www.w3.org/2000/svg", "desc");
desc.textContent = text;


svg.insertBefore(desc, svg.firstChild);
svg.insertBefore(title, svg.firstChild);
};


altComments.forEach(({ node, text }) => {
let next = node.nextSibling;
while (next && !(next.nodeType === 1 && next.classList?.contains("mermaid"))) {
next = next.nextSibling;
}
if (!next) return;


// Observer to handle theme re-renders
const observer = new MutationObserver(() => {
const svg = next.querySelector("svg");
if (svg) injectMetadata(svg, text);
});
observer.observe(next, { childList: true, subtree: true });


// Initial attempt with capped retries
let attempts = 0;
const tryInject = () => {
const svg = next.querySelector("svg");
if (svg) injectMetadata(svg, text);
else if (attempts++ < 50) setTimeout(tryInject, 100);
};
tryInject();
});
});
