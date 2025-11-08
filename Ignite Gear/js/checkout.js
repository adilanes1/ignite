console.log(" checkout.js loaded successfully");

const API_BASE = "http://localhost/ignite_gear/admin/";
const IMAGE_BASE = "http://localhost/ignite_gear/";

async function waitForFirebase() {
  return new Promise((resolve) => {
    const check = () => {
      if (window.auth && window.onAuthStateChanged) return resolve(true);
      setTimeout(check, 100);
    };
    check();
  });
}

async function initCheckout() {
  await waitForFirebase();
  console.log(" Firebase ready in checkout.js");

  const firebaseAuth = window.auth;
  const orderItemsContainer = document.getElementById("order-items");
  const subtotalEl = document.getElementById("subtotal");
  const taxEl = document.getElementById("tax");
  const deliveryEl = document.getElementById("delivery");
  const totalEl = document.getElementById("total");

  const DELIVERY_CHARGE = 10;
  const TAX_RATE = 0.08;

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
    const user = await waitForUser();
    console.log("Fetching cart for user:", user ? user.uid : "No user");

    if (!user) {
      orderItemsContainer.innerHTML = `<p class="empty">Please log in to view your cart 🛒</p>`;
      subtotalEl.textContent = "$0.00";
      taxEl.textContent = "$0.00";
      totalEl.textContent = "$0.00";
      return;
    }

    try {
      const res = await fetch(`${API_BASE}get_cart.php?firebase_uid=${encodeURIComponent(user.uid)}`);
      const data = await res.json();
      console.log(" Cart response:", data);

      if (!data.success) throw new Error(data.message || "Failed to load cart");

      renderCheckoutCart(data.data);
    } catch (err) {
      console.error(" Error loading cart:", err);
      orderItemsContainer.innerHTML = `<p class="error">Error loading cart</p>`;
    }
  }

  function renderCheckoutCart(cart) {
    orderItemsContainer.innerHTML = "";

    if (!cart || cart.length === 0) {
      orderItemsContainer.innerHTML = `<p class="empty">Your cart is empty 🛒</p>`;
      subtotalEl.textContent = "$0.00";
      taxEl.textContent = "$0.00";
      totalEl.textContent = "$0.00";
      return;
    }

    let subtotal = 0;

    cart.forEach((item) => {
      const price = Number(item.price);
      const quantity = Number(item.quantity);
      const totalPrice = price * quantity;
      subtotal += totalPrice;

      const div = document.createElement("div");
      div.classList.add("order-item");
      div.innerHTML = `
        <div class="item-info">
          <img src="${IMAGE_BASE}${item.product_image}" alt="${item.product_name}" class="item-img">
          <div>
            <h4>${item.product_name}</h4>
            <p>Qty: ${quantity}</p>
          </div>
        </div>
        <p class="item-price">$${totalPrice.toFixed(2)}</p>
      `;
      orderItemsContainer.appendChild(div);
    });

    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax + DELIVERY_CHARGE;

    subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    taxEl.textContent = `$${tax.toFixed(2)}`;
    deliveryEl.textContent = `$${DELIVERY_CHARGE.toFixed(2)}`;
    totalEl.textContent = `$${total.toFixed(2)}`;
  }

 
  document.getElementById("checkout-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = await waitForUser();
    if (!user) {
      alert("Please log in to confirm your purchase.");
      return;
    }

    const orderData = {
      firebase_uid: user.uid,
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value,
      address: document.getElementById("address").value,
      city: document.getElementById("city").value,
      postal: document.getElementById("postal").value,
      card_name: document.getElementById("card-name").value,
      card_number: document.getElementById("card-number").value,
      expiry: document.getElementById("expiry").value,
      cvv: document.getElementById("cvv").value,
      subtotal: parseFloat(subtotalEl.textContent.replace("$", "")) || 0,
      tax: parseFloat(taxEl.textContent.replace("$", "")) || 0,
      delivery: parseFloat(deliveryEl.textContent.replace("$", "")) || 0,
      total: parseFloat(totalEl.textContent.replace("$", "")) || 0,
      products: []
    };

   
    document.querySelectorAll(".order-item").forEach((item) => {
      const name = item.querySelector("h4").textContent;
      const priceText = item.querySelector(".item-price").textContent.replace("$", "");
      const qtyText = item.querySelector("p").textContent.replace("Qty: ", "");
      orderData.products.push({
        name,
        price: parseFloat(priceText) / parseInt(qtyText),
        quantity: parseInt(qtyText)
      });
    });

    try {
      const res = await fetch(`${API_BASE}store_purchase.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });

      const result = await res.json();
      console.log(" Purchase response:", result);

      if (result.success) {
        alert(" Order confirmed! Thank you for shopping with Ignite Gear.");

        
        try {
          await fetch(`${API_BASE}update_most_purchased.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ products: orderData.products })
          });
          console.log(" Product tags updated to 'Most Purchased'");
        } catch (updateErr) {
          console.error("Failed to update product tags:", updateErr);
        }

       
        localStorage.removeItem("cart");
      } else {
        alert(" Failed to store purchase: " + result.message);
      }
    } catch (err) {
      console.error(" Error saving purchase:", err);
      alert("Error saving your order.");
    }
  });

  document.addEventListener("DOMContentLoaded", fetchCart);
}

initCheckout();
