import popular from "../data/popular.js";
import specials from "../data/specials.js";
import shots from "../data/shots.js";
import beer from "../data/beer.js";
import soft from "../data/soft.js";

// Order exactly as requested
const MENUS = [
  { key: "popular", label: "Popular cocktails", items: popular },
  { key: "specials", label: "Rady's specials", items: specials },
  { key: "shots",   label: "Shots", items: shots },
  { key: "beer",    label: "Beer", items: beer },
  { key: "soft",    label: "Soft drink", items: soft },
];

// Demo cart state
const cart = [];

// ----- Toast -----
let toastTimer = null;

function showAddedToCartToast(itemName) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.classList.remove("show");
  void toast.offsetWidth;

  toast.textContent = `${itemName} added to the cart`;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 6100);
}

// ----- Cart -----
function addToCart(item) {
  cart.push(item);
  const cartCount = document.getElementById("cartCount");
  if (cartCount) cartCount.textContent = String(cart.length);
}

// ----- Rendering: all menus one below the other -----
function renderAllMenus() {
  const root = document.getElementById("menuSections");
  if (!root) return;

  root.innerHTML = "";

  MENUS.forEach((menu) => {
    const section = document.createElement("section");
    section.className = "menu-section";
    section.id = `section-${menu.key}`;

    const title = document.createElement("h2");
    title.className = "menu-section-title";
    title.textContent = menu.label;

    const sub = document.createElement("p");
    sub.className = "menu-section-sub";
    sub.textContent = `${menu.items.length} item(s)`;

    const grid = document.createElement("div");
    grid.className = "menu-grid";

    menu.items.forEach((item) => {
      const card = document.createElement("div");
      card.className = "card";

      const ingredientsText =
        item.ingredients && item.ingredients.length
          ? item.ingredients.join(", ")
          : "Ingredients: (coming soon)";

      card.innerHTML = `
        <div class="card-title">${escapeHtml(item.name)}</div>
        <div class="card-sub">${escapeHtml(ingredientsText)}</div>
        <button class="add-btn" type="button">Add</button>
      `;

      card.querySelector(".add-btn").onclick = () => {
        addToCart(item);
        showAddedToCartToast(item.name);
      };

      grid.appendChild(card);
    });

    section.appendChild(title);
    section.appendChild(sub);
    section.appendChild(grid);
    root.appendChild(section);
  });
}

// Safety: avoid accidental HTML injection
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Init
renderAllMenus();
