/* dashboard.js — main app logic */

(function () {
  const user = Storage.getCurrentUser();
  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  document.getElementById('userName').textContent = user.name;

  let data = Storage.getUserData(user.id);
  let editingTxId = null;
  let chart = null;

  const money = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  document.getElementById('monthLabel').textContent =
    now.toLocaleString('en-IN', { month: 'long', year: 'numeric' });

  function isInCurrentMonth(dateStr) {
    return dateStr && dateStr.startsWith(currentMonthKey);
  }

  // ---------- Navigation ----------
  document.querySelectorAll('.nav-item[data-section]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-item[data-section]').forEach((b) => b.classList.remove('active'));
      document.querySelectorAll('.section').forEach((s) => s.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('section-' + btn.dataset.section).classList.add('active');
    });
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    Storage.clearSession();
    window.location.href = 'index.html';
  });

  // ---------- Category dropdowns ----------
  function refreshCategoryDropdowns() {
    const selects = [
      document.getElementById('txCategory'),
      document.getElementById('budgetCategory'),
      document.getElementById('filterCategory')
    ];
    selects.forEach((sel) => {
      const isFilter = sel.id === 'filterCategory';
      const current = sel.value;
      sel.innerHTML = isFilter ? '<option value="">All</option>' : '';
      data.categories.forEach((cat) => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        sel.appendChild(opt);
      });
      if ([...sel.options].some((o) => o.value === current)) sel.value = current;
    });
  }

  // ---------- Transaction modal ----------
  const modal = document.getElementById('txModalBackdrop');
  const txForm = document.getElementById('txForm');
  let currentType = 'expense';

  function openModal(tx) {
    editingTxId = tx ? tx.id : null;
    document.getElementById('txModalTitle').textContent = tx ? 'Edit transaction' : 'Add transaction';
    document.getElementById('txId').value = tx ? tx.id : '';
    document.getElementById('txAmount').value = tx ? tx.amount : '';
    document.getElementById('txNote').value = tx ? (tx.note || '') : '';
    document.getElementById('txDate').value = tx ? tx.date : now.toISOString().slice(0, 10);
    refreshCategoryDropdowns();
    document.getElementById('txCategory').value = tx ? tx.category : data.categories[0];
    setType(tx ? tx.type : 'expense');
    modal.classList.add('visible');
  }

  function closeModal() {
    modal.classList.remove('visible');
    txForm.reset();
    editingTxId = null;
  }

  function setType(type) {
    currentType = type;
    document.querySelectorAll('.type-toggle button').forEach((b) => {
      b.classList.toggle('active', b.dataset.type === type);
    });
  }

  document.querySelectorAll('.type-toggle button').forEach((b) => {
    b.addEventListener('click', () => setType(b.dataset.type));
  });

  document.getElementById('addTxBtnTop').addEventListener('click', () => openModal(null));
  document.getElementById('addTxBtnFull').addEventListener('click', () => openModal(null));
  document.getElementById('txCancelBtn').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  txForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const payload = {
      type: currentType,
      amount: parseFloat(document.getElementById('txAmount').value),
      category: document.getElementById('txCategory').value,
      note: document.getElementById('txNote').value.trim(),
      date: document.getElementById('txDate').value
    };

    if (editingTxId) {
      Storage.updateTransaction(user.id, editingTxId, payload);
    } else {
      Storage.addTransaction(user.id, payload);
    }
    data = Storage.getUserData(user.id);
    closeModal();
    renderAll();
  });

  function deleteTx(id) {
    if (!confirm('Delete this transaction?')) return;
    Storage.deleteTransaction(user.id, id);
    data = Storage.getUserData(user.id);
    renderAll();
  }

  // ---------- Overview ----------
  function renderOverview() {
    const monthTx = data.transactions.filter((t) => isInCurrentMonth(t.date));
    const income = monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    document.getElementById('balanceAmount').textContent = money(income - expense);
    document.getElementById('monthIncome').textContent = money(income);
    document.getElementById('monthExpense').textContent = money(expense);

    const recentList = document.getElementById('recentTxList');
    recentList.innerHTML = '';
    const recent = data.transactions.slice(0, 5);
    if (recent.length === 0) {
      recentList.innerHTML = '<div class="empty-state">No transactions yet. Add your first one.</div>';
    } else {
      recent.forEach((t) => {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid var(--line); font-size:0.88rem;';
        row.innerHTML = `
          <div>
            <div>${t.note || t.category}</div>
            <div style="color:var(--text-muted); font-size:0.78rem;">${t.category} · ${t.date}</div>
          </div>
          <div class="${t.type === 'income' ? 'amt-income' : 'amt-expense'}">
            ${t.type === 'income' ? '+' : '−'}${money(t.amount)}
          </div>`;
        recentList.appendChild(row);
      });
    }

    renderChart(monthTx);
  }

  function renderChart(monthTx) {
    const byCategory = {};
    monthTx.filter((t) => t.type === 'expense').forEach((t) => {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    });

    const labels = Object.keys(byCategory);
    const values = Object.values(byCategory);
    const palette = ['#3FB68C', '#E4572E', '#4C8DFF', '#F2B84B', '#B084F0', '#5FD0D9', '#EF7FA6', '#8B96A8'];

    const ctx = document.getElementById('overviewChart');
    if (chart) chart.destroy();

    if (labels.length === 0) {
      const wrap = ctx.parentElement;
      ctx.style.display = 'none';
      if (!wrap.querySelector('.chart-empty')) {
        const empty = document.createElement('div');
        empty.className = 'empty-state chart-empty';
        empty.textContent = 'No expenses recorded this month yet.';
        wrap.appendChild(empty);
      }
      return;
    } else {
      ctx.style.display = 'block';
      const emptyMsg = ctx.parentElement.querySelector('.chart-empty');
      if (emptyMsg) emptyMsg.remove();
    }

    chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{ data: values, backgroundColor: palette, borderWidth: 0 }]
      },
      options: {
        plugins: {
          legend: { position: 'bottom', labels: { color: '#8B96A8', boxWidth: 10, padding: 12, font: { size: 11 } } }
        },
        cutout: '65%'
      }
    });
  }

  // ---------- Full transactions list ----------
  function renderFullList() {
    const catFilter = document.getElementById('filterCategory').value;
    const typeFilter = document.getElementById('filterType').value;

    const filtered = data.transactions.filter((t) => {
      return (!catFilter || t.category === catFilter) && (!typeFilter || t.type === typeFilter);
    });

    const tbody = document.getElementById('fullTxList');
    tbody.innerHTML = '';
    document.getElementById('fullTxEmpty').style.display = filtered.length ? 'none' : 'block';

    filtered.forEach((t) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${t.date}</td>
        <td>${t.note || '—'}</td>
        <td><span class="cat-pill">${t.category}</span></td>
        <td class="${t.type === 'income' ? 'amt-income' : 'amt-expense'}">${t.type === 'income' ? '+' : '−'}${money(t.amount)}</td>
        <td class="row-actions">
          <button data-edit="${t.id}">Edit</button>
          <button data-del="${t.id}">Delete</button>
        </td>`;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('[data-edit]').forEach((b) => {
      b.addEventListener('click', () => {
        const tx = data.transactions.find((t) => t.id === b.dataset.edit);
        openModal(tx);
      });
    });
    tbody.querySelectorAll('[data-del]').forEach((b) => {
      b.addEventListener('click', () => deleteTx(b.dataset.del));
    });
  }

  document.getElementById('filterCategory').addEventListener('change', renderFullList);
  document.getElementById('filterType').addEventListener('change', renderFullList);

  // ---------- Budgets ----------
  document.getElementById('saveBudgetBtn').addEventListener('click', () => {
    const cat = document.getElementById('budgetCategory').value;
    const amount = parseFloat(document.getElementById('budgetAmount').value);
    if (!cat || !amount || amount <= 0) return;
    Storage.setBudget(user.id, cat, amount);
    data = Storage.getUserData(user.id);
    document.getElementById('budgetAmount').value = '';
    renderBudgets();
  });

  function renderBudgets() {
    const list = document.getElementById('budgetList');
    const entries = Object.entries(data.budgets);
    list.innerHTML = '';
    document.getElementById('budgetEmpty').style.display = entries.length ? 'none' : 'block';

    const monthTx = data.transactions.filter((t) => isInCurrentMonth(t.date) && t.type === 'expense');

    entries.forEach(([cat, limit]) => {
      const spent = monthTx.filter((t) => t.category === cat).reduce((s, t) => s + t.amount, 0);
      const pct = Math.min(100, (spent / limit) * 100);
      const over = spent > limit;

      const row = document.createElement('div');
      row.className = 'budget-row';
      row.innerHTML = `
        <div class="top">
          <span>${cat}</span>
          <span class="figures">${money(spent)} / ${money(limit)}</span>
        </div>
        <div class="budget-bar"><div class="fill ${over ? 'over' : ''}" style="width:${pct}%"></div></div>`;
      list.appendChild(row);
    });
  }

  // ---------- Categories ----------
  document.getElementById('addCategoryBtn').addEventListener('click', () => {
    const input = document.getElementById('newCategoryName');
    const name = input.value.trim();
    if (!name) return;
    Storage.addCategory(user.id, name);
    data = Storage.getUserData(user.id);
    input.value = '';
    renderCategories();
    refreshCategoryDropdowns();
  });

  function renderCategories() {
    const list = document.getElementById('categoryList');
    list.innerHTML = '';
    data.categories.forEach((cat) => {
      const pill = document.createElement('span');
      pill.className = 'cat-pill';
      pill.textContent = cat;
      list.appendChild(pill);
    });
  }

  // ---------- Render everything ----------
  function renderAll() {
    refreshCategoryDropdowns();
    renderOverview();
    renderFullList();
    renderBudgets();
    renderCategories();
  }

  renderAll();
})();
