document.addEventListener("DOMContentLoaded", function () {
  const tocContainer = document.querySelector(".md-sidebar--secondary nav");
  if (!tocContainer) return;

  const table = document.querySelector(".md-typeset table");
  if (!table) return;

  const rows = table.querySelectorAll("tbody tr");
  const foundLetters = {};

  // Insert anchors for each first letter
  rows.forEach(row => {
    const firstCell = row.querySelector("td");
    if (!firstCell) return;

    const text = firstCell.textContent.trim();
    if (!text) return;

    const letter = text[0].toUpperCase();
    if (!/^[A-Z]$/.test(letter)) return;

    if (!foundLetters[letter]) {
      foundLetters[letter] = true;
      const anchor = document.createElement("a");
      anchor.id = `letter-${letter}`;
      row.insertBefore(anchor, row.firstChild);
    }
  });

  // Build the A–Z index
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const list = document.createElement("ul");
  list.classList.add("alphabet-list");

  letters.forEach(letter => {
    const li = document.createElement("li");
    const link = document.createElement("a");
    link.textContent = letter;

    if (foundLetters[letter]) {
      link.href = `#letter-${letter}`;
      link.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.getElementById(`letter-${letter}`);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    } else {
      link.style.opacity = "0.3";
      link.style.pointerEvents = "none";
    }

    li.appendChild(link);
    list.appendChild(li);
  });

  // Create sticky wrapper
  const stickyDiv = document.createElement("div");
  stickyDiv.classList.add("alphabet-sticky");
  stickyDiv.appendChild(list);

  tocContainer.innerHTML = "";
  tocContainer.appendChild(stickyDiv);

  // Scroll spy
  window.addEventListener("scroll", () => {
    let currentLetter = null;
    letters.forEach(letter => {
      const section = document.getElementById(`letter-${letter}`);
      if (section) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 100) {
          currentLetter = letter;
        }
      }
    });
    document.querySelectorAll(".alphabet-list a").forEach(a => {
      a.classList.toggle("active", a.textContent === currentLetter);
    });
  });
});
