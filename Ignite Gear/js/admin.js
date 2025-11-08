const API_BASE = "http://localhost/ignite_gear/admin/";
const IMAGE_BASE = "http://localhost/ignite_gear/";

(() => {
  const productsBody = document.getElementById("productsBody");
  const btnAdd = document.getElementById("btnAdd");
  const modal = document.getElementById("modal");
  const modalClose = document.getElementById("modalClose");
  const productForm = document.getElementById("productForm");
  const formTitle = document.getElementById("formTitle");

  const pId = document.getElementById("pId");
  const pName = document.getElementById("pName");
  const pCategory = document.getElementById("pCategory");
  const pImage1 = document.getElementById("pImage1");
  const pImage2 = document.getElementById("pImage2");
  const pImage3 = document.getElementById("pImage3");
  const pPrice = document.getElementById("pPrice");
  const pQty = document.getElementById("pQty");
  const pDesc = document.getElementById("pDesc");
  const pActive = document.getElementById("pActive");
  const pFeatured = document.getElementById("pFeatured");
  const pDiscount = document.getElementById("pDiscount");
  const pDiscountStart = document.getElementById("pDiscountStart");
  const pDiscountEnd = document.getElementById("pDiscountEnd");
  const searchInput = document.getElementById("searchInput");

  
  searchInput.addEventListener("input", async (e) => {
    const query = e.target.value.toLowerCase();
    const res = await fetch(API_BASE + "fetch_products.php");
    const data = await res.json();
    const filtered = data.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
    );
    renderTable(filtered);
  });


  async function fetchProducts() {
    const res = await fetch(API_BASE + "fetch_products.php");
    const data = await res.json();
    renderTable(data);
  }

 
  async function addProduct(formData) {
    const res = await fetch(API_BASE + "add_product.php", {
      method: "POST",
      body: formData,
    });
    const text = await res.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      showToast(" Invalid JSON from server");
      return;
    }
    if (result.success) {
      showToast( result.message);
      productForm.reset();
      setTimeout(() => {
        closeModal();
        fetchProducts();
      }, 2000);
    } else {
      showToast(" Error: " + result.error);
    }
  }


  async function editProduct(formData) {
    const res = await fetch(API_BASE + "edit_product.php", {
      method: "POST",
      body: formData,
    });
    const result = await res.json();
    if (result.success) {
      showToast(" Product updated successfully!");
      productForm.reset();
      setTimeout(() => {
        closeModal();
        fetchProducts();
      }, 2000);
    } else {
      showToast(" Error: " + result.error);
    }
  }


  async function deleteProduct(id) {
    if (!confirm("Delete this product?")) return;
    const res = await fetch(API_BASE + "delete_product.php?id=" + id);
    const result = await res.json();
    if (result.success) {
      showToast(" Product deleted!");
      fetchProducts();
    } else {
      showToast(" Error: " + result.error);
    }
  }
  const previewArea = document.getElementById("previewArea");

async function previewProduct(id) {
  try {
  
    const res = await fetch(API_BASE + "fetch_products.php?id=" + id);
    const data = await res.json();

   
    const imgPath = (path) => {
      if (!path) return "";
      if (path.startsWith("http")) return path;
      if (path.startsWith("uploads")) return `${IMAGE_BASE}${path}`;
      return `${IMAGE_BASE}uploads/${path}`;
    };

   
    previewArea.innerHTML = `
      <div class="preview-box">
        <div class="preview-images">
          ${data.image1 ? `<img src="${imgPath(data.image1)}" alt="Image 1">` : ""}
          ${data.image2 ? `<img src="${imgPath(data.image2)}" alt="Image 2">` : ""}
          ${data.image3 ? `<img src="${imgPath(data.image3)}" alt="Image 3">` : ""}
        </div>
        <div class="preview-info">
          <h3>${data.name}</h3>
          <p><strong>Category:</strong> ${data.category}</p>
          <p><strong>Price:</strong> $${data.price}</p>
          <p><strong>Quantity:</strong> ${data.qty}</p>
          <p><strong>Discount:</strong> ${data.discount || 0}%</p>
          <p><strong>Start Date:</strong> ${data.discount_start || "—"}</p>
          <p><strong>End Date:</strong> ${data.discount_end || "—"}</p>
          <p><strong>Description:</strong></p>
          <p class="desc">${data.description || "No description available."}</p>
        </div>
      </div>
    `;
  } catch (err) {
    console.error("Preview failed:", err);
    previewArea.innerHTML = `<p class="error">Failed to load product preview.</p>`;
  }
}


  function renderTable(products) {
    productsBody.innerHTML = "";
    products.forEach((p) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><input type="checkbox" class="select-product" data-id="${p.id}"></td>
        <td>${p.name}</td>
        <td>${p.category}</td>
        <td>$${p.price}</td>
        <td>${p.qty}</td>
        <td>${p.discount || 0}%</td>
        <td>${p.discount_start || "—"}</td>
        <td>${p.discount_end || "—"}</td>
        <td>
          <button class="auth-btn" onclick="openEdit(${p.id})">Edit</button>
          <button class="auth-btn danger" onclick="deleteProduct(${p.id})">Delete</button>
          <button class="auth-btn view-btn" onclick="previewProduct(${p.id})">View</button>
        </td>
      `;
      productsBody.appendChild(tr);
    });
  }


  function openAdd() {
    formTitle.textContent = "Add Product";
    productForm.reset();
    pId.value = "";
    showModal();
  }

  function formatDateForInput(dateString) {
    if (!dateString) return "";
    const d = new Date(dateString);
    if (isNaN(d)) return "";
    return d.toISOString().slice(0, 16);
  }

 
  window.openEdit = async function (id) {
    const res = await fetch(API_BASE + "fetch_products.php?id=" + id);
    const data = await res.json();
    if (data) {
      formTitle.textContent = "Edit Product";
      pId.value = data.id;
      pName.value = data.name;
      pCategory.value = data.category;
      pPrice.value = data.price;
      pQty.value = data.qty;
      pDesc.value = data.description;
      pActive.checked = data.active == 1;
      pFeatured.checked = data.featured == 1;
      pDiscount.value = data.discount;
      pDiscountStart.value = formatDateForInput(data.discount_start);
      pDiscountEnd.value = formatDateForInput(data.discount_end);
      showModal();
    }
  };

  productForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(productForm);

  
  if (formData.get("discountStart"))
    formData.append("discount_start", formData.get("discountStart"));
  if (formData.get("discountEnd"))
    formData.append("discount_end", formData.get("discountEnd"));

  if (pId.value) {
    formData.append("id", pId.value);
    await editProduct(formData);
  } else {
    await addProduct(formData);
  }
});


  function showModal() {
    modal.classList.remove("hidden");
  }
  function closeModal() {
    modal.classList.add("hidden");
  }

  modalClose.addEventListener("click", closeModal);
  btnAdd.addEventListener("click", openAdd);

  fetchProducts();
  loadCategories();

 
  const btnBulkDiscount = document.getElementById("btnBulkDiscount");
  const discountModal = document.getElementById("discountModal");
  const discountClose = document.getElementById("discountClose");
  const bulkPercent = document.getElementById("bulkSelectedPercent");
  const bulkEnd = document.getElementById("bulkSelectedEnd");
  const applyBulkSelected = document.getElementById("applyBulkSelected");
  const cancelBulk = document.getElementById("cancelBulk");

  btnBulkDiscount.addEventListener("click", () => {
    const selectedRows = document.querySelectorAll(".select-product:checked");
    if (selectedRows.length === 0) {
      alert("Please select at least one product.");
      return;
    }
    discountModal.classList.remove("hidden");
    discountModal.setAttribute("aria-hidden", "false");
  });

  discountClose.addEventListener("click", () => {
    discountModal.classList.add("hidden");
  });
  cancelBulk.addEventListener("click", () => {
    discountModal.classList.add("hidden");
  });

  applyBulkSelected.addEventListener("click", async () => {
    const discount = bulkPercent.value.trim();
    const discountEnd = bulkEnd.value.trim();

    if (!discount || isNaN(discount) || discount <= 0) {
      alert("Please enter a valid discount percentage.");
      return;
    }

    const selectedRows = document.querySelectorAll(".select-product:checked");
    if (selectedRows.length === 0) {
      alert("No products selected.");
      return;
    }

    applyBulkSelected.disabled = true;
    applyBulkSelected.innerText = "Applying...";

    const updates = Array.from(selectedRows).map(async (checkbox) => {
      const id = checkbox.getAttribute("data-id");
      const response = await fetch(API_BASE + "update_discount.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          discount: parseInt(discount),
          discountStart: new Date().toISOString(),
          discountEnd: discountEnd || null,
          active: 1,
        }),
      });
      return response.json();
    });

    await Promise.allSettled(updates);
    applyBulkSelected.disabled = false;
    applyBulkSelected.innerText = "Apply";
    discountModal.classList.add("hidden");
    showToast(" Discount applied successfully!");
    fetchProducts();
  });

 
  const btnDeleteDiscount = document.getElementById("btnDeleteDiscount");
  btnDeleteDiscount.addEventListener("click", async () => {
    const selected = document.querySelectorAll(".select-product:checked");
    if (selected.length === 0) return alert("Select products first!");

    btnDeleteDiscount.disabled = true;

    await Promise.allSettled(
      Array.from(selected).map(async (chk) => {
        const id = chk.dataset.id;
        const res = await fetch(API_BASE + "update_discount.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id,
            discount: 0,
            discountStart: null,
            discountEnd: null,
            active: 1,
          }),
        });
        return res.json();
      })
    );

    btnDeleteDiscount.disabled = false;
    showToast(" Discounts removed!");
    fetchProducts();
  });

  
  const applyCategoryBtn = document.getElementById("applyCategoryDiscount");
  const categoryDiscountModal = document.getElementById("categoryDiscountModal");
  const categoryDiscountClose = document.getElementById("categoryDiscountClose");
  const applyCategoryDiscountModal = document.getElementById("applyCategoryDiscountModal");
  const cancelCategoryDiscount = document.getElementById("cancelCategoryDiscount");
  const categorySelectForDiscount = document.getElementById("categorySelectForDiscount");
  const categoryDiscountPercent = document.getElementById("categoryDiscountPercent");
  const categoryDiscountEnd = document.getElementById("categoryDiscountEnd");

  applyCategoryBtn.addEventListener("click", () => {
    categoryDiscountModal.classList.remove("hidden");
  });

  categoryDiscountClose.addEventListener("click", () => {
    categoryDiscountModal.classList.add("hidden");
  });
  cancelCategoryDiscount.addEventListener("click", () => {
    categoryDiscountModal.classList.add("hidden");
  });

  applyCategoryDiscountModal.addEventListener("click", async () => {
    const selectedCategory = categorySelectForDiscount.value.trim();
    const discount = categoryDiscountPercent.value.trim();
    const discountEnd = categoryDiscountEnd.value.trim();

    if (!selectedCategory) {
      alert("Please select a category.");
      return;
    }

    if (!discount || isNaN(discount) || discount <= 0) {
      alert("Please enter a valid discount percentage.");
      return;
    }

    applyCategoryDiscountModal.disabled = true;
    applyCategoryDiscountModal.innerText = "Applying...";

    const res = await fetch(API_BASE + "fetch_products.php");
    const products = await res.json();
    const filtered = products.filter((p) => p.category === selectedCategory);

    const updates = filtered.map(async (p) => {
      const response = await fetch(API_BASE + "update_discount.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: p.id,
          discount: parseInt(discount),
          discountStart: new Date().toISOString(),
          discountEnd: discountEnd || null,
          active: 1,
        }),
      });
      return response.json();
    });

    await Promise.allSettled(updates);
    applyCategoryDiscountModal.disabled = false;
    applyCategoryDiscountModal.innerText = "Apply";
    categoryDiscountModal.classList.add("hidden");
    showToast(` Discount applied to ${selectedCategory} category!`);
    fetchProducts();
  });

  async function loadCategories() {
    const res = await fetch(API_BASE + "fetch_products.php");
    const data = await res.json();
    const categories = [...new Set(data.map((p) => p.category))];
    const select = document.getElementById("filterCategory");
    const bulkSelect = document.getElementById("bulkCategorySelect");
    const categorySelectForDiscount = document.getElementById("categorySelectForDiscount");
    select.innerHTML = `<option value="">All categories</option>`;
    bulkSelect.innerHTML = `<option value="">Select category</option>`;
    categorySelectForDiscount.innerHTML = `<option value="">Select category</option>`;
    categories.forEach((cat) => {
      select.innerHTML += `<option value="${cat}">${cat}</option>`;
      bulkSelect.innerHTML += `<option value="${cat}">${cat}</option>`;
      categorySelectForDiscount.innerHTML += `<option value="${cat}">${cat}</option>`;
    });
  }

  window.deleteProduct = deleteProduct;
  window.previewProduct = previewProduct;
  
function showToast(message, duration = 3000) {
  
  const oldToast = document.querySelector(".toast");
  if (oldToast) oldToast.remove();

  
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 10);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

document.getElementById("btnExport").addEventListener("click", async () => {
  try {
    const res = await fetch(API_BASE + "fetch_products.php");
    const data = await res.json();

    if (!data.length) {
      showToast(" No products to export.");
      return;
    }

    
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(",")];
    data.forEach((item) => {
      const row = headers.map((key) => `"${(item[key] ?? "").toString().replace(/"/g, '""')}"`);
      csvRows.push(row.join(","));
    });
    const csvString = csvRows.join("\n");

   
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ignite_gear_products.csv";

    a.click();
    window.URL.revokeObjectURL(url);

    showToast(" Products exported successfully!");
  } catch (err) {
    console.error(err);
    showToast(" Failed to export products.");
  }
});

document.getElementById("importFile").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);

  showToast(" Uploading file...");

  try {
    const res = await fetch(API_BASE + "import_products.php", {
      method: "POST",
      body: formData,
    });
    const text = await res.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      showToast("Invalid server response");
      return;
    }

    if (result.success) {
      showToast("Products imported successfully!");
      fetchProducts();
    } else {
      showToast(" " + (result.error || "Failed to import products"));
    }
  } catch (err) {
    console.error(err);
    showToast(" Upload failed.");
  }

  e.target.value = "";
});

document.addEventListener("DOMContentLoaded", () => {
  const btnSample = document.getElementById("btnSample");
  const btnOrders = document.getElementById("btnOrders");
  const ordersSection = document.getElementById("ordersSection");
  const ordersBody = document.getElementById("ordersBody");

  btnSample.addEventListener("click", async () => {
    alert(" Sample products loaded!");
    btnOrders.classList.remove("hidden");
  });

  
  btnOrders.addEventListener("click", async () => {
    try {
      const res = await fetch("http://localhost/ignite_gear/admin/get_orders.php");
      const data = await res.json();

      if (!data.success) {
        alert(" Failed to fetch orders: " + (data.message || "Unknown error"));
        return;
      }

     
      ordersBody.innerHTML = "";

     
      data.orders.forEach(order => {
        const productsHTML = order.products
          .map(
            p => `<div><b>${p.name}</b> — $${p.price} × ${p.quantity}</div>`
          )
          .join("");

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${order.id}</td>
          <td>${order.name}</td>
          <td>${order.email}</td>
          <td>${order.phone}</td>
          <td>${order.address.replace(/\n/g, "<br>")}, ${order.city}</td>
          <td>$${order.subtotal}</td>
          <td>$${order.tax}</td>
          <td>$${order.delivery}</td>
          <td><b>$${order.total}</b></td>
          <td>${productsHTML}</td>
          <td>${order.created_at}</td>
        `;
        ordersBody.appendChild(row);
      });

    
      ordersSection.classList.remove("hidden");
      alert(" Orders loaded successfully!");
    } catch (err) {
      console.error(" Error fetching orders:", err);
      alert(" Error loading orders.");
    }
  });
});


})();
