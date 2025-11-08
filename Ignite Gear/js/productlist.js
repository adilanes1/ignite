const API_BASE = "http://localhost/ignite_gear/admin/";
const IMAGE_BASE = "http://localhost/ignite_gear/";
const auth = window.auth;
async function fetchProducts() {
  try {
    const res = await fetch(API_BASE + "fetch_products.php");
    const data = await res.json();

   
    const products = data.map(p => ({
      id: p.id,
      name: p.name,
      description: (p.description && p.description !== "0") ? p.description : "No description available.",
      category: p.category,
      price: parseFloat(p.price),
     
      image: [
        p.image1 || "",
        p.image2 || "",
        p.image3 || ""
      ].filter(Boolean),

  
      tags: (() => {
        if (p.tags) {
          try {
            const parsed = JSON.parse(p.tags);
            if (Array.isArray(parsed)) return parsed;
            if (typeof parsed === "string") return [parsed];
          } catch {
            return [p.tags.replace(/['"]+/g, '')];
          }
        }
        if (p.featured == 1) return ["new"];
        if (p.discount > 0) return ["most purchased"];
        return [];
      })()
    }));

   
    window.allProducts = products;

    
    renderLatestProducts(products);
    renderMostPurchasedProducts(products);

  } catch (error) {
    console.error("Failed to fetch products:", error);
  }
}

function ProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";

  const mainImage = product.image && product.image.length > 0 
    ? product.image[0] 
    : `${IMAGE_BASE}uploads/default.jpg`;

  card.innerHTML = `
    <div class="product-image">
      <img src="${mainImage}" alt="${product.name}">
      ${product.tags.includes("most purchased") ? '<span class="badge most-purchased">Most Purchased</span>' : ''}
      ${product.tags.includes("new") ? '<span class="badge new">New</span>' : ''}
      <div class="icon-actions">
        <i class="fa-regular fa-heart wishlist-icon" onclick="addToWishlist(${product.id})"></i>
        <i class="fa-solid fa-cart-plus cart-icon" onclick="addToCart(${product.id})"></i>
      </div>
    </div>
    <div class="product-info">
      <h3>${product.name}</h3>
      <p class="description">${product.description}</p>
      <p class="category">${product.category}</p>
      <p class="price">$${product.price.toFixed(2)}</p>
      <button class="btn" onclick="viewProduct(${product.id})">View Product</button>
    </div>
  `;

  return card;
}

function renderLatestProducts(products) {
  const container = document.getElementById("latest-products");
  container.innerHTML = "";
  const latest = products.filter(p => p.tags.includes("new"));
  latest.forEach(product => {
    container.appendChild(ProductCard(product));
  });
}

function renderMostPurchasedProducts(products) {
  const container = document.getElementById("most-purchased-products");
  container.innerHTML = "";
  const mostPurchased = products.filter(p => p.tags.includes("most purchased"));

  const batchSize = 3;
  const batches = [];

  for (let i = 0; i < mostPurchased.length; i += batchSize) {
    const batchDiv = document.createElement("div");
    batchDiv.className = "batch";
    const batchItems = mostPurchased.slice(i, i + batchSize);
    batchItems.forEach(product => batchDiv.appendChild(ProductCard(product)));
    batches.push(batchDiv);
    container.appendChild(batchDiv);
  }

  let currentBatch = 0;
  if (batches.length) batches[currentBatch].classList.add("active");

  setInterval(() => {
    if (batches.length > 1) {
      batches[currentBatch].classList.remove("active");
      currentBatch = (currentBatch + 1) % batches.length;
      batches[currentBatch].classList.add("active");
    }
  }, 4000);
}

function viewProduct(id) {
  window.location.href = `/productdetail/product-detail.html?id=${id}`;
}

async function addToCart(productId) {
  const btn = document.getElementById("add-to-cart");

  try {
  
    const user = auth.currentUser;

    if (!user) {
      alert("Please log in first to add products to your cart.");
   
      return;
    }

    
    const userId = user.uid;
    const formData = new FormData();
    formData.append("product_id", productId);
    formData.append("quantity", 1);
    formData.append("firebase_uid", userId);

    const res = await fetch(`${API_BASE}add_to_cart.php`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (data.success) {
      alert(" Product added to cart!");
      setViewCartButton(btn);
    } else {
      if (data.message === "Product already in cart!") {
        setViewCartButton(btn);
      } else {
        alert(data.message);
      }
    }
  } catch (err) {
    console.error("Error adding to cart:", err);
   
  }
}

function addToWishlist(id) {
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  const product = window.allProducts.find(p => p.id === id);
  if (!wishlist.find(item => item.id === id)) {
    wishlist.push(product);
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    alert(`${product.name} added to wishlist`);
  } else {
    alert(`${product.name} is already in wishlist`);
  }
}

document.addEventListener("DOMContentLoaded", fetchProducts);
