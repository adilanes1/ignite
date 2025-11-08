
const searchInput = document.getElementById("search-input");
const categoryFilters = [
  document.getElementById("sportswear"),
  document.getElementById("footwear"),
  document.getElementById("accessories"),
];
const ageFilters = document.querySelectorAll(".filter-age");
const sizeFilters = document.querySelectorAll(".filter-size");
const priceRange = document.getElementById("price-range");
const priceValue = document.getElementById("price-value");

categoryFilters.forEach(input => {
  if (input.id === "sportswear") input.value = "Sportswear";
  if (input.id === "footwear") input.value = "Footwear";
  if (input.id === "accessories") input.value = "Accessories";
});

let products = [];

async function fetchShopProducts() {
  try {
    const res = await fetch(API_BASE + "fetch_products.php");
    const data = await res.json();
    products = data.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      age: p.age || "Adult",
      size: p.size || "M",
      price: parseFloat(p.price),
      image: [
        p.image1 || "",
        p.image2 || "",
        p.image3 || ""
      ].filter(Boolean)
    }));
    filterProducts();
  } catch (err) {
    console.error("Failed to fetch products:", err);
  }
}

function ProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";

  const mainImage = product.image.length > 0 ? product.image[0] : `${IMAGE_BASE}uploads/default.jpg`;

  card.innerHTML = `
    <div class="product-image">
      <img src="${mainImage}" alt="${product.name}">
      <div class="icon-actions">
        <i class="fa-regular fa-heart wishlist-icon" onclick="addToWishlist(${product.id})"></i>
        <i class="fa-solid fa-cart-plus cart-icon" onclick="addToCart(${product.id})"></i>
      </div>
    </div>
    <div class="product-info">
      <h3>${product.name}</h3>
      <p class="category">${product.category}</p>
      <p class="price">$${product.price.toFixed(2)}</p>
      <button class="btn" onclick="viewProduct(${product.id})">View Product</button>
    </div>
  `;
  return card;
}

function filterProducts() {
  const searchText = searchInput.value.toLowerCase();
  const selectedCategories = categoryFilters.filter(c => c.checked).map(c => c.value.toLowerCase());
  const selectedAges = Array.from(ageFilters).filter(a => a.checked).map(a => a.value.toLowerCase());
  const selectedSizes = Array.from(sizeFilters).filter(s => s.checked).map(s => s.value.toLowerCase());
  const maxPrice = parseFloat(priceRange.value);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchText) &&
    (selectedCategories.length ? selectedCategories.includes(p.category.toLowerCase()) : true) &&
    (selectedAges.length ? selectedAges.includes(p.age.toLowerCase()) : true) &&
    (selectedSizes.length ? selectedSizes.includes(p.size.toLowerCase()) : true) &&
    p.price <= maxPrice
  );

  renderShopProducts(filtered);
}

function renderShopProducts(list) {
  const container = document.getElementById("shop-products");
  container.innerHTML = "";
  list.forEach(p => container.appendChild(ProductCard(p)));
}

function viewProduct(id) {
  window.location.href = `/productdetail/product-detail.html?id=${id}`;
}

function addToCart(id) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const product = products.find(p => p.id === id);
  const existing = cart.find(item => item.id === id);
  if (existing) existing.quantity += 1;
  else cart.push({ ...product, image: product.image[0], quantity: 1 });
  localStorage.setItem("cart", JSON.stringify(cart));
  alert(`${product.name} added to cart`);
}

function addToWishlist(id) {
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  const product = products.find(p => p.id === id);
  if (!wishlist.find(item => item.id === id)) {
    wishlist.push(product);
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    alert(`${product.name} added to wishlist`);
  } else alert(`${product.name} is already in wishlist`);
}

searchInput.addEventListener("input", filterProducts);
categoryFilters.forEach(f => f.addEventListener("change", filterProducts));
ageFilters.forEach(f => f.addEventListener("change", filterProducts));
sizeFilters.forEach(f => f.addEventListener("change", filterProducts));
priceRange.addEventListener("input", () => {
  priceValue.textContent = `$${priceRange.value}`;
  filterProducts();
});

document.addEventListener("DOMContentLoaded", () => {
  const initialCategory = new URLSearchParams(window.location.search).get("category");
  if (initialCategory) categoryFilters.forEach(f => f.checked = f.value.toLowerCase() === initialCategory.toLowerCase());
  fetchShopProducts();
});
