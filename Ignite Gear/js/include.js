document.addEventListener("DOMContentLoaded", () => {
 
  const getBasePath = () => {
    const depth = window.location.pathname.split("/").filter(Boolean).length - 1;
    return "../".repeat(depth);
  };
  const basePath = getBasePath();

 
  const include = async (selector, file, callback) => {
    try {
      const res = await fetch(basePath + file);
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const html = await res.text();
      const el = document.querySelector(selector);
      if (el) {
        el.innerHTML = html;
        if (callback && typeof callback === "function") callback();
      } else {
        console.error(` Selector not found: ${selector}`);
      }
    } catch (err) {
      console.error(" Error loading file:", file, err);
    }
  };

  
include("header", "components/header/index.html", () => {
  console.log(" Header loaded");

  if (typeof initAuth === "function") {
    console.log(" initAuth found — initializing...");
    initAuth();
  } else {
    console.error(" initAuth NOT found — check script order or global assignment");
  }

  initializeHeaderMenu();
});

 
  include("section.hero-container", "components/hero/index.html");
  include(".faqs-section", "components/FAQs/index.html");

  include("footer", "components/footer/index.html");

 
  include(".products-container", "components/home-content.html", () => {
    if (typeof initializeCarousels === "function") initializeCarousels();
    if (typeof initializeCategoryWall === "function") initializeCategoryWall();
    if (typeof initializeBreakers === "function") initializeBreakers();
  });
});


function initializeHeaderMenu() {
  const menuToggle = document.querySelector("#menu-toggle");
  const navbar = document.querySelector("#navbar");

  if (!menuToggle || !navbar) {
    console.error(" Menu toggle or navbar not found in DOM after injection.");
    return;
  }

  menuToggle.addEventListener("click", () => {
    navbar.classList.toggle("active");
    menuToggle.classList.toggle("active");
  });
} 