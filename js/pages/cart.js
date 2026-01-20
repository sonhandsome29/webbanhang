const cartBody = document.getElementById("cart-body");
const cartTotal = document.getElementById("cart-total");
const LAST_ORDER_KEY = "lastOrder";
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function renderCart() {
  const cartList = document.getElementById("cartList");
  const totalPrice = document.getElementById("totalPrice");

  const cart = getCart();
  cartList.innerHTML = "";

  let total = 0;

  if (cart.length === 0) {
    cartList.innerHTML = "<p>Giỏ hàng trống 💤</p>";
    totalPrice.textContent = "$0";
    return;
  }

  cart.forEach((item, index) => {
    total += item.price * item.qty;

    cartList.innerHTML += `
      <div class="cart-item">
        <img src="${item.img}">
        <div class="cart-info">
          <h4>${item.name}</h4>
          <span>$${item.price}</span>
        </div>

        <div class="qty-box">
          <button onclick="changeQty(${index}, -1)">−</button>
          <span>${item.qty}</span>
          <button onclick="changeQty(${index}, 1)">+</button>
        </div>

        <button class="remove-btn" onclick="removeItem(${index})">✖</button>
      </div>
    `;
  });

  totalPrice.textContent = `$${total}`;
}

function changeQty(index, delta) {
  const cart = getCart();
  cart[index].qty += delta;

  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }

  saveCart(cart);
  renderCart();
}

function removeItem(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCart();
}

function clearCart() {
  localStorage.removeItem("cart");
  renderCart();
}

renderCart();