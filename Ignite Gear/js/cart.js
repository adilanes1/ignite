console.log(" cart.js loaded and executed successfully");
console.log("window.auth:", window.auth);
console.log("window.onAuthStateChanged:", window.onAuthStateChanged);

const DELIVERY_CHARGE = 10;
const firebaseAuth = window.auth || null;

const cartItemsContainer = document.querySelector("#cart-items .items-list");
const subtotalElement = document.getElementById("subtotal");
const totalElement = document.getElementById("total");
const purchaseBtn = document.getElementById("purchase-btn");


async function waitForUser() {
  return new Promise((resolve) => {
    if (firebaseAuth?.currentUser) return resolve(firebaseAuth.currentUser);
    const unsubscribe = window.onAuthStateChanged(firebaseAuth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}


async function fetchCart() {
  console.log("Fetching cart items...");
  const user = await waitForUser();
  console.log("Fetching cart for user:", user ? user.uid : "No user");

  if (!user) {
    cartItemsContainer.innerHTML = `<p class="empty">Please log in to view your cart </p>`;
    subtotalElement.textContent = "$0.00";
    totalElement.textContent = "$0.00";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}get_cart.php?firebase_uid=${encodeURIComponent(user.uid)}`);
    if (!res.ok) throw new Error("Network error");

    const data = await res.json();
    console.log(" Cart response:", data);

    if (!data.success) throw new Error(data.message || "Failed to load cart");
    renderCart(data.data);
  } catch (err) {
    console.error(" Error loading cart:", err);
    cartItemsContainer.innerHTML = `<p class="error">Error loading cart</p>`;
  }
}

purchaseBtn.addEventListener("click", () => {
  const user = firebaseAuth?.currentUser;
  if (!user) {
    alert("Please log in to continue with checkout ");
    return;
  }

 
  const subtotal = subtotalElement.textContent;
  const total = totalElement.textContent;

  sessionStorage.setItem("checkoutSubtotal", subtotal);
  sessionStorage.setItem("checkoutTotal", total);

  window.location.href = "/checkout/checkout.html";
});


function renderCart(cart) {
  cartItemsContainer.innerHTML = "";

  if (!cart || cart.length === 0) {
    cartItemsContainer.innerHTML = `<p class="empty">Your cart is empty </p>`;
    subtotalElement.textContent = "$0.00";
    totalElement.textContent = "$0.00";
    return;
  }

  let subtotal = 0;

  cart.forEach((item, index) => {
    const addedAt = new Date(item.created_at || Date.now()).getTime();
    const now = Date.now();
    const diff = now - addedAt;

    let price = Number(item.price);
    let discountInfo = "";

    
    if (diff < 24 * 60 * 60 * 1000) {
      price = Number((price * 0.9).toFixed(2));
      discountInfo = `
        <div class="discount-timer" id="timer-${index}">
          <p class="discount-msg">🔥 10% OFF — ends in <span class="time"></span></p>
        </div>`;
      setTimeout(() => {
        const timerEl = document.querySelector(`#timer-${index} .time`);
        if (timerEl) startCountdown(addedAt, timerEl);
      }, 0);
    }

    subtotal += price * Number(item.quantity);

    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
      <div class="item-info">
        <img src="${IMAGE_BASE}${item.product_image}" alt="${item.product_name}" class="cart-item-img">

        <div>
          <h3>${item.product_name}</h3>
          <p class="price">$${price.toFixed(2)}</p>
          ${discountInfo}
        </div>
      </div>
      <div class="item-actions">
        <button class="qty-btn" data-id="${item.product_id}" data-action="minus">-</button>
        <span>${item.quantity}</span>
        <button class="qty-btn" data-id="${item.product_id}" data-action="plus">+</button>
        <button class="remove-btn" data-id="${item.product_id}">🗑️</button>
      </div>`;
    cartItemsContainer.appendChild(div);
  });

  subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
  totalElement.textContent = `$${(subtotal + DELIVERY_CHARGE).toFixed(2)}`;
}


function startCountdown(startTime, element) {
  function updateTimer() {
    const now = Date.now();
    const remaining = 24 * 60 * 60 * 1000 - (now - startTime);
    if (!element) return;

    if (remaining <= 0) {
      element.textContent = "Expired";
      const parent = element.parentElement;
      if (parent) parent.style.color = "#ff4d4d";
      clearInterval(intervalId);
      return;
    }

    const h = Math.floor((remaining / (1000 * 60 * 60)) % 24);
    const m = Math.floor((remaining / (1000 * 60)) % 60);
    const s = Math.floor((remaining / 1000) % 60);
    element.textContent = `${h}h ${m}m ${s}s`;
  }

  updateTimer();
  const intervalId = setInterval(updateTimer, 1000);
}


cartItemsContainer.addEventListener("click", async (e) => {
  const user = firebaseAuth?.currentUser;
  if (!user) return;


  if (e.target.classList.contains("qty-btn")) {
    const id = e.target.dataset.id;
    const action = e.target.dataset.action;
    try {
      await fetch(`${API_BASE}update_cart.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firebase_uid: user.uid, product_id: id, action }),
      });
      fetchCart();
    } catch (err) {
      console.error("Qty update failed:", err);
    }
  }

  if (e.target.classList.contains("remove-btn")) {
    const id = e.target.dataset.id;
    try {
      await fetch(`${API_BASE}remove_cart.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firebase_uid: user.uid, product_id: id }),
      });
      fetchCart();
    } catch (err) {
      console.error("Remove item failed:", err);
    }
  }
});

document.addEventListener("DOMContentLoaded", fetchCart);
