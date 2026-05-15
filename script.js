let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let spendingLimit = Number(localStorage.getItem("spendingLimit")) || 0;

const form          = document.getElementById("expenseForm");
const list          = document.getElementById("transactionList");
const totalBalanceEl = document.getElementById("totalBalance");
const themeToggle   = document.getElementById("themeToggle");
const sortSelect    = document.getElementById("sortSelect");
const limitInput    = document.getElementById("spendingLimit");
const setLimitBtn   = document.getElementById("setLimitBtn");
const limitWarning  = document.getElementById("limitWarning");
const balanceBox    = document.querySelector(".balance-box");
let chart;

// ── Theme ──────────────────────────────────────────────
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

function updateToggleLabel() {
  themeToggle.textContent = document.body.classList.contains("dark")
    ? "☀️ Light Mode"
    : "🌙 Dark Mode";
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
  updateToggleLabel();
});

updateToggleLabel();

// ── Spending Limit ─────────────────────────────────────
if (spendingLimit > 0) limitInput.value = spendingLimit;

setLimitBtn.addEventListener("click", () => {
  const val = Number(limitInput.value);
  if (val <= 0) { alert("Masukkan batas yang valid"); return; }
  spendingLimit = val;
  localStorage.setItem("spendingLimit", spendingLimit);
  updateUI();
});

// ── Add Transaction ────────────────────────────────────
form.addEventListener("submit", function (e) {
  e.preventDefault();
  const name     = document.getElementById("itemName").value.trim();
  const amount   = document.getElementById("amount").value;
  const category = document.getElementById("category").value;

  if (!name || !amount || !category) {
    alert("Please fill all fields");
    return;
  }

  transactions.push({ id: Date.now(), name, amount: Number(amount), category });
  saveData();
  updateUI();
  form.reset();
});

// ── Sort ───────────────────────────────────────────────
sortSelect.addEventListener("change", updateUI);

function getSorted() {
  const mode = sortSelect.value;
  const copy = [...transactions];
  if (mode === "amount-asc")  return copy.sort((a, b) => a.amount - b.amount);
  if (mode === "amount-desc") return copy.sort((a, b) => b.amount - a.amount);
  if (mode === "category")    return copy.sort((a, b) => a.category.localeCompare(b.category));
  return copy.reverse(); // default: terbaru
}

// ── Save ───────────────────────────────────────────────
function saveData() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

// ── Delete ─────────────────────────────────────────────
function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  saveData();
  updateUI();
}

// ── Update UI ──────────────────────────────────────────
function updateUI() {
  list.innerHTML = "";
  let total = 0;
  transactions.forEach(t => { total += t.amount; });

  // Balance display
  totalBalanceEl.textContent = total.toLocaleString("id-ID");

  // Highlight if over limit
  const isOver = spendingLimit > 0 && total > spendingLimit;
  balanceBox.classList.toggle("over", isOver);
  limitWarning.classList.toggle("hidden", !isOver);

  // Render sorted list
  getSorted().forEach(t => {
    const itemOver = spendingLimit > 0 && t.amount > spendingLimit;
    const li = document.createElement("li");
    if (itemOver) li.classList.add("over-limit");
    li.innerHTML = `
      <div class="item-info">
        <span class="item-name">${t.name}</span>
        <span class="item-meta">${t.category} • Rp ${t.amount.toLocaleString("id-ID")}</span>
      </div>
      <button class="delete-btn" onclick="deleteTransaction(${t.id})">Hapus</button>
    `;
    list.appendChild(li);
  });

  updateChart();
}

// ── Chart ──────────────────────────────────────────────
function updateChart() {
  const categories = { Food: 0, Transport: 0, Fun: 0 };
  transactions.forEach(t => {
    if (categories[t.category] !== undefined) {
      categories[t.category] += t.amount;
    }
  });

  const data = {
    labels: Object.keys(categories),
    datasets: [{
      data: Object.values(categories),
      backgroundColor: ["#ff6384", "#36a2eb", "#ffcd56"],
      borderWidth: 2
    }]
  };

  if (chart) chart.destroy();
  chart = new Chart(document.getElementById("expenseChart"), {
    type: "pie",
    data,
    options: {
      plugins: {
        legend: { position: "bottom" }
      }
    }
  });
}

// ── Init ───────────────────────────────────────────────
updateUI();
