(function () {
  const QUERY_PARAM = "q";

  function normalizeText(str) {
    return (str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/\s+/g, " ")
      .trim();
  }

  function getQueryFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return (params.get(QUERY_PARAM) || params.get("search") || "").trim();
  }

  function getProducts() {
    return JSON.parse(localStorage.getItem("products")) || [];
  }

  function getSearchPageHref(term) {
    const next = (term || "").trim();
    const isInPagesFolder = window.location.pathname.includes("/pages/");
    const prefix = isInPagesFolder ? "" : "pages/";

    if (!next) return `${prefix}search.html`;
    return `${prefix}search.html?${QUERY_PARAM}=${encodeURIComponent(next)}`;
  }

  function redirectToSearch(term) {
    window.location.href = getSearchPageHref(term);
  }

  function renderResults(term) {
    const titleEl = document.getElementById("searchResultsTitle");
    const container = document.getElementById("searchResultsTrack");
    if (!container) return;

    const products = getProducts();
    const q = normalizeText(term);

    const matched = q
      ? products.filter((p) => normalizeText(p?.name).includes(q))
      : products;

    if (titleEl) {
      titleEl.textContent = q
        ? `Kết quả tìm kiếm: "${term}" (${matched.length})`
        : `Kết quả tìm kiếm (${matched.length})`;
    }

    if (!matched.length) {
      container.classList.add("is-empty");
      container.innerHTML =
        '<p class="search-page__empty">Không tìm thấy sản phẩm phù hợp.</p>';
      return;
    }
    container.classList.remove("is-empty");

    if (typeof window.renderProductCards === "function") {
      window.renderProductCards(container, matched);
      return;
    }

    container.innerHTML = matched
      .map(
        (p) => `
        <div class="product" onclick="goToDetail('${p.id}')">
          <span class="product-discount">-40%</span>

          <div class="product-actions">
            <button class="product-action-btn" aria-label="Wishlist" onclick="event.stopPropagation(); alert('Đã thêm vào wishlist!')">♡</button>
            <button class="product-action-btn" aria-label="Quick view" onclick="event.stopPropagation(); goToDetail('${
              p.id
            }')">👁</button>
          </div>

          <div class="product-img-wrap">
            <img src="${p.img}" class="product-img" />

            <button class="product-cart" onclick="event.stopPropagation(); addToCart('${
              p.id
            }')">Add To Cart</button>
          </div>

          <h3 class="product-name">${p.name}</h3>

          <div class="product-price">
            <span class="price-new">$${p.price}</span>
            <span class="price-old">$${Math.round(p.price * 1.3)}</span>
          </div>

          <div class="product-rating">⭐⭐⭐⭐⭐ <span>(88)</span></div>
        </div>
      `
      )
      .join("");
  }

  function bindHeaderSearch() {
    const form = document.getElementById("headerSearchForm");
    const input = document.getElementById("headerSearchInput");
    const suggestions = document.getElementById("headerSearchSuggestions");
    if (!form || !input) return;

    function getSuggestions(query) {
      const q = normalizeText(query);
      if (!q) return [];

      const products = getProducts();
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
              "&quot;"
            )}">${text}</button>`
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

  function renderSearchPage() {
    const term = getQueryFromUrl();
    const input = document.getElementById("headerSearchInput");
    if (input) input.value = term;
    renderResults(term);
  }

  window.Search = {
    normalizeText,
    bindHeaderSearch,
    redirectToSearch,
    renderSearchPage,
  };

  document.addEventListener("DOMContentLoaded", () => {
    const path = (window.location.pathname || "").toLowerCase();
    const isSearchPage =
      path.endsWith("/pages/search.html") || path.endsWith("/search.html");
    if (isSearchPage) renderSearchPage();
  });
})();
