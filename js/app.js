const els = {
  menuGrid: document.getElementById("menuGrid"),
  searchInput: document.getElementById("searchInput"),
  categorySelect: document.getElementById("categorySelect"),
  viewCartBtn: document.getElementById("viewCartBtn"),
  closeCartBtn: document.getElementById("closeCartBtn"),
  cartModal: document.getElementById("cartModal"),
  cartItems: document.getElementById("cartItems"),
  cartCount: document.getElementById("cartCount"),
  cartTotal: document.getElementById("cartTotal"),
  checkoutBtn: document.getElementById("checkoutBtn")
};

let menu = [];
let filtered = [];
const cart = new Map();

async function loadMenu() {
  const res = await fetch("./data/menu.json");
  if (!res.ok) throw new Error("Failed to load menu.json");
  const data = await res.json();
  menu = data.items || [];
  filtered = [...menu];
  populateCategories(menu);
  renderMenu(filtered);
}

function populateCategories(items) {
  const cats = Array.from(new Set(items.map(i => i.category))).sort();
  for (const c of cats) {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    els.categorySelect.appendChild(opt);
  }
}

function renderMenu(items) {
  els.menuGrid.innerHTML = "";
  for (const item of items) {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="name">${escapeHtml(item.name)}</div>
      <div class="desc">${escapeHtml(item.desc || "")}</div>
      <div class="meta">
        <span>${escapeHtml(item.category)}</span>
        <span class="price">₪${Number(item.price).toFixed(0)}</span>
      </div>
      <div class="row">
        <button class="btn secondary" data-action="remove" data-id="${item.id}">-</button>
        <button class="btn primary" data-action="add" data-id="${item.id}">Add</button>
      </div>
    `;
    els.menuGrid.appendChild(card);
  }

  els.menuGrid.onclick = (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = btn.getAttribute("data-id");
    const action = btn.getAttribute("data-action");
    const item = menu.find(x => x.id === id);
    if (!item) return;

    if (action === "add") addToCart(item);
    if (action === "remove") removeFromCart(item);
  };
}

function applyFilters() {
  const q = els.searchInput.value.trim().toLowerCase();
  const cat = els.categorySelect.value;

  filtered = menu.filter(i => {
    const matchesText =
      i.name.toLowerCase().includes(q) ||
      (i.desc || "").toLowerCase().includes(q);

    const matchesCat = (cat === "all") ? true : i.category === cat;
    return matchesText && matchesCat;
  });

  renderMenu(filtered);
}

function addToCart(item) {
  const cur = cart.get(item.id) || { item, qty: 0 };
  cur.qty += 1;
  cart.set(item.id, cur);
  updateCartUI();
}

function removeFromCart(item) {
  const cur = cart.get(item.id);
  if (!cur) return;
  cur.qty -= 1;
  if (cur.qty <= 0) cart.delete(item.id);
  else cart.set(item.id, cur);
  updateCartUI();
}

function updateCartUI() {
  const entries = Array.from(cart.values());
  const count = entries.reduce((s, e) => s + e.qty, 0);
  const total = entries.reduce((s, e) => s + e.qty * Number(e.item.price), 0);

  els.cartCount.textContent = String(count);
  els.cartTotal.textContent = String(total.toFixed(0));
  els.checkoutBtn.disabled = true;

  els.cartItems.innerHTML = "";
  if (entries.length === 0) {
    els.cartItems.innerHTML = `<div class="desc">Cart is empty.</div>`;
    return;
  }

  for (const e of entries) {
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <div>
        <div class="name">${escapeHtml(e.item.name)}</div>
        <div class="desc">${escapeHtml(e.item.category)} • ₪${Number(e.item.price).toFixed(0)}</div>
      </div>
      <div class="row">
        <button class="btn secondary" data-cart="minus" data-id="${e.item.id}">-</button>
        <div><strong>${e.qty}</strong></div>
        <button class="btn secondary" data-cart="plus" data-id="${e.item.id}">+</button>
      </div>
    `;
    els.cartItems.appendChild(row);
  }

  els.cartItems.onclick = (ev) => {
    const btn = ev.target.closest("button");
    if (!btn) return;
    const id = btn.getAttribute("data-id");
    const kind = btn.getAttribute("data-cart");
    const item = menu.find(x => x.id === id);
    if (!item) return;

    if (kind === "plus") addToCart(item);
    if (kind === "minus") removeFromCart(item);
  };
}

function openCart() { els.cartModal.classList.remove("hidden"); }
function closeCart() { els.cartModal.classList.add("hidden"); }

els.searchInput.addEventListener("input", applyFilters);
els.categorySelect.addEventListener("change", applyFilters);
els.viewCartBtn.addEventListener("click", openCart);
els.closeCartBtn.addEventListener("click", closeCart);

els.cartModal.addEventListener("click", (e) => {
  if (e.target === els.cartModal) closeCart();
});

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

loadMenu().catch(err => {
  console.error(err);
  els.menuGrid.innerHTML = `<div class="card">
    <div class="name">Failed to load menu</div>
    <div class="desc">Check that ./data/menu.json exists and paths are correct.</div>
  </div>`;
});
