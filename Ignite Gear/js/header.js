document.addEventListener("DOMContentLoaded", () => {
  async function initHeader() {
    const menuToggle = document.getElementById("menu-toggle");
    const navbar = document.getElementById("navbar");
    const logo = document.getElementById("logo");
    const cartCount = document.getElementById("cart-count");
    const adminLink = document.querySelector('a[href="/admin/admin.html"]'); 

    if (!cartCount) {
      setTimeout(initHeader, 200);
      return;
    }

    if (menuToggle && navbar) {
      menuToggle.addEventListener("click", () => {
        navbar.classList.toggle("active");
        menuToggle.classList.toggle("open");
      });
    }

    if (logo) {
      logo.addEventListener("click", () => {
        window.location.href = "../../index.html";
      });
    }

    const firebaseAuth = window.auth || null;

    async function waitForUser() {
      return new Promise((resolve) => {
        if (firebaseAuth?.currentUser) return resolve(firebaseAuth.currentUser);
        const unsubscribe = window.onAuthStateChanged(firebaseAuth, (user) => {
          unsubscribe();
          resolve(user);
        });
      });
    }

    async function updateCartCount() {
      const countEl = document.getElementById("cart-count");
      if (!countEl) return;

      const user = await waitForUser();
      if (!user) {
        countEl.textContent = "";
        return;
      }

      try {
        const res = await fetch(`${API_BASE}get_cart.php?firebase_uid=${encodeURIComponent(user.uid)}`);
        if (!res.ok) throw new Error("Network error");
        const data = await res.json();

        if (!data.success) throw new Error(data.message || "Failed to load cart");

        const cart = data.data || [];
        let totalItems = 0;

        cart.forEach(item => {
          totalItems += Number(item.quantity) || 1;
        });

        countEl.textContent = totalItems > 0 ? totalItems : "";
      } catch (err) {
        console.error(" Error updating cart count:", err);
        countEl.textContent = "";
      }
    }

    async function handleAdminPanelVisibility() {
      const user = await waitForUser();

      if (user && user.email === "40799889@live.napier.ac.uk") {
        if (adminLink) adminLink.style.display = "inline-block"; 
      } else {
        if (adminLink) adminLink.style.display = "none"; 
      }
    }

   
    updateCartCount();
    handleAdminPanelVisibility();

    window.addEventListener("cartUpdated", updateCartCount);
    window.addEventListener("storage", updateCartCount);

    if (window.onAuthStateChanged && firebaseAuth) {
      window.onAuthStateChanged(firebaseAuth, () => {
        updateCartCount();
        handleAdminPanelVisibility();
      });
    }
  }

  initHeader();
});
