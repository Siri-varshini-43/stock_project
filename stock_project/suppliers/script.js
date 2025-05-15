const supplierModal = document.getElementById("addSupplierModal");
const supplierCards = document.getElementById("supplierCards");
const form = document.getElementById("addSupplierForm");

let suppliers = JSON.parse(localStorage.getItem("suppliers")) || [];

// Show modal
function toggleAddForm() {
  supplierModal.style.display = supplierModal.style.display === "flex" ? "none" : "flex";
}

// Render all supplier cards
function renderSuppliers() {
  supplierCards.innerHTML = "";
  suppliers.forEach((supplier, index) => {
    const card = document.createElement("div");
    card.className = "supplier-card";
    card.innerHTML = `
      <span class="delete-circle" onclick="confirmDelete(${index})">−</span>
      <h3>${supplier.name}</h3>
      <p><strong>Item:</strong> ${supplier.item}</p>
      <p><strong>Email:</strong> ${supplier.email}</p>
      <p><strong>Phone:</strong> ${supplier.phone}</p>
      <p><strong>Price per Unit:</strong> $${supplier.price}</p>
      <button class="order" onclick="placeOrder('${supplier.name}', ${supplier.price})">Place Order</button>
    `;
    supplierCards.appendChild(card);
  });
}

let currentOrder = {};

function toggleOrderModal() {
  const modal = document.getElementById("placeOrderModal");
  modal.style.display = modal.style.display === "flex" ? "none" : "flex";
  if (modal.style.display === "none") {
    document.getElementById("placeOrderForm").reset();
    document.getElementById("orderTotalCost").textContent = "0";
  }
}

function placeOrder(name, price) {
  currentOrder = { name, price };
  document.getElementById("orderSupplierName").textContent = name;
  document.getElementById("orderUnitPrice").textContent = price;
  toggleOrderModal();
}

// Live update total cost
document.getElementById("orderQuantity").addEventListener("input", () => {
  const qty = Number(document.getElementById("orderQuantity").value);
  const total = qty * currentOrder.price;
  document.getElementById("orderTotalCost").textContent = isNaN(total) ? 0 : total;
});

// Handle order form submission
// Handle order form submission
document.getElementById("placeOrderForm").onsubmit = function (e) {
  e.preventDefault();
  const confirmText = document.getElementById("orderConfirm").value.trim().toLowerCase();
  const quantity = Number(document.getElementById("orderQuantity").value);
  const total = quantity * currentOrder.price;

  if (confirmText === "confirm" && quantity > 0) {
    alert(`Order placed with ${currentOrder.name} for ${quantity} units. Total cost: $${total}`);

    // Create the order object
    const order = {
      supplierName: currentOrder.name,
      item: suppliers.find(s => s.name === currentOrder.name).item,
      quantity: quantity,
      totalCost: total,
      status: "Confirmed",
      date: new Date().toLocaleString()
    };

    // Retrieve existing orders or initialize an empty array
    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    
    // Add the new order to the array
    orders.push(order);
    
    // Save updated orders to localStorage
    localStorage.setItem("orders", JSON.stringify(orders));

    toggleOrderModal();
  } else {
    alert("Please enter valid quantity and type 'confirm' to proceed.");
  }
};



// Confirm Delete
function confirmDelete(index) {
  const input = prompt("Type 'delete' to remove this supplier:");
  if (input && input.trim().toLowerCase() === "delete") {
    suppliers.splice(index, 1);
    localStorage.setItem("suppliers", JSON.stringify(suppliers));
    renderSuppliers();
  } else {
    alert("Deletion cancelled or incorrect input.");
  }
}

// Add Supplier
form.onsubmit = (e) => {
  e.preventDefault();
  const supplier = {
    name: document.getElementById("supplierName").value,
    item: document.getElementById("itemSupplied").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    price: document.getElementById("price").value,
  };

  suppliers.push(supplier);
  localStorage.setItem("suppliers", JSON.stringify(suppliers));
  toggleAddForm();
  renderSuppliers();
  form.reset();
};

// Search functionality
document.getElementById("searchInput").addEventListener("input", function () {
  const searchTerm = this.value.toLowerCase();
  const allCards = document.querySelectorAll(".supplier-card");

  allCards.forEach(card => {
    const name = card.querySelector("h3").textContent.toLowerCase();
    const item = card.querySelector("p").textContent.toLowerCase();
    card.style.display = (name.includes(searchTerm) || item.includes(searchTerm)) ? "block" : "none";
  });
});

// On load
window.onload = () => {
  renderSuppliers();
};
