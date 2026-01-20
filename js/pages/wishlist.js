const CURRENT_USER_KEY = "user";
const WISHLIST_PREFIX = "wishlist:";

function getUser() {
  return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
}

function getWishlistKey() {
  const user = getUser();
  if (!user?.id) return null;
  return `${WISHLIST_PREFIX}${user.id}`;
}

function getWishlistIds() {
  const key = getWishlistKey();
  if (!key) return [];
  return JSON.parse(localStorage.getItem(key)) || [];
}

function saveWishlistIds(ids) {
  const key = getWishlistKey();
  if (!key) return;
  localStorage.setItem(key, JSON.stringify(ids));
}

function redirectToLogin() {
  alert("Vui lòng đăng nhập để sử dụng wishlist!");
  window.location.href = "./login.html";
}

function renderWishlist() {
  const listEl = document.getElementById("wishlistList");
  const totalCountEl = document.getElementById("totalCount");
  if (!listEl || !totalCountEl) return;

  const user = getUser();
  if (!user) {
    listEl.innerHTML = "<p>Vui lòng đăng nhập để xem wishlist.</p>";
    totalCountEl.textContent = "0";
    return;
  }

  if (user.role !== "customer") {
    listEl.innerHTML = "<p>Admin không thể sử dụng wishlist.</p>";
    totalCountEl.textContent = "0";
    return;
  }

  const ids = getWishlistIds().map(String);
  totalCountEl.textContent = String(ids.length);

  if (ids.length === 0) {
    listEl.innerHTML = "<p>Wishlist trống 💤</p>";
    return;
  }

  const products = JSON.parse(localStorage.getItem("products")) || [];
  const idSet = new Set(ids);
  const items = products.filter((p) => idSet.has(String(p.id)));

  if (items.length === 0) {
    listEl.innerHTML = "<p>Wishlist trống 💤</p>";
    return;
  }

  listEl.innerHTML = "";
  items.forEach((item) => {
    listEl.innerHTML += `
      <div class="cart-item">
        <img src="${item.img}">
        <div class="cart-info">
          <h4>${item.name}</h4>
          <span>$${item.price}</span>
        </div>

        <button class="remove-btn" onclick="removeWishlistItem('${item.id}')">✖</button>
      </div>
    `;
  });
}

function removeWishlistItem(productId) {
  const user = getUser();
  if (!user) {
    redirectToLogin();
    return;
  }

  const ids = getWishlistIds().map(String);
  const next = ids.filter((id) => id !== String(productId));
  saveWishlistIds(next);
  renderWishlist();
}

function clearWishlist() {
  const user = getUser();
  if (!user) {
    redirectToLogin();
    return;
  }

  saveWishlistIds([]);
  renderWishlist();
}

window.removeWishlistItem = removeWishlistItem;
window.clearWishlist = clearWishlist;

renderWishlist();
