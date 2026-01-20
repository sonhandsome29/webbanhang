// ================= USER =================

const USERS_KEY = "users";
const CURRENT_USER_KEY = "user";
const LAST_ORDER_KEY = "lastOrder";
let activeCategory = null;

function initAdminAccount() {
  const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];

  // init tài khoản admin đầu tiên
  const hasAdmin = users.some((user) => user.role === "admin");

  if (!hasAdmin) {
    const admin = {
      id: Date.now(),
      email: "admin@gmail.com",
      password: "admin",
      name: "admin",
      role: "admin",
    };

    users.push(admin);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    console.log("Admin account created");
  }
}

function loadHTML(url, elementId) {
  return fetch(url)
    .then((response) => response.text())
    .then((html) => {
      const el = document.getElementById(elementId);
      if (!el) return;
      el.innerHTML = html;
    })
    .catch((error) => {
      console.error("Lỗi khi load file:", url, error);
    });
}

function renderBestSellingProducts() {
  const container = document.getElementById("bestSellingTrack");
  if (!container) return;

  const products = JSON.parse(localStorage.getItem("products")) || [];
  let list = products.slice(0, 4);

  if (!list.length) {
    list = [
      {
        id: "best-1",
        name: "The north coat",
        price: 260,
        img: "https://picsum.photos/400?best1",
      },
      {
        id: "best-2",
        name: "Gucci duffle bag",
        price: 960,
        img: "https://picsum.photos/400?best2",
      },
      {
        id: "best-3",
        name: "RGB liquid CPU Cooler",
        price: 160,
        img: "https://picsum.photos/400?best3",
      },
      {
        id: "best-4",
        name: "Small BookShelf",
        price: 360,
        img: "https://picsum.photos/400?best4",
      },
    ];
  }

  renderProductCards(container, list);
}

function ensureHeaderStyles(base) {
  const href = `${base}/components/Header/header.css`;
  const existing = document.querySelector(
    'link[rel="stylesheet"][data-component="header"]',
  );
  if (existing) {
    if (existing.getAttribute("href") !== href)
      existing.setAttribute("href", href);
    return;
  }

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.setAttribute("data-component", "header");
  document.head.appendChild(link);
}

function fixHeaderRelativePaths(base) {
  const header = document.getElementById("header");
  if (!header) return;

  header.querySelectorAll("[src]").forEach((el) => {
    const src = el.getAttribute("src");
    if (!src) return;
    if (src.startsWith("./assets/")) {
      el.setAttribute("src", `${base}/${src.slice(2)}`);
    }
  });

  header.querySelectorAll("[href]").forEach((el) => {
    const href = el.getAttribute("href");
    if (!href) return;

    if (href === "/index.html") {
      el.setAttribute("href", `${base}/index.html`);
      return;
    }

    if (href.startsWith("./assets/")) {
      el.setAttribute("href", `${base}/${href.slice(2)}`);
      return;
    }

    if (href.startsWith("./pages/")) {
      el.setAttribute("href", `${base}/${href.slice(2)}`);
      return;
    }
  });
}

function syncActiveCategoryUI() {
  const items = document.querySelectorAll(
    "#menu .menu-list-item, #mobileMenu .menu-list-item",
  );
  if (!items.length) return;

  const current = activeCategory || "";
  items.forEach((li) => {
    const liCategory = li.dataset.category || "";
    li.classList.toggle("is-active", liCategory === current);
  });
}

function getUser() {
  return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
}

// ================= LOGOUT =================
function logout() {
  localStorage.removeItem(CURRENT_USER_KEY);
  const isInPagesFolder = window.location.pathname.includes("/pages/");
  window.location.href = isInPagesFolder ? "../index.html" : "./index.html";
}

// exposer ra global để sử dụng do <script type="module"> chuyển biến và hàm thành module scope
window.logout = logout;

// ================= CART =================
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartBadge() {
  const badge = document.getElementById("headerCartBadge");
  if (!badge) return;

  const cart = getCart();
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  badge.textContent = total;
}

// ================= WISHLIST =================
const WISHLIST_PREFIX = "wishlist:";

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

function isInWishlist(productId) {
  return getWishlistIds().some((id) => String(id) === String(productId));
}

function updateWishlistBadge() {
  const badge = document.getElementById("headerWishlistBadge");
  if (!badge) return;

  const user = getUser();
  if (!user || user.role !== "customer") {
    badge.textContent = "0";
    badge.style.display = "none";
    return;
  }

  const count = getWishlistIds().length;
  badge.textContent = count;
  badge.style.display = count > 0 ? "flex" : "none";
}

function redirectToLoginForWishlist() {
  alert("Vui lòng đăng nhập để sử dụng wishlist!");
  const isInPagesFolder = window.location.pathname.includes("/pages/");
  window.location.href = isInPagesFolder ? "login.html" : "pages/login.html";
}

function toggleWishlist(productId) {
  const user = getUser();
  if (!user) {
    redirectToLoginForWishlist();
    return { added: false, ids: [] };
  }

  if (user.role !== "customer") {
    alert("Admin không thể sử dụng wishlist!");
    return { added: false, ids: getWishlistIds() };
  }

  const nextId = String(productId);
  const ids = getWishlistIds().map(String);
  const index = ids.indexOf(nextId);

  let added = false;
  if (index >= 0) {
    ids.splice(index, 1);
  } else {
    ids.push(nextId);
    added = true;
  }

  saveWishlistIds(ids);
  updateWishlistBadge();
  return { added, ids };
}

function bindHeaderWishlist() {
  const btn = document.getElementById("headerWishlistBtn");
  if (!btn) return;

  btn.addEventListener("click", (e) => {
    const user = getUser();
    if (!user) {
      e.preventDefault();
      redirectToLoginForWishlist();
      return;
    }

    if (user.role !== "customer") {
      e.preventDefault();
      alert("Admin không thể sử dụng wishlist!");
    }
  });
}

// ================= ADD TO CART =================
function addToCart(productId) {
  const user = getUser();

  if (!user) {
    alert("Vui lòng đăng nhập để mua hàng!");
    const isInPagesFolder = window.location.pathname.includes("/pages/");
    window.location.href = isInPagesFolder ? "login.html" : "pages/login.html";
    return;
  }

  if (user.role !== "customer") {
    alert("Admin không thể mua hàng!");
    return;
  }

  const products = JSON.parse(localStorage.getItem("products")) || [];
  const product = products.find((p) => p.id == productId);

  if (!product) {
    alert("Sản phẩm không tồn tại!");
    return;
  }

  let cart = getCart();
  const index = cart.findIndex((i) => i.id == productId);

  if (index !== -1) {
    cart[index].qty += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      img: product.img,
      qty: 1,
    });
  }

  saveCart(cart);
  updateCartBadge();
  alert("Đã thêm vào giỏ hàng 🛒");
}
// exposer ra global để sử dụng
window.addToCart = addToCart;

// ================= RENDER PRODUCTS =================
function getSearchTermFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return (params.get("q") || params.get("search") || "").trim();
}

function normalizeText(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, " ")
    .trim();
}

function setSearchTermInUrl(term, { replace = false } = {}) {
  const url = new URL(window.location.href);
  const next = (term || "").trim();
  if (!next) url.searchParams.delete("search");
  else url.searchParams.set("search", next);
  if (replace) history.replaceState({}, "", url);
  else history.pushState({}, "", url);
}

function getCategoryFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const raw = (params.get("category") || "").trim();
  return raw || null;
}

function renderProductCards(container, list) {
  if (!container) return;
  container.innerHTML = "";

  if (container.dataset.wishlistBound !== "1") {
    container.dataset.wishlistBound = "1";
    container.addEventListener(
      "click",
      (e) => {
        const btn = e.target.closest("[data-wishlist-id]");
        if (!btn || !container.contains(btn)) return;

        // handle early to avoid bubbling to `.product` inline onclick
        e.preventDefault();
        e.stopPropagation();

        const productId = btn.dataset.wishlistId;
        const result = toggleWishlist(productId);
        btn.textContent = result.added ? "♥" : "♡";
      },
      true,
    );
  }

  list.forEach((p) => {
    container.innerHTML += `
      <div class="product" onclick="goToDetail('${p.id}')">
        <span class="product-discount">-40%</span>

        <div class="product-actions">
          <button class="product-action-btn" type="button" aria-label="Wishlist" data-wishlist-id="${p.id}">${
            isInWishlist(p.id) ? "♥" : "♡"
          }</button>
          <button class="product-action-btn" aria-label="Quick view" onclick="event.stopPropagation(); goToDetail('${
            p.id
          }')">👁</button>
        </div>

        <div class="product-img-wrap">
          <img src="${p.img}" class="product-img" />

          <button class="product-cart" onclick="event.stopPropagation(); addToCart('${
            p.id
          }')">
            Add To Cart
          </button>
        </div>

        <h3 class="product-name">${p.name}</h3>

        <div class="product-price">
          <span class="price-new">$${p.price}</span>
          <span class="price-old">$${Math.round(p.price * 1.3)}</span>
        </div>

        <div class="product-rating">
          ⭐⭐⭐⭐⭐ <span>(88)</span>
        </div>
      </div>
    `;
  });
}

window.renderProductCards = renderProductCards;

function renderFlashSaleProducts(filterCategory = null) {
  const container = document.querySelector(".flash-track");
  if (!container) return;

  const products = JSON.parse(localStorage.getItem("products")) || [];
  const filteredProducts = filterCategory
    ? products.filter((p) => p.category === filterCategory)
    : products;

  renderProductCards(container, filteredProducts.slice(0, 8));
}

function renderCategoryPage() {
  const track = document.getElementById("categoryTrack");
  if (!track) return;
  const emptyMsg = document.querySelector(".no-product-messege");

  const titleEl = document.getElementById("categoryTitle");
  const category = getCategoryFromUrl();
  const products = JSON.parse(localStorage.getItem("products")) || [];
  const filtered = category
    ? products.filter((p) => p.category === category)
    : products;

  if (titleEl) titleEl.textContent = category ? category : "All";

  if (!filtered.length) {
    if (emptyMsg) emptyMsg.style.display = "flex";
    track.style.display = "none";
    return;
  }

  if (emptyMsg) emptyMsg.style.display = "none";
  track.style.display = "grid";

  renderProductCards(track, filtered);
}

function syncHeaderNavActiveState() {
  const nav = document.querySelector(".header-nav__list");
  if (!nav) return;

  const homeLink = nav.querySelector('a[href="/index.html"]');
  const categoriesBtn = document.getElementById("categoriesBtn");

  const path = (window.location.pathname || "").toLowerCase();
  const isCategoryPage = path.endsWith("/pages/category.html");

  if (homeLink) homeLink.classList.toggle("is-active", !isCategoryPage);
  if (categoriesBtn)
    categoriesBtn.classList.toggle("is-active", isCategoryPage);
}

function renderSearchResults(term, filterCategory = null) {
  const titleEl = document.getElementById("searchResultsTitle");
  const container = document.getElementById("searchResultsTrack");
  if (!container) return;

  const products = JSON.parse(localStorage.getItem("products")) || [];
  const q = normalizeText(term);
  const matched = q
    ? products.filter((p) => {
        const name = normalizeText(p.name);
        return name.includes(q);
      })
    : products;

  if (titleEl) {
    titleEl.textContent = q
      ? `Kết quả tìm kiếm: "${term}" (${matched.length})`
      : "Kết quả tìm kiếm";
  }

  if (matched.length === 0) {
    container.innerHTML = "<p>Không tìm thấy sản phẩm phù hợp.</p>";
    return;
  }

  renderProductCards(container, matched);
}

function applySearchState() {
  const flashSection = document.getElementById("flashSection");
  const bestSellingSection = document.getElementById("bestSellingSection");
  const searchSection = document.getElementById("searchResultsSection");
  const term = getSearchTermFromUrl();

  const input = document.getElementById("headerSearchInput");
  if (input) input.value = term;

  if (term) {
    if (flashSection) flashSection.hidden = true;
    if (bestSellingSection) bestSellingSection.hidden = true;
    if (searchSection) searchSection.hidden = false;
    renderSearchResults(term);
  } else {
    if (flashSection) flashSection.hidden = false;
    if (bestSellingSection) bestSellingSection.hidden = false;
    if (searchSection) searchSection.hidden = true;
    renderFlashSaleProducts(activeCategory);
    renderBestSellingProducts();
  }
}

function bindHeaderSearch() {
  const form = document.getElementById("headerSearchForm");
  const input = document.getElementById("headerSearchInput");
  const suggestions = document.getElementById("headerSearchSuggestions");
  if (!form || !input) return;

  function redirectToSearch(term) {
    const next = (term || "").trim();
    const isInPagesFolder = window.location.pathname.includes("/pages/");
    const prefix = isInPagesFolder ? "" : "pages/";
    const url = next
      ? `${prefix}search.html?q=${encodeURIComponent(next)}`
      : `${prefix}search.html`;
    window.location.href = url;
  }

  function getSuggestions(query) {
    const q = normalizeText(query);
    if (!q) return [];

    const products = JSON.parse(localStorage.getItem("products")) || [];
    const unique = new Set();

    products.forEach((p) => {
      if (p?.name) unique.add(String(p.name).trim());
    });

    const all = Array.from(unique)
      .map((s) => s.trim())
      .filter(Boolean);

    const filtered = all.filter((s) => normalizeText(s).includes(q));

    filtered.sort((a, b) => {
      const na = normalizeText(a);
      const nb = normalizeText(b);
      const aStarts = na.startsWith(q);
      const bStarts = nb.startsWith(q);
      if (aStarts !== bStarts) return aStarts ? -1 : 1;
      return na.localeCompare(nb);
    });

    return filtered.slice(0, 8);
  }

  function hideSuggestions() {
    if (!suggestions) return;
    suggestions.hidden = true;
    suggestions.innerHTML = "";
  }

  function renderSuggestions(list) {
    if (!suggestions) return;
    if (!list.length) {
      hideSuggestions();
      return;
    }

    suggestions.innerHTML = list
      .map(
        (text) =>
          `<button type="button" class="header-search__suggestion-item" data-value="${text.replace(
            /"/g,
            "&quot;",
          )}">${text}</button>`,
      )
      .join("");
    suggestions.hidden = false;
  }

  input.addEventListener("input", () => {
    renderSuggestions(getSuggestions(input.value));
  });

  input.addEventListener("focus", () => {
    renderSuggestions(getSuggestions(input.value));
  });

  suggestions?.addEventListener("click", (e) => {
    const btn = e.target.closest(".header-search__suggestion-item");
    if (!btn) return;
    const value = btn.dataset.value || btn.textContent || "";
    input.value = value;
    hideSuggestions();
    redirectToSearch(value);
  });

  document.addEventListener("click", (e) => {
    if (!suggestions || suggestions.hidden) return;
    if (!form.contains(e.target)) hideSuggestions();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const term = input.value.trim();
    hideSuggestions();
    redirectToSearch(term);
  });
}

window.addEventListener("popstate", () => {
  if (
    document.getElementById("flashSection") ||
    document.getElementById("bestSellingSection") ||
    document.getElementById("searchResultsSection")
  ) {
    applySearchState();
  }
});

function bindCategoriesDropdown() {
  const btn = document.getElementById("categoriesBtn");
  const dropdown = document.getElementById("categoriesDropdown");
  if (!btn || !dropdown) return;

  const close = () => {
    dropdown.hidden = true;
    btn.setAttribute("aria-expanded", "false");
  };
  const open = () => {
    dropdown.hidden = false;
    btn.setAttribute("aria-expanded", "true");
  };

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (dropdown.hidden) open();
    else close();
  });

  document.addEventListener("click", (e) => {
    if (dropdown.hidden) return;
    if (dropdown.contains(e.target) || e.target === btn) return;
    close();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

function bindMobileMenu() {
  const btn = document.getElementById("mobileMenuBtn");
  const panel = document.getElementById("mobileMenuPanel");
  const overlay = document.getElementById("mobileMenuOverlay");
  const closeBtn = document.getElementById("mobileMenuCloseBtn");
  if (!btn || !panel || !overlay) return;

  const open = () => {
    overlay.hidden = false;
    panel.hidden = false;
    btn.setAttribute("aria-expanded", "true");
  };

  const close = () => {
    overlay.hidden = true;
    panel.hidden = true;
    btn.setAttribute("aria-expanded", "false");
  };

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (panel.hidden) open();
    else close();
  });

  closeBtn?.addEventListener("click", () => {
    close();
  });

  overlay.addEventListener("click", () => {
    close();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !panel.hidden) close();
  });
}

function bindCategoryMenu() {
  const menu = document.getElementById("menu");
  if (!menu) return;

  menu.addEventListener("click", (e) => {
    const item = e.target.closest(".menu-list-item");
    if (!item) return;

    const category = item.dataset.category || "";
    const isInPagesFolder = window.location.pathname.includes("/pages/");
    const categoryUrl = isInPagesFolder
      ? `category.html?category=${encodeURIComponent(category)}`
      : `pages/category.html?category=${encodeURIComponent(category)}`;

    const mobilePanel = document.getElementById("mobileMenuPanel");
    const mobileOverlay = document.getElementById("mobileMenuOverlay");
    const mobileBtn = document.getElementById("mobileMenuBtn");
    if (mobilePanel && mobileOverlay && mobileBtn) {
      mobilePanel.hidden = true;
      mobileOverlay.hidden = true;
      mobileBtn.setAttribute("aria-expanded", "false");
    }

    window.location.href = categoryUrl;

    const dropdown = document.getElementById("categoriesDropdown");
    const btn = document.getElementById("categoriesBtn");
    if (dropdown && btn) {
      dropdown.hidden = true;
      btn.setAttribute("aria-expanded", "false");
    }
  });
}

function bindMobileCategoryMenu() {
  const menu = document.getElementById("mobileMenu");
  if (!menu) return;

  menu.addEventListener("click", (e) => {
    const item = e.target.closest(".menu-list-item");
    if (!item) return;

    const category = item.dataset.category || "";
    const isInPagesFolder = window.location.pathname.includes("/pages/");
    const categoryUrl = isInPagesFolder
      ? `category.html?category=${encodeURIComponent(category)}`
      : `pages/category.html?category=${encodeURIComponent(category)}`;

    const mobilePanel = document.getElementById("mobileMenuPanel");
    const mobileOverlay = document.getElementById("mobileMenuOverlay");
    const mobileBtn = document.getElementById("mobileMenuBtn");
    if (mobilePanel && mobileOverlay && mobileBtn) {
      mobilePanel.hidden = true;
      mobileOverlay.hidden = true;
      mobileBtn.setAttribute("aria-expanded", "false");
    }

    window.location.href = categoryUrl;
  });
}

// ================= LOGIN / LOGOUT UI =================
function handleAuthUI() {
  const currentUser = getUser();
  const loginLink = document.getElementById("loginLink");
  const signupLink = document.getElementById("signupLink");
  const logoutBtn = document.getElementById("logoutBtn");

  if (currentUser) {
    if (loginLink) loginLink.style.display = "none";
    if (signupLink) signupLink.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline-block";
  } else {
    if (loginLink) loginLink.style.display = "inline-block";
    if (signupLink) signupLink.style.display = "inline-block";
    if (logoutBtn) logoutBtn.style.display = "none";
  }
}
const userIcon = document.getElementById("userIcon");
const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));

function bindUserMenu() {
  const userIcon = document.getElementById("userIcon");
  const userIconImg = document.getElementById("userIconImg");
  const userMenu = document.getElementById("userMenu");

  const headEl = userMenu?.querySelector(".user-menu__head");
  const dividerEl = userMenu?.querySelector(".user-menu__divider");

  const avatarEl = document.getElementById("userMenuAvatar");
  const nameEl = document.getElementById("userMenuName");
  const emailEl = document.getElementById("userMenuEmail");

  const signInBtn = document.getElementById("menuSignIn");
  const myProfileBtn = document.getElementById("menuMyProfile");
  const settingsBtn = document.getElementById("menuSettings");
  const notificationBtn = document.getElementById("menuNotification");
  const adminDashboardBtn = document.getElementById("menuAdminDashboard");
  const logoutBtn = document.getElementById("menuLogout");

  if (!userIcon || !userMenu) return;

  const isInPagesFolder = window.location.pathname.includes("/pages/");
  const loginUrl = isInPagesFolder ? "login.html" : "pages/login.html";

  const defaultAvatar = isInPagesFolder
    ? "../assets/icons/user-icon.svg"
    : "./assets/icons/user-icon.svg";

  const loggedInAvatar = "https://i.pravatar.cc/80?img=32";

  const closeMenu = () => {
    userMenu.hidden = true;
    userIcon.setAttribute("aria-expanded", "false");
  };

  const applyUserMenuState = (u) => {
    const isLoggedIn = Boolean(u);
    const isAdmin = u?.role === "admin";

    // avatar
    if (userIconImg)
      userIconImg.src = isLoggedIn ? loggedInAvatar : defaultAvatar;
    if (avatarEl) avatarEl.src = isLoggedIn ? loggedInAvatar : defaultAvatar;

    // header info
    if (headEl) headEl.style.display = isLoggedIn ? "flex" : "none";
    if (dividerEl) dividerEl.style.display = isLoggedIn ? "block" : "none";

    // items
    if (signInBtn) signInBtn.style.display = isLoggedIn ? "none" : "flex";
    if (myProfileBtn) myProfileBtn.style.display = isLoggedIn ? "flex" : "none";
    if (settingsBtn) settingsBtn.style.display = isLoggedIn ? "flex" : "none";
    if (notificationBtn)
      notificationBtn.style.display = isLoggedIn ? "block" : "none";
    if (logoutBtn) logoutBtn.style.display = isLoggedIn ? "flex" : "none";

    // ✅ Admin Dashboard: chỉ admin mới thấy
    if (adminDashboardBtn) {
      adminDashboardBtn.hidden = !isAdmin;
      adminDashboardBtn.style.display = isAdmin ? "flex" : "none";
    }

    // name/email
    if (!isLoggedIn) return;
    const displayName = u?.fullName || u?.name || "Your name";
    const displayEmail = u?.email || "yourname@gmail.com";
    if (nameEl) nameEl.textContent = displayName;
    if (emailEl) emailEl.textContent = displayEmail;
  };

  // init state
  applyUserMenuState(JSON.parse(localStorage.getItem(CURRENT_USER_KEY)));

  const openMenu = () => {
    const u = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
    applyUserMenuState(u);
    userMenu.hidden = false;
    userIcon.setAttribute("aria-expanded", "true");
  };

  userIcon.addEventListener("click", (e) => {
    e.stopPropagation();
    if (userMenu.hidden) openMenu();
    else closeMenu();
  });

  signInBtn?.addEventListener("click", () => {
    closeMenu();
    window.location.href = loginUrl;
  });

  adminDashboardBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    const u = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
    if (!u || u.role !== "admin") {
      alert("Bạn không có quyền truy cập ❌");
      return;
    }

    closeMenu();

    window.location.href = "pages/admin.html";
  });

  document.addEventListener("click", (e) => {
    if (
      !userMenu.hidden &&
      !userMenu.contains(e.target) &&
      e.target !== userIcon
    ) {
      closeMenu();
    }
  });

  myProfileBtn?.addEventListener("click", () => {
    const u = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
    if (!u) {
      window.location.href = loginUrl;
      return;
    }
    closeMenu();
    window.location.href = isInPagesFolder
      ? "user-profile.html"
      : "pages/user-profile.html";
  });

  logoutBtn?.addEventListener("click", () => {
    closeMenu();
    window.logout?.();
  });
}

// ==========PRODUCT DETAIL=============
function goToDetail(productId) {
  const isInPagesFolder = window.location.pathname.includes("/pages/");
  const prefix = isInPagesFolder ? "" : "pages/";
  window.location.href = `${prefix}product-detail.html?id=${productId}`;
}
window.goToDetail = goToDetail;

function init() {
  initAdminAccount();
  const isInPagesFolder = window.location.pathname.includes("/pages/");
  const base = isInPagesFolder ? ".." : ".";
  const isHome =
    window.location.pathname.endsWith("/index.html") ||
    window.location.pathname === "/" ||
    window.location.pathname.endsWith("/");

  ensureHeaderStyles(base);

  if (document.getElementById("footer")) {
    loadHTML(`${base}/components/Footer/footer.html`, "footer");
  }

  if (!document.getElementById("header")) return;

  loadHTML(`${base}/components/Header/header.html`, "header").then(() => {
    fixHeaderRelativePaths(base);
    bindHeaderSearch();
    bindHeaderWishlist();
    bindCategoriesDropdown();
    bindMobileMenu();
    bindCategoryMenu();
    bindMobileCategoryMenu();
    bindUserMenu();
    updateCartBadge();
    updateWishlistBadge();
    syncHeaderNavActiveState();
    applyNavByRole();

    const backToTopBtn = document.getElementById("backToTop");
    if (backToTopBtn) {
      const syncBackToTopVisibility = () => {
        const y = window.scrollY || document.documentElement.scrollTop || 0;
        backToTopBtn.style.display = y > 300 ? "flex" : "none";
      };

      syncBackToTopVisibility();
      window.addEventListener("scroll", syncBackToTopVisibility, {
        passive: true,
      });

      backToTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    if (document.getElementById("categoryTrack")) {
      renderCategoryPage();
    } else {
      syncActiveCategoryUI();
      if (
        document.getElementById("flashSection") ||
        document.getElementById("bestSellingSection") ||
        document.getElementById("searchResultsSection")
      ) {
        applySearchState();
      }
    }
    handleAuthUI();
  });
}
init();
function applyNavByRole() {
  const u = getUser();
  const isAdmin = u?.role === "admin";

  const navShop = document.getElementById("navShop");
  const navProduct = document.getElementById("navProduct");

  if (navShop) navShop.parentElement.style.display = isAdmin ? "none" : "";
  if (navProduct)
    navProduct.parentElement.style.display = isAdmin ? "none" : "";
}
