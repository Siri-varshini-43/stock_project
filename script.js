let stock = JSON.parse(localStorage.getItem('stockList')) || [];

function renderStock() {
  const tbody = document.getElementById('stockBody');
  tbody.innerHTML = '';

  stock.forEach((item, i) => {
    const row = document.createElement('tr');

    if (item.quantity <= 0) {
      row.classList.add('out-of-stock-row');
    } else if (item.quantity < 5) {
      row.classList.add('low-stock-row');
    }

    const quantityDisplay = item.quantity <= 0 ? 'Out of Stock' : item.quantity;

    // Disable conditions for buttons
    const disableMinus1 = item.quantity <= 0;
    const disableMinus5 = item.quantity < 5;

    row.innerHTML = `
      <td>${item.name}</td>
      <td>${quantityDisplay}</td>
      <td>$${item.price.toFixed(2)}</td>
      <td>
        <button onclick="updateQuantity(${i}, 1)">+1</button>
        <button onclick="updateQuantity(${i}, 5)">+5</button>
        <button onclick="updateQuantity(${i}, -1)" ${disableMinus1 ? 'disabled' : ''}>-1</button>
        <button onclick="updateQuantity(${i}, -5)" ${disableMinus5 ? 'disabled' : ''}>-5</button>
      </td>
      <td>
        <button onclick="deleteItem(${i})" style="background:red; color:white;">Delete</button>
      </td>
    `;

    tbody.appendChild(row);
  });

  localStorage.setItem('stockList', JSON.stringify(stock));
  updateTotals();
}


function updateQuantity(index, change) {
  stock[index].quantity += change;
  if (stock[index].quantity < 0) stock[index].quantity = 0;
  renderStock();
}

function addItem() {
  const name = document.getElementById('itemName').value.trim();
  const qty = parseInt(document.getElementById('itemQty').value);
  const price = parseFloat(document.getElementById('itemPrice').value);

  if (!name || isNaN(qty) || isNaN(price)) return alert("Enter valid values");

  stock.push({ name, quantity: qty, price });
  closeModal();
  renderStock();
}

function deleteItem(index) {
  stock.splice(index, 1);
  renderStock();
}

function closeModal() {
  document.getElementById('itemModal').style.display = 'none';
  document.getElementById('itemName').value = '';
  document.getElementById('itemQty').value = '';
  document.getElementById('itemPrice').value = '';
}

document.getElementById('addItemBtn').addEventListener('click', () => {
  document.getElementById('itemModal').style.display = 'flex';
});

document.getElementById('search').addEventListener('input', (e) => {
  const search = e.target.value.toLowerCase();
  document.querySelectorAll('#stockBody tr').forEach(row => {
    row.style.display = row.innerText.toLowerCase().includes(search) ? '' : 'none';
  });
});

window.onload = renderStock;

document.getElementById('downloadPdfBtn').addEventListener('click', () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Prepare headers (only first 3 columns)
  const headers = ['Item Name', 'Quantity', 'Price ($)'];

  // Prepare rows from the stock array
  const data = stock.map(item => [
    item.quantity > 0 ? item.name : `${item.name} (Out of Stock)`,
    item.quantity > 0 ? item.quantity.toString() : 'Out of Stock',
    `$${item.price.toFixed(2)}`
  ]);

  // Add a title
  doc.text("Current Stock List", 14, 15);

  // Add autoTable with data
  doc.autoTable({
    head: [headers],
    body: data,
    startY: 20,
    styles: { fontSize: 10 },
    theme: 'grid'
  });

  // Save the PDF
  doc.save('stock_list.pdf');
});

function updateTotals() {
  let totalProducts = 0;
  let totalCost = 0;
  let outOfStockCount = 0;
  let lessThanFiveCount = 0;

  stock.forEach(item => {
    totalProducts += item.quantity;
    totalCost += item.quantity * item.price;

    if (item.quantity === 0) outOfStockCount++;
    else if (item.quantity < 5) lessThanFiveCount++;
  });

  document.getElementById('totalProducts').textContent = totalProducts;
  document.getElementById('totalCost').textContent = totalCost.toFixed(2);
  document.getElementById('outOfStockCount').textContent = outOfStockCount;
  document.getElementById('lessThanFiveCount').textContent = lessThanFiveCount;
}
