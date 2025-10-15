document.addEventListener("DOMContentLoaded", () => {
  // Run only on glossary pages
  if (!location.pathname.includes("gloss_")) return;

  const toc = document.querySelector(".md-sidebar--secondary nav");
  if (!toc) return;

  const table = document.querySelector(".md-typeset table");
  if (!table) return;

  const rows = table.querySelectorAll("tbody tr");
  if (!rows.length) return;

  const foundLetters = {};

  // Assign IDs to first cells based on first letter
  rows.forEach(row => {
    const firstCell = row.querySelector("td");
    if (!firstCell) return;
    const text = firstCell.textContent.trim();
    if (!text) return;
    const letter = text[0].toUpperCase();
    if (!/^[A-Z]$/.test(letter)) return;
    if (!foundLetters[letter]) {
      foundLetters[letter] = true;
      firstCell.id = `letter-${letter}`;
    }
  });

  // Build alphabet navigation
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const ul = document.createElement("ul");
  ul.classList.add("alphabet-list");

  alphabet.forEach(letter => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.textContent = letter;

    if (foundLetters[letter]) {
      a.href = `#letter-${letter}`;
      a.addEventListener("click", e => {
        e.preventDefault();
        const target = document.getElementById(`letter-${letter}`);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    } else {
      a.style.opacity = "0.3";
      a.style.pointerEvents = "none";
    }

    li.appendChild(a);
    ul.appendChild(li);
  });

  // Replace native TOC with alphabet nav
  toc.innerHTML = "";
  const wrapper = document.createElement("div");
  wrapper.classList.add("alphabet-sticky");
  wrapper.appendChild(ul);
  toc.appendChild(wrapper);

  // Scroll spy: highlight current letter
  window.addEventListener("scroll", () => {
    let current = null;
    alphabet.forEach(letter => {
      const el = document.getElementById(`letter-${letter}`);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 100) current = letter;
      }
    });
    document.querySelectorAll(".alphabet-list a").forEach(a => {
      a.classList.toggle("active", a.textContent === current);
    });
  });
});

