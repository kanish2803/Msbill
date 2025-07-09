function addProduct() {
  const type = document.getElementById('productType').value;
  const name = document.getElementById('productName').value;
  const id = document.getElementById('productId').value;
  const qty = parseInt(document.getElementById('qty').value);
  const price = parseFloat(document.getElementById('price').value);

  if (!type || !name || (type === 'Mobile' && !id) || isNaN(qty) || isNaN(price)) return;

  const total = qty * price;
  const table = document.getElementById('productTable').querySelector('tbody');
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${type}</td>
    <td>${name}</td>
    <td>${type === 'Mobile' ? id : '-'}</td>
    <td>${qty}</td>
    <td>Rs ${price.toFixed(2)}</td>
    <td>Rs ${total.toFixed(2)}</td>
  `;
  table.appendChild(row);
  updateTotal();

  document.getElementById('productName').value = '';
  document.getElementById('productId').value = '';
  document.getElementById('qty').value = '';
  document.getElementById('price').value = '';
}

function updateTotal() {
  const rows = document.querySelectorAll('#productTable tbody tr');
  let total = 0;
  rows.forEach(row => {
    const val = parseFloat(row.cells[5].innerText.replace('Rs ', ''));
    total += val;
  });
  document.getElementById('totalCell').innerText = `Rs ${total.toFixed(2)}`;
}

function generateBill() {
  stopScanner();
  window.print();
}

function downloadPDF() {
  stopScanner();

  const info = document.querySelector('.info');
  const original = info.innerHTML;

  const custName = document.getElementById('custName').value;
  const phone = document.getElementById('phone').value;
  const date = document.getElementById('date').value;

  info.innerHTML = `
    <div><strong>Customer Name:</strong> ${custName}</div>
    <div><strong>Phone Number:</strong> ${phone}</div>
    <div><strong>Date:</strong> ${date}</div>
  `;

  const element = document.getElementById("bill");
  const opt = {
    margin: 0,
    filename: `Bill_${custName || 'Customer'}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a5', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save().then(() => {
    info.innerHTML = original;
  });
}

document.getElementById('productType').addEventListener('change', function () {
  document.getElementById('productId').style.display = (this.value === 'Mobile') ? 'inline-block' : 'none';
});

function startScanner() {
  const container = document.getElementById("scannerContainer");
  const scannerDiv = document.getElementById("scanner");
  container.style.display = "block";
  scannerDiv.innerHTML = "";

  Quagga.init({
    inputStream: {
      name: "Live",
      type: "LiveStream",
      target: scannerDiv,
      constraints: { facingMode: "environment" }
    },
    decoder: {
      readers: ["code_128_reader", "ean_reader", "ean_8_reader"]
    },
    locate: true
  }, function(err) {
    if (err) {
      console.error(err);
      return;
    }
    Quagga.start();
  });

  Quagga.onDetected(function(result) {
    if (result.codeResult && result.codeResult.code) {
      document.getElementById("productId").value = result.codeResult.code;
      stopScanner();
    }
  });
}

function stopScanner() {
  try { Quagga.stop(); } catch (e) {}
  document.getElementById("scannerContainer").style.display = "none";
  document.getElementById("scanner").innerHTML = "";
}
