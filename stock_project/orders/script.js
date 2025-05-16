window.onload = function () {
  const ordersList = document.getElementById("ordersList");
  const searchInput = document.getElementById("searchInput");
  const downloadBtn = document.getElementById("downloadPdfBtn");

  let orders = JSON.parse(localStorage.getItem("orders")) || [];

  function renderOrders(filteredOrders) {
    ordersList.innerHTML = "";

    if (filteredOrders.length === 0) {
      ordersList.innerHTML = "<tr><td colspan='7'>No orders found.</td></tr>";
      return;
    }

    filteredOrders.forEach((order, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${order.supplierName}</td>
        <td>${order.item}</td>
        <td>${order.quantity}</td>
        <td>$${order.totalCost}</td>
        <td id="status-${index}">${order.status}</td>
        <td>${order.date}</td>
        <td>
          <button class="removeBtn" onclick="removeOrder(${index})">Remove</button>
          <button class="deliverBtn" onclick="toggleStatus(${index})">Deliver</button>
        </td>
      `;
      ordersList.appendChild(row);
    });
  }

  // Initial render
  renderOrders(orders);

  // Search functionality
  searchInput.addEventListener("input", function () {
    const query = this.value.toLowerCase();
    const filteredOrders = orders.filter(order =>
      order.supplierName.toLowerCase().includes(query) ||
      order.item.toLowerCase().includes(query) ||
      order.status.toLowerCase().includes(query) ||
      order.date.toLowerCase().includes(query)
    );
    renderOrders(filteredOrders);
  });

  // PDF Export as Table (excluding buttons column)
  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      const table = document.getElementById("ordersTable");
      const headers = [];
      const data = [];

      // Get headers excluding the last one (buttons)
      const headerCells = table.querySelectorAll("thead tr th");
      headerCells.forEach((th, i) => {
        if (i < headerCells.length - 1) headers.push(th.innerText);
      });

      // Get rows
      const rows = table.querySelectorAll("tbody tr");
      rows.forEach(row => {
        const rowData = [];
        const cells = row.querySelectorAll("td");
        cells.forEach((cell, i) => {
          if (i < cells.length - 1) rowData.push(cell.innerText);
        });
        data.push(rowData);
      });

      doc.text("Orders List", 14, 15);
      doc.autoTable({
        head: [headers],
        body: data,
        startY: 20,
        styles: { fontSize: 10 },
        theme: "grid"
      });

      doc.save("orders.pdf");
    });
  }
};

function removeOrder(index) {
  const input = prompt("Type 'remove' to delete this order:");

  if (input && input.trim().toLowerCase() === "remove") {
    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    orders.splice(index, 1);
    localStorage.setItem("orders", JSON.stringify(orders));
    location.reload();
  } else {
    alert("Deletion cancelled or incorrect input.");
  }
}

function toggleStatus(index) {
  let orders = JSON.parse(localStorage.getItem("orders")) || [];
  const order = orders[index];

  if (order.status === "Delivered") {
    alert("This order is already delivered.");
    return;
  }

  const input = prompt("Type 'deliver' to confirm delivery:");

  if (input && input.trim().toLowerCase() === "deliver") {
    order.status = "Delivered";
    localStorage.setItem("orders", JSON.stringify(orders));
    document.getElementById(`status-${index}`).textContent = "Delivered";
  } else {
    alert("Delivery confirmation failed. Status remains 'Confirmed'.");
  }
}
