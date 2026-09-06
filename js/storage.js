/* storage.js
   Thin data-access layer over localStorage.
   Everything the app reads or writes goes through here so the
   storage format only has to be understood in one place.
*/

const DB_KEYS = {
  USERS: 'et_users',
  SESSION: 'et_session',
  DATA_PREFIX: 'et_data_' // + userId
};

const DEFAULT_CATEGORIES = [
  'Food', 'Transport', 'Housing', 'Bills', 'Health',
  'Entertainment', 'Shopping', 'Education', 'Other'
];

const Storage = {
  // ---------- Users ----------
  getUsers() {
    return JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
  },

  saveUsers(users) {
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
  },

  findUserByEmail(email) {
    return this.getUsers().find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
  },

  createUser({ name, email, password }) {
    const users = this.getUsers();
    const id = 'u_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    const user = { id, name, email, password: this._hash(password) };
    users.push(user);
    this.saveUsers(users);
    this._initUserData(id);
    return user;
  },

  verifyLogin(email, password) {
    const user = this.findUserByEmail(email);
    if (!user) return null;
    return user.password === this._hash(password) ? user : null;
  },

  // Not real cryptographic hashing -- this is a static client-side demo app,
  // so there is no server to keep a secret from. Good enough to avoid storing
  // plaintext passwords in localStorage in the clear.
  _hash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return 'h_' + hash.toString(36);
  },

  // ---------- Session ----------
  setSession(userId) {
    localStorage.setItem(DB_KEYS.SESSION, userId);
  },

  getSession() {
    return localStorage.getItem(DB_KEYS.SESSION);
  },

  clearSession() {
    localStorage.removeItem(DB_KEYS.SESSION);
  },

  getCurrentUser() {
    const id = this.getSession();
    if (!id) return null;
    return this.getUsers().find((u) => u.id === id) || null;
  },

  // ---------- Per-user financial data ----------
  _initUserData(userId) {
    const key = DB_KEYS.DATA_PREFIX + userId;
    if (localStorage.getItem(key)) return;
    const initial = {
      transactions: [], // {id, type: 'income'|'expense', amount, category, note, date}
      categories: [...DEFAULT_CATEGORIES],
      budgets: {} // { categoryName: monthlyLimit }
    };
    localStorage.setItem(key, JSON.stringify(initial));
  },

  getUserData(userId) {
    this._initUserData(userId);
    return JSON.parse(localStorage.getItem(DB_KEYS.DATA_PREFIX + userId));
  },

  saveUserData(userId, data) {
    localStorage.setItem(DB_KEYS.DATA_PREFIX + userId, JSON.stringify(data));
  },

  addTransaction(userId, tx) {
    const data = this.getUserData(userId);
    tx.id = 't_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    data.transactions.unshift(tx);
    this.saveUserData(userId, data);
    return tx;
  },

  updateTransaction(userId, txId, updates) {
    const data = this.getUserData(userId);
    const idx = data.transactions.findIndex((t) => t.id === txId);
    if (idx === -1) return null;
    data.transactions[idx] = { ...data.transactions[idx], ...updates };
    this.saveUserData(userId, data);
    return data.transactions[idx];
  },

  deleteTransaction(userId, txId) {
    const data = this.getUserData(userId);
    data.transactions = data.transactions.filter((t) => t.id !== txId);
    this.saveUserData(userId, data);
  },

  addCategory(userId, name) {
    const data = this.getUserData(userId);
    if (!data.categories.includes(name)) {
      data.categories.push(name);
      this.saveUserData(userId, data);
    }
    return data.categories;
  },

  setBudget(userId, category, limit) {
    const data = this.getUserData(userId);
    data.budgets[category] = limit;
    this.saveUserData(userId, data);
    return data.budgets;
  }
};
