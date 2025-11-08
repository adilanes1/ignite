
const params = new URLSearchParams(window.location.search);
const productId = parseInt(params.get("id"));

const sliderContainer = document.getElementById("image-slider");
const productDetails = document.getElementById("product-details");
const deliveryTime = document.getElementById("delivery-time");
const reviewsList = document.getElementById("reviews-list");
const auth = window.auth;


async function fetchProduct() {
  try {
    const res = await fetch(`${API_BASE}get_product.php?id=${productId}`);
    const data = await res.json();

    if (!data.success || !data.product) {
      productDetails.innerHTML = "<p>Product not found.</p>";
      return;
    }

    const product = data.product;
    renderProduct(product);
    checkIfInCart(productId);
    fetchRelatedProducts(product.category, product.id);
  } catch (err) {
    console.error("Error fetching product:", err);
    productDetails.innerHTML = "<p>Error loading product details.</p>";
  }
}

function renderProduct(product) {
  sliderContainer.innerHTML = "";

  if (product.images && product.images.length > 0) {
    product.images.forEach((imgSrc, index) => {
      const img = document.createElement("img");
      img.src = imgSrc;
      if (index === 0) img.classList.add("active");
      sliderContainer.appendChild(img);
    });

    const dots = document.createElement("div");
    dots.classList.add("slider-dots");
    product.images.forEach((_, i) => {
      const dot = document.createElement("span");
      if (i === 0) dot.classList.add("active");
      dot.addEventListener("click", () => showSlide(i));
      dots.appendChild(dot);
    });
    sliderContainer.appendChild(dots);

    let current = 0;
    const slides = sliderContainer.querySelectorAll("img");
    const allDots = dots.querySelectorAll("span");
    function showSlide(n) {
      slides[current].classList.remove("active");
      allDots[current].classList.remove("active");
      current = n;
      slides[current].classList.add("active");
      allDots[current].classList.add("active");
    }
    setInterval(() => showSlide((current + 1) % slides.length), 3000);
  }

  productDetails.innerHTML = `
    <h2>${product.name}</h2>
    <p class="category">${product.category}</p>
    <p>${
      product.description && product.description !== "0"
        ? product.description
        : "No description available."
    }</p>
    <p class="price">$${parseFloat(product.price).toFixed(2)}</p>
    <button class="add-to-cart-btn" id="add-to-cart">Add to Cart</button>
  `;

  document
    .getElementById("add-to-cart")
    .addEventListener("click", () => addToCart(product.id));

  const randomDays = Math.floor(Math.random() * 3) + 2;
  deliveryTime.textContent = `Estimated Delivery: ${randomDays}-Day Shipping`;
}


function setViewCartButton(button) {
  button.textContent = "View Cart";
  button.style.backgroundColor = "#007BFF";
  button.style.color = "#fff";
  button.style.border = "none";
  button.onclick = () => {
    window.location.href = "/cart/cart.html";
  };
}

async function checkIfInCart(productId) {
  try {
    const user = auth.currentUser;
    const uid = user ? user.uid : "";

    const res = await fetch(`${API_BASE}check_cart.php?product_id=${productId}&firebase_uid=${uid}`);
    const data = await res.json();

    const btn = document.getElementById("add-to-cart");
    if (data.inCart) setViewCartButton(btn);
  } catch (err) {
    console.error("Error checking cart:", err);
  }
}


async function addToCart(productId) {
  const btn = document.getElementById("add-to-cart");

  try {
   
    const user = auth.currentUser;

    if (!user) {
      alert(" Please log in first to add products to your cart.");
      
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
    alert(" Failed to add product to cart.");
  }
}


async function fetchRelatedProducts(category, id) {
  try {
    const res = await fetch(
      `${API_BASE}get_products_by_category.php?category=${encodeURIComponent(
        category
      )}&id=${id}`
    );
    const data = await res.json();

    const container = document.getElementById("related-products-container");
    if (!data.success || !data.products || data.products.length === 0) {
      container.innerHTML = "<p>No related products found.</p>";
      return;
    }

    container.innerHTML = "";
    data.products.slice(0, 4).forEach((p) => {
      const card = document.createElement("div");
      card.classList.add("related-product-card");
      card.innerHTML = `
        <img src="${p.images[0]}" alt="${p.name}" class="related-product-image" />
        <h4 class="related-product-name">${p.name}</h4>
        <p class="related-product-price">$${p.price}</p>
        <button class="view-product-btn">View Product</button>
      `;
      card
        .querySelector(".view-product-btn")
        .addEventListener(
          "click",
          () => (window.location.href = `/productdetail/product-detail.html?id=${p.id}`)
        );
      container.appendChild(card);
    });
  } catch (err) {
    console.error("Error fetching related products:", err);
  }
}

const starsContainer = document.getElementById("star-rating");
const reviewText = document.getElementById("review-text");
const submitReviewBtn = document.getElementById("submit-review");
let selectedRating = 0;

// Star click listener
starsContainer.querySelectorAll("span").forEach(star => {
  star.addEventListener("click", () => {
    selectedRating = parseInt(star.dataset.value);
    highlightStars(selectedRating);
  });
});

function highlightStars(rating) {
  starsContainer.querySelectorAll("span").forEach(star => {
    star.style.color = star.dataset.value <= rating ? "#FFD700" : "#ccc";
  });
}

// Submit review
submitReviewBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) {
    alert(" Please log in to submit a review.");
    return;
  }

  const text = reviewText.value.trim();
  if (!selectedRating) {
    alert("Please select a rating first.");
    return;
  }

  const formData = new FormData();
  formData.append("product_id", productId);
  formData.append("firebase_uid", user.uid);
  formData.append("rating", selectedRating);
  formData.append("review_text", text);

  try {
    const res = await fetch(`${API_BASE}add_review.php`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    if (data.success) {
      alert(" Review added successfully!");
      reviewText.value = "";
      selectedRating = 0;
      highlightStars(0);
      fetchReviews(); 
    } else {
      alert(" " + data.message);
    }
  } catch (err) {
    console.error("Error submitting review:", err);
    alert("Error submitting review.");
  }
});


async function fetchReviews() {
  try {
    const res = await fetch(`${API_BASE}get_reviews.php?product_id=${productId}`);
    const data = await res.json();

    const container = document.getElementById("reviews-list");
    container.innerHTML = "<h3>Reviews</h3>";

    if (!data.success || data.reviews.length === 0) {
      container.innerHTML += "<p>No reviews yet.</p>";
      return;
    }

    data.reviews.forEach(r => {
      const div = document.createElement("div");
      div.classList.add("review-item");
      div.innerHTML = `
        <div class="review-header">
          <strong>${r.user_id.slice(0, 6)}...</strong>
          <span class="stars">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</span>
        </div>
        <p>${r.review_text || ""}</p>
        <small>${new Date(r.created_at).toLocaleString()}</small>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error("Error fetching reviews:", err);
  }
}

document.addEventListener("DOMContentLoaded", fetchReviews);


if (auth) {
  window.onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log(" Logged in as:", user.email);
    } else {
      console.log(" Not logged in");
    }
  });
} else {
  console.warn("Firebase auth not initialized yet.");
}


document.addEventListener("DOMContentLoaded", fetchProduct);
