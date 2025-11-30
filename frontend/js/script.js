// backend URL 
const API_BASE = "http://127.0.0.1:5000/api";

// LOGIN PAGE 

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("in_loginForm");
  const regForm = document.getElementById("reg_registerForm");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const emailInput =
        document.getElementById("in_email") ||
        document.getElementById("in_username");
      const passwordInput = document.getElementById("in_password");

      const email = emailInput ? emailInput.value.trim() : "";
      const password = passwordInput ? passwordInput.value.trim() : "";

      if (!email || !password) {
        openInfoModal("Please enter email and password.", "Login Error");
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (!res.ok || !data.ok) {
          openInfoModal(data.error || "Login failed", "Login Error");
          return;
        }

        localStorage.setItem("loggedInUser", JSON.stringify(data.user));

        window.location.href = "dashboard.html";
      } catch (err) {
        console.error("Login error:", err);
        openInfoModal("Server error during login.", "Login Error");
      }
    });
  }

  //  REGISTER 
  if (regForm) {
    regForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nameEl = document.getElementById("reg_name");
      const emailEl = document.getElementById("reg_email");
      const phoneEl = document.getElementById("reg_phone");
      const passwordEl = document.getElementById("reg_password");

      const name = nameEl ? nameEl.value.trim() : "";
      const email = emailEl ? emailEl.value.trim() : "";
      const phone = phoneEl ? phoneEl.value.trim() : "";
      const password = passwordEl ? passwordEl.value.trim() : "";

      if (!name || !email || !password) {
        alert("Please fill in name, email, and password.");
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, phone, password }),
        });

        const data = await res.json();
        console.log("Register response:", data);

        if (!res.ok || !data.ok) {
          alert(data.error || "Registration failed");
          return;
        }

        openInfoModal("Registration successful! You can now log in.", "Registration Complete");
        window.location.href = "index.html";
      } catch (err) {
        console.error("Register error:", err);
        alert("Server error during registration.");
      }
    });
  }
});

// DASHBOARD PAGE 

document.addEventListener("DOMContentLoaded", () => {
  const daApp = document.querySelector(".da_app");
  if (!daApp) return;

  const userData = localStorage.getItem("loggedInUser");
  if (!userData) {
    alert("Please log in first!");
    window.location.href = "index.html";
    return;
  }

  const currentUser = JSON.parse(userData);
  console.log("Dashboard for user:", currentUser);

  // Account fields
  const daAccountNameEl = document.getElementById("da_accountName");
  const daAccountEmailEl = document.getElementById("da_accountEmail");
  const daAccountBalanceEl = document.getElementById("da_accountBalance");
  const daLogoutBtn = document.getElementById("da_logoutBtn");
  const daShowZeroFriendsCheckbox = document.getElementById("da_showZeroFriends");

  if (daAccountNameEl) daAccountNameEl.textContent = currentUser.name || "N/A";
  if (daAccountEmailEl) daAccountEmailEl.textContent = currentUser.email || "N/A";

  // Friends / Activity elements
  const daFriendsListEl = document.getElementById("da_friendsList");
  const daFriendSearchEl = document.getElementById("da_friendSearch");
  const daActivityListEl = document.getElementById("da_activityList");

  // Modals: friend transactions
  const daModal = document.getElementById("da_modal");
  const daModalTitle = document.getElementById("da_modalTitle");
  const daModalTransactions = document.getElementById("da_modalTransactions");
  const daModalClose = document.getElementById("da_modalClose");
  const daSettleUpBtn = document.getElementById("da_settleUpBtn");

  // Add Expense modal 
  const daExpenseModal = document.getElementById("da_expenseModal");
  const daExpenseModalClose = document.getElementById("da_expenseModalClose");
  const daExpenseForm = document.getElementById("da_expenseForm");
  const daExpenseCancel = document.getElementById("da_expenseCancel");
  const daAddExpenseBtn = document.getElementById("da_addExpenseBtn");
  const daExpenseFriendsContainer = document.getElementById("da_expenseFriendsContainer");
  const daSplitTypeSelect = document.getElementById("da_expenseType");
  const daSplitExtraFields = document.getElementById("da_splitExtraFields");
  const daExpenseErrorEl = document.getElementById("da_expenseError");
  const daExpenseFriendSearch = document.getElementById("da_expenseFriendSearch");
  const daSelectedChipsEl = document.getElementById("da_selectedChips");

  // Settle Up modal 
  const daSettleModal   = document.getElementById("da_settleModal");
  const daSettleClose   = document.getElementById("da_settleClose");
  const daSettleCancel  = document.getElementById("da_settleCancel");
  const daSettleSave    = document.getElementById("da_settleSave");
  const daSettleAmount  = document.getElementById("da_settleAmount");
  const daSettleInfo    = document.getElementById("da_settleInfo");
  const daSettleError   = document.getElementById("da_settleError");

  // Info
  const daInfoModal   = document.getElementById("da_infoModal");
  const daInfoTitle   = document.getElementById("da_infoTitle");
  const daInfoMessage = document.getElementById("da_infoMessage");
  const daInfoClose   = document.getElementById("da_infoClose");
  const daInfoOk      = document.getElementById("da_infoOk");  

  function openInfoModal(message, title = "Done") {
    if (!daInfoModal || !daInfoMessage || !daInfoTitle) return;
    daInfoTitle.textContent = title;
    daInfoMessage.textContent = message || "";
    daInfoModal.classList.add("da_modal--open");
  }

  function closeInfoModal() {
    if (!daInfoModal) return;
    daInfoModal.classList.remove("da_modal--open");
  }

  if (daInfoClose) daInfoClose.onclick = closeInfoModal;
  if (daInfoOk)    daInfoOk.onclick    = closeInfoModal;
  if (daInfoModal) {
    daInfoModal.addEventListener("click", (e) => {
      if (e.target === daInfoModal) closeInfoModal();
    });
  }

  // settle-up state
  let settleFriend = null;
  let settleMax = 0;     
  function openSettleModal(friend, maxAmount) {
    if (!daSettleModal || !daSettleAmount) return;

    settleFriend = friend;
    settleMax = Math.max(0, Number(maxAmount) || 0);

    if (daSettleError) daSettleError.textContent = "";
    daSettleAmount.value = settleMax.toFixed(2);
    daSettleAmount.max = settleMax.toFixed(2);

    if (daSettleInfo) {
      daSettleInfo.textContent =
        `You owe ${friend.name} up to $${settleMax.toFixed(2)}. Enter an amount to settle now.`;
    }

    daSettleModal.classList.add("da_modal--open");
    daSettleAmount.focus();
  }

  function closeSettleModal() {
    daSettleModal.classList.remove("da_modal--open");
    settleFriend = null;
    settleMax = 0;
  }
  if (daSettleClose)  daSettleClose.onclick  = closeSettleModal;
  if (daSettleCancel) daSettleCancel.onclick = closeSettleModal;
  if (daSettleModal) {
    daSettleModal.addEventListener("click", (e) => {
      if (e.target === daSettleModal) closeSettleModal();
    });
  }

  const selectedFriendIds = new Set();

  if (daSplitTypeSelect) {
    daSplitTypeSelect.addEventListener("change", rebuildSplitExtraUI);
  }

  // Bottom nav sections
  const daSections = {
    friends: document.getElementById("da_friendsSection"),
    activity: document.getElementById("da_activitySection"),
    account: document.getElementById("da_accountSection"),
  };
  const daNavButtons = document.querySelectorAll(".da_nav-btn");

  // Data storage
  let daFriends = [];
  let daExpenses = [];
  let daShowZeroFriends = false;
  let friendMap = new Map();  

  let editingExpenseId = null;    
  let editingGroupCache = null;   
  let currentModalFriend = null;     

  function todayISO() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return (
      d.getFullYear() +
      "-" +
      pad(d.getMonth() + 1) +
      "-" +
      pad(d.getDate())
    ); 
  }

  function formatDateTime(raw) {
    if (!raw) return "";
    let s = String(raw).trim();

    if (s.includes("GMT")) {
      s = s.replace(" GMT", ""); 
    }

    const d = new Date(s);
    if (Number.isNaN(d.getTime())) {
      console.warn("Could not parse date:", raw);
      return String(raw);
    }

    const datePart = d.toLocaleDateString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const timePart = d.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });

    return `${datePart} ${timePart}`;
  }

  async function loadFriends() {
    try {
      console.log("Loading friends for user_id =", currentUser.user_id);
      const res = await fetch(`${API_BASE}/friends/${currentUser.user_id}`);
      console.log("Response status for /friends:", res.status);
      daFriends = await res.json();
      console.log("Friends from backend:", daFriends);
      friendMap.clear();
      daFriends.forEach(f => {
        friendMap.set(f.user_id, f.name);
      });
      renderFriendsList();
      updateTotalBalance();
      renderExpenseFriendChips();
    } catch (err) {
      console.error("Error loading friends:", err);
    }
  }

  async function loadExpenses() {
    try {
      console.log("Loading expenses for user_id =", currentUser.user_id);
      const res = await fetch(`${API_BASE}/expenses/${currentUser.user_id}`);
      console.log("Response status for /expenses:", res.status);
      daExpenses = await res.json();
      console.log("Expenses from backend:", daExpenses);
      renderActivityList();
    } catch (err) {
      console.error("Error loading expenses:", err);
    }
  }

  // Render functions
  function updateTotalBalance() {
    if (!daAccountBalanceEl) return;

    const total = daFriends.reduce((sum, f) => {
      const raw = f.balance;
      const num = raw == null ? 0 : Number(raw);
      return sum + (Number.isNaN(num) ? 0 : num);
    }, 0);

    daAccountBalanceEl.textContent = total.toFixed(2);
    daAccountBalanceEl.style.color = total >= 0 ? "green" : "red";
  }


  function renderFriendsList(filterText = "") {
    if (!daFriendsListEl) return;
    daFriendsListEl.innerHTML = "";

    const term = filterText.toLowerCase();

    daFriends
      .filter((f) => f.name.toLowerCase().includes(term))
      .filter((f) => {
        const bal = Number(f.balance) || 0;
        if (!daShowZeroFriends) return bal !== 0;
        return true;
      })
      .forEach((friend) => {
        const li = document.createElement("li");
        li.className = "da_friend-item";
        li.dataset.friendId = friend.user_id;

        const raw = friend.balance;
        let balance = raw == null ? 0 : Number(raw);
        if (Number.isNaN(balance)) balance = 0;

        if (balance < 0) {
          li.classList.add("da_friend-item--negative");
        } else if (balance > 0) {
          li.classList.add("da_friend-item--positive");
        }

        const nameSpan = document.createElement("span");
        nameSpan.className = "da_friend-name";
        nameSpan.textContent = friend.name;

        const amtSpan = document.createElement("span");
        amtSpan.className = "da_friend-amount";

        const signed = balance > 0 ? `+${balance.toFixed(2)}` : balance.toFixed(2);
        amtSpan.textContent = signed;

        if (balance < 0) {
          amtSpan.classList.add("da_friend-amount--negative");
        } else if (balance > 0) {
          amtSpan.classList.add("da_friend-amount--positive");
        }

        li.appendChild(nameSpan);
        li.appendChild(amtSpan);

        li.addEventListener("click", () => openFriendModal(friend));

        daFriendsListEl.appendChild(li);
      });
  }

  function renderExpenseFriendChips(filterText = "") {
    if (!daExpenseFriendsContainer) return;
    const term = (filterText || "").toLowerCase();
    daExpenseFriendsContainer.innerHTML = "";

    const filtered = daFriends.filter(f => f.name.toLowerCase().includes(term));
    if (!filtered.length) {
      const p = document.createElement("p");
      p.style.fontSize = "0.85rem"; p.style.color = "#888";
      p.textContent = "No friends match your search.";
      daExpenseFriendsContainer.appendChild(p);
      return;
    }

    filtered.forEach(friend => {
      const label = document.createElement("label");
      label.className = "da_expense-friend-chip";

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.value = String(friend.user_id);
      cb.dataset.friendName = friend.name;
      cb.checked = selectedFriendIds.has(cb.value); 

      cb.addEventListener("change", () => {
        if (cb.checked) selectedFriendIds.add(cb.value);
        else selectedFriendIds.delete(cb.value);
        renderSelectedChips();
        rebuildSplitExtraUI();
      });

      const span = document.createElement("span");
      span.textContent = friend.name;

      label.appendChild(cb);
      label.appendChild(span);
      daExpenseFriendsContainer.appendChild(label);
    });
  }

  function renderSelectedChips() {
    if (!daSelectedChipsEl) return;
    daSelectedChipsEl.innerHTML = "";

    Array.from(selectedFriendIds).forEach(idStr => {
      const friend = daFriends.find(f => String(f.user_id) === idStr);
      const name = friend ? friend.name : `User ${idStr}`;

      const chip = document.createElement("span");
      chip.className = "da_token";
      chip.textContent = name;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "da_token-remove";
      btn.setAttribute("aria-label", `Remove ${name}`);
      btn.textContent = "✕";
      btn.addEventListener("click", () => {
        selectedFriendIds.delete(idStr);
        const cb = daExpenseFriendsContainer?.querySelector(
          `input[type="checkbox"][value="${CSS.escape(idStr)}"]`
        );
        if (cb) cb.checked = false;

        renderSelectedChips();
        rebuildSplitExtraUI();
      });

      chip.appendChild(btn);
      daSelectedChipsEl.appendChild(chip);
    });
  }

  //ayush done

  function getSelectedParticipants() {
    const ids = new Set(selectedFriendIds); 
    ids.add(String(currentUser.user_id));   

    const participants = Array.from(ids).map(idStr => {
      const id = Number(idStr);
      if (id === currentUser.user_id) return { user_id: id, name: currentUser.name };
      const friend = daFriends.find(f => f.user_id === id);
      return { user_id: id, name: friend ? friend.name : `User ${id}` };
    });

    return participants;
  }

  function rebuildSplitExtraUI() {
    if (!daSplitExtraFields || !daSplitTypeSelect) return;
    daSplitExtraFields.innerHTML = "";

    const splitType = daSplitTypeSelect.value;
    const participants = getSelectedParticipants();

    if (!participants.length) {
      daSplitExtraFields.textContent = "Select at least one person for this expense.";
      return;
    }

    if (splitType === "equal") {
      const note = document.createElement("div");
      note.className = "da_split-extra-note";
      note.textContent = `This expense will be split equally among ${participants.length} people.`;
      daSplitExtraFields.appendChild(note);
      return;
    }

    if (splitType === "amount") {
      const table = document.createElement("table");
      table.className = "da_split-extra-table";

      const thead = document.createElement("thead");
      thead.innerHTML = "<tr><th>Person</th><th>Amount</th></tr>";
      table.appendChild(thead);

      const tbody = document.createElement("tbody");

      participants.forEach((p) => {
        const tr = document.createElement("tr");
        const tdName = document.createElement("td");
        const tdInput = document.createElement("td");

        tdName.textContent = p.name;

        const input = document.createElement("input");
        input.type = "number";
        input.step = "0.01";
        input.min = "0";
        input.className = "da_split-amount-input";
        input.dataset.userId = p.user_id;

        tdInput.appendChild(input);
        tr.appendChild(tdName);
        tr.appendChild(tdInput);
        tbody.appendChild(tr);
      });

      table.appendChild(tbody);
      daSplitExtraFields.appendChild(table);

      const note = document.createElement("div");
      note.className = "da_split-extra-note";
      note.textContent = "Make sure the amounts add up to the total.";
      daSplitExtraFields.appendChild(note);
    }

  }

  function getDateParts(rawDate, fallbackDate = null) {
    const raw = rawDate || fallbackDate;
    if (!raw) {
      return { year: "", monthShort: "", monthLong: "", dayText: "" };
    }

    let s = String(raw).trim();

    if (s.includes("GMT")) {
      s = s.replace(" GMT", "");
    }

    const d = new Date(s);
    if (isNaN(d.getTime())) {
      return { year: "", monthShort: "", monthLong: "", dayText: "" };
    }

    return {
      year: d.getFullYear().toString(),
      monthShort: d.toLocaleString(undefined, { month: "short" }),
      monthLong: d.toLocaleString(undefined, { month: "long" }),
      dayText: d.getDate().toString()
    };
  }

  function renderActivityList() {
    if (!daActivityListEl) return;
    daActivityListEl.innerHTML = "";

    if (!daExpenses.length) {
      const li = document.createElement("li");
      li.className = "da_tx-item";
      li.textContent = "No recent expenses yet.";
      daActivityListEl.appendChild(li);
      return;
    }

    const byExpense = new Map();
    daExpenses.forEach((row) => {
      const id = row.expense_id;
      if (!byExpense.has(id)) {
        byExpense.set(id, {
          expense_id: id,
          description: row.description,
          expense_date: row.expense_date,
          created_at: row.created_at, 
          payer_name: row.payer_name,
          amount: row.amount,
          split_type: row.split_type,
          rows: [],
        });
      }
      byExpense.get(id).rows.push(row);
    });

    const groups = Array.from(byExpense.values()).sort((a, b) => {
      const ad = new Date(a.created_at || a.expense_date);
      const bd = new Date(b.created_at || b.expense_date);

      if (isNaN(ad) || isNaN(bd)) return 0;
      return bd - ad;
    });

    let currentMonthKey = "";

    groups.forEach((g) => {
      const { year, monthShort, monthLong, dayText } = getDateParts(
        g.expense_date, g.created_at
      );

      const monthKey = year && monthLong ? `${year}-${monthLong}` : "";

      if (monthKey && monthKey !== currentMonthKey) {
        currentMonthKey = monthKey;
        const headerLi = document.createElement("li");
        headerLi.className = "da_tx-month";
        headerLi.textContent = `${monthLong} ${year}`;
        daActivityListEl.appendChild(headerLi);
      }

      const rows = g.rows;
      const payerName = g.payer_name || "";
      let signedAmount = 0;

      if (payerName === currentUser.name) {
        signedAmount = rows.reduce((sum, r) => {
          if (r.user_id === currentUser.user_id) return sum;
          const v = Number(r.owed_amount);
          return sum + (Number.isNaN(v) ? 0 : v);
        }, 0);
      } else {
        const myRow = rows.find((r) => r.user_id === currentUser.user_id);
        if (myRow) {
          const v = Number(myRow.owed_amount);
          if (!Number.isNaN(v)) signedAmount = -v;
        } else {
          return;
        }
      }

      const li = document.createElement("li");
      li.className = "da_tx-item";

      const dateDiv = document.createElement("div");
      dateDiv.className = "da_tx-date";

      const monthSpan = document.createElement("div");
      monthSpan.className = "da_tx-date-month";
      monthSpan.textContent = monthShort;

      const daySpan = document.createElement("div");
      daySpan.className = "da_tx-date-day";
      daySpan.textContent = dayText;  

      dateDiv.appendChild(monthSpan);
      dateDiv.appendChild(daySpan);

      const mainDiv = document.createElement("div");
      mainDiv.className = "da_tx-main";

      const titleSpan = document.createElement("div");
      titleSpan.className = "da_tx-title";
      titleSpan.textContent = g.description || "(No description)";

      const subtitleSpan = document.createElement("div");
      subtitleSpan.className = "da_tx-subtitle";

      let counterpartyText = "";
      let participantsCount = 0;

      if (payerName === currentUser.name) {
        const others = rows.filter((r) => r.user_id !== currentUser.user_id);
        participantsCount = others.length;

        if (others.length === 1) {
          const otherId = others[0].user_id;
          counterpartyText = friendMap.get(otherId) || "";
        } else if (others.length > 1) {
          counterpartyText = `${others.length} friends`;
        }
      } else {
        counterpartyText = payerName;
      }

      if (g.split_type === "settlement") {
        if (payerName === currentUser.name) {
          const others = rows.filter(r => r.user_id !== currentUser.user_id);
          const who = others.length === 1 ? (friendMap.get(others[0].user_id) || "friend") : "friends";
          subtitleSpan.textContent = `You paid ${who}`;
        } else {
          subtitleSpan.textContent = `${payerName} paid you`;
        }
      } else if (signedAmount > 0) {
        if (counterpartyText) {
          if (participantsCount === 1 && payerName === currentUser.name) {
            subtitleSpan.textContent = `${counterpartyText} owes you`;
          } else {
            subtitleSpan.textContent = `You get back from ${counterpartyText}`;
          }
        } else {
          subtitleSpan.textContent = "You get back";
        }
      } else if (signedAmount < 0) {
        if (counterpartyText) {
          subtitleSpan.textContent = `You owe ${counterpartyText}`;
        } else {
          subtitleSpan.textContent = "You owe";
        }
      } else {
        subtitleSpan.textContent = "";
      }

      mainDiv.appendChild(titleSpan);
      mainDiv.appendChild(subtitleSpan);

      const rightDiv = document.createElement("div");
      rightDiv.className = "da_tx-right";

      const amtSpan = document.createElement("span");
      const num = signedAmount;
      const text =
        num > 0 ? `+${num.toFixed(2)}` : num < 0 ? num.toFixed(2) : "0.00";
      amtSpan.textContent = text;

      if (num < 0) {
        amtSpan.classList.add("da_tx-amount-negative"); 
      } else if (num > 0) {
        amtSpan.classList.add("da_tx-amount-positive"); 
      }

      rightDiv.appendChild(amtSpan);

      li.appendChild(dateDiv);
      li.appendChild(mainDiv);
      li.appendChild(rightDiv);

      daActivityListEl.appendChild(li);
    });
  }

  // sanskar
  if (daSettleSave) {
    daSettleSave.onclick = async () => {
      if (!settleFriend) return;
      daSettleError.textContent = "";

      let val = parseFloat(daSettleAmount.value);
      if (isNaN(val) || val <= 0) {
        daSettleError.textContent = "Enter a valid amount greater than 0.";
        return;
      }
      if (val > settleMax + 1e-9) {
        daSettleError.textContent = `Amount cannot exceed $${settleMax.toFixed(2)}.`;
        return;
      }

      const payload = {
        created_by: currentUser.user_id,
        payer_id: currentUser.user_id,
        description: `Settle up with ${settleFriend.name}`,
        amount: Math.round(val * 100) / 100,
        split_type: "settlement",
        expense_date: todayISO(),
        participants: [
          { user_id: settleFriend.user_id, share_type: "amount", owed_amount: Math.round(val * 100) / 100 }
        ],
      };

      daSettleSave.disabled = true;
      daSettleSave.textContent = "Saving...";

      try {
        const resp = await fetch(`${API_BASE}/expenses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error || "Failed to settle");

        const friendName = settleFriend.name;

        closeSettleModal();
        closeFriendModal();
        await loadFriends();
        await loadExpenses();

        openInfoModal(
          `You paid ${friendName} $${val.toFixed(2)}.`,
          "Settle up completed"
        );

      } catch (e) {
        console.error(e);
        daSettleError.textContent = "Could not save settlement.";
      } finally {
        daSettleSave.disabled = false;
        daSettleSave.textContent = "Confirm";
      }
    };
  }

  // Friend modal

  function openFriendModal(friend) {
    currentModalFriend = friend;
    if (!daModal || !daModalTitle || !daModalTransactions) return;

    daModalTitle.textContent = `Transactions with ${friend.name}`;
    daModalTransactions.innerHTML = "";

    const byExpense = new Map();
    daExpenses.forEach((row) => {
      if (!byExpense.has(row.expense_id)) {
        byExpense.set(row.expense_id, {
          expense_id: row.expense_id,
          description: row.description,
          expense_date: row.expense_date,
          created_at: row.created_at,   
          payer_name: row.payer_name,
          amount: row.amount,
          split_type: row.split_type,
          rows: [],
        });
      }

      byExpense.get(row.expense_id).rows.push(row);
    });

    const txActionModal = document.getElementById("da_txActionModal");
    const txActionClose = document.getElementById("da_txActionClose");
    const txDeleteBtn   = document.getElementById("da_txDeleteBtn");
    const txEditBtn     = document.getElementById("da_txEditBtn");
    const txCancelBtn   = document.getElementById("da_txCancelBtn");

    const txActionDesc  = document.getElementById("da_txActionDesc");
    const txActionDate  = document.getElementById("da_txActionDate");
    const txActionAmount= document.getElementById("da_txActionAmount");

    function openTxActionModal(group) {
      if (!txActionModal) return;
      editingGroupCache = group;

      txActionDesc.textContent = group.description || "";

      const when = group.created_at || group.expense_date;
      txActionDate.textContent = when ? formatDateTime(when) : "";

      txActionAmount.textContent =
        group.amount != null ? Number(group.amount).toFixed(2) : "0.00";

      txActionModal.classList.add("da_modal--open");
    }


    function closeTxActionModal() {
      if (txActionModal) txActionModal.classList.remove("da_modal--open");
    }
    if (txActionClose)  txActionClose.onclick = closeTxActionModal;
    if (txCancelBtn)    txCancelBtn.onclick   = closeTxActionModal;
    if (txEditBtn) {
      txEditBtn.onclick = () => {
        if (!editingGroupCache) return;
        editingExpenseId = editingGroupCache.expense_id;
        closeTxActionModal();
        prefillExpenseFormFromGroup(editingGroupCache);
      };
    }

    if (txDeleteBtn) {
      txDeleteBtn.onclick = async () => {
        if (!editingGroupCache) return;
        const id = editingGroupCache.expense_id;
        if (!confirm("Delete this expense?")) return;

        try {
          const res = await fetch(`${API_BASE}/expenses/${id}`, { method: "DELETE" });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Delete failed");
          closeTxActionModal();
          closeFriendModal();
          await loadFriends();
          await loadExpenses();
          openInfoModal("Expense deleted successfully.", "Deleted");
        } catch (e) {
          console.error(e);
          alert("Could not delete expense.");
        }
      };
    }

    // Build only expenses where BOTH current user and this friend are involved
    const groups = [];
    byExpense.forEach((g) => {
      const rows = g.rows;
      const hasMe = g.payer_name === currentUser.name || rows.some(r => r.user_id === currentUser.user_id);
      const hasFriend = g.payer_name === friend.name || rows.some(r => r.user_id === friend.user_id);
      if (!hasMe || !hasFriend) return;

      const payerName = g.payer_name || "";
      let signedAmount = 0;

      if (payerName === currentUser.name) {
        const friendRow = rows.find((r) => r.user_id === friend.user_id);
        if (friendRow) {
          const v = Number(friendRow.owed_amount);
          if (!Number.isNaN(v)) signedAmount = v; 
        }
      } else if (payerName === friend.name) {
        const myRow = rows.find((r) => r.user_id === currentUser.user_id);
        if (myRow) {
          const v = Number(myRow.owed_amount);
          if (!Number.isNaN(v)) signedAmount = -v; 
        }
      } else {
        const myRow = rows.find((r) => r.user_id === currentUser.user_id);
        if (myRow) {
          const v = Number(myRow.owed_amount);
          if (!Number.isNaN(v)) signedAmount = -v;
        }
      }

      groups.push({
        expense_id: g.expense_id,
        description: g.description,
        expense_date: g.expense_date,
        created_at: g.created_at,   
        payer_name: g.payer_name,
        amount: g.amount,
        split_type: g.split_type,
        rows: g.rows,
        signedAmount,
      });

    });

    groups.sort((a, b) => {
      const ad = new Date(a.created_at || a.expense_date);
      const bd = new Date(b.created_at || b.expense_date);
      if (isNaN(ad) || isNaN(bd)) return 0;
      return bd - ad;
    });


    if (!groups.length) {
      const li = document.createElement("li");
      li.className = "da_tx-item";
      li.textContent = "No transactions with this friend yet.";
      daModalTransactions.appendChild(li);
    } else {
      let currentMonthKey = "";

      groups.forEach((tx) => {
        const { year, monthShort, monthLong, dayText } = getDateParts(
          tx.expense_date, tx.created_at
        );
        const monthKey = year && monthLong ? `${year}-${monthLong}` : "";

        if (monthKey && monthKey !== currentMonthKey) {
          currentMonthKey = monthKey;
          const headerLi = document.createElement("li");
          headerLi.className = "da_tx-month";
          headerLi.textContent = `${monthLong} ${year}`;
          daModalTransactions.appendChild(headerLi);
        }

        const li = document.createElement("li");
        li.className = "da_tx-item";

        const dateDiv = document.createElement("div");
        dateDiv.className = "da_tx-date";

        const monthSpan = document.createElement("div");
        monthSpan.className = "da_tx-date-month";
        monthSpan.textContent = monthShort;

        const daySpan = document.createElement("div");
        daySpan.className = "da_tx-date-day";
        daySpan.textContent = dayText;

        dateDiv.appendChild(monthSpan);
        dateDiv.appendChild(daySpan);

        const mainDiv = document.createElement("div");
        mainDiv.className = "da_tx-main";

        const titleSpan = document.createElement("div");
        titleSpan.className = "da_tx-title";
        titleSpan.textContent = tx.description || "(No description)";

        const subtitleSpan = document.createElement("div");
        subtitleSpan.className = "da_tx-subtitle";
        subtitleSpan.textContent = `Payer: ${tx.payer_name}`;

        mainDiv.appendChild(titleSpan);
        mainDiv.appendChild(subtitleSpan);

        const rightDiv = document.createElement("div");
        rightDiv.className = "da_tx-right";

        const amtSpan = document.createElement("span");
        const num = tx.signedAmount;
        const text =
          num > 0 ? `+${num.toFixed(2)}` : num < 0 ? num.toFixed(2) : "0.00";
        amtSpan.textContent = text;

        if (num < 0) {
          amtSpan.classList.add("da_tx-amount-negative");
        } else if (num > 0) {
          amtSpan.classList.add("da_tx-amount-positive");
        }

        rightDiv.appendChild(amtSpan);

        li.appendChild(dateDiv);
        li.appendChild(mainDiv);
        li.appendChild(rightDiv);

        li.addEventListener("click", () => {
          openTxActionModal({
            expense_id: tx.expense_id,
            description: tx.description,
            amount: tx.amount,
            split_type: tx.split_type,
            expense_date: tx.expense_date,
            created_at: tx.created_at,   
            payer_name: tx.payer_name,
            rows: (byExpense.get(tx.expense_id) || {}).rows || []
          });
        });

        daModalTransactions.appendChild(li);
      });
    }

    // Settle up button logic 
    if (daSettleUpBtn) {
      const balNum = Number(friend.balance || 0);
      if (!Number.isNaN(balNum) && balNum < 0) {
        daSettleUpBtn.disabled = false;
        daSettleUpBtn.onclick = () => openSettleModal(friend, Math.abs(balNum));
      } else {
        daSettleUpBtn.disabled = true;
        daSettleUpBtn.onclick = null;
      }
    }


    daModal.classList.add("da_modal--open");
  }

  function closeFriendModal() {
    if (daModal) {
      daModal.classList.remove("da_modal--open");
    }
    currentModalFriend = null;
  }

  if (daModalClose) {
    daModalClose.addEventListener("click", closeFriendModal);
  }
  if (daModal) {
    daModal.addEventListener("click", (e) => {
      if (e.target === daModal) closeFriendModal();
    });
  }

  function prefillExpenseFormFromGroup(group) {
    daExpenseModal.classList.add("da_modal--open");

    document.querySelector("#da_expenseModal .da_modal-title").textContent = "Edit Expense";
    document.querySelector("#da_expenseForm .da_settle-btn").textContent = "Update";

    document.getElementById("da_expenseDesc").value   = group.description || "";
    document.getElementById("da_expenseAmount").value = group.amount != null ? Number(group.amount) : "";

    selectedFriendIds.clear();
    (group.rows || []).forEach(r => {
      if (r.user_id !== currentUser.user_id) {
        selectedFriendIds.add(String(r.user_id));
      }
    });
    renderSelectedChips();

    renderExpenseFriendChips(daExpenseFriendSearch?.value || "");

    if (daSplitTypeSelect) daSplitTypeSelect.value = group.split_type || "equal";
    rebuildSplitExtraUI();

    if (group.split_type === "amount") {
      const inputs = daSplitExtraFields.querySelectorAll(".da_split-amount-input");
      inputs.forEach(inp => {
        const uid = Number(inp.dataset.userId);
        const row = (group.rows || []).find(r => r.user_id === uid);
        if (row) inp.value = Number(row.owed_amount).toFixed(2);
      });
    }
  }

  // Add Expense 
  function resetExpenseForm() {
    if (daExpenseForm) daExpenseForm.reset();
    if (daExpenseErrorEl) daExpenseErrorEl.textContent = "";

    if (daExpenseFriendsContainer) {
      const checks = daExpenseFriendsContainer.querySelectorAll("input[type='checkbox']");
      checks.forEach((c) => (c.checked = false));
    }

    if (daSplitExtraFields) daSplitExtraFields.innerHTML = "";
  }

  function closeExpenseModal() {
    if (daExpenseModal) {
      daExpenseModal.classList.remove("da_modal--open");
    }
  }

  if (daAddExpenseBtn && daExpenseModal) {
    daAddExpenseBtn.addEventListener("click", () => {
      editingExpenseId = null;
      editingGroupCache = null;
      document.querySelector("#da_expenseModal .da_modal-title").textContent = "Add Expense";
      document.querySelector("#da_expenseForm .da_settle-btn").textContent = "Add";

      selectedFriendIds.clear();
      renderSelectedChips();

      if (daExpenseFriendSearch) daExpenseFriendSearch.value = "";
      renderExpenseFriendChips("");

      daExpenseFriendsContainer.style.display = "none";
      daExpenseForm.reset();
      daSplitTypeSelect.value = "equal";
      rebuildSplitExtraUI();

      daExpenseModal.classList.add("da_modal--open");
    });
  }

  if (daExpenseModalClose) {
    daExpenseModalClose.addEventListener("click", closeExpenseModal);
  }
  if (daExpenseCancel) {
    daExpenseCancel.addEventListener("click", closeExpenseModal);
  }
  if (daExpenseModal) {
    daExpenseModal.addEventListener("click", (e) => {
      if (e.target === daExpenseModal) closeExpenseModal();
    });
  }

  if (daExpenseForm) {
    daExpenseForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (daExpenseErrorEl) daExpenseErrorEl.textContent = "";

      const descEl = document.getElementById("da_expenseDesc");
      const amountEl = document.getElementById("da_expenseAmount");

      const description = descEl ? descEl.value.trim() : "";
      const amountVal = amountEl ? parseFloat(amountEl.value) : NaN;
      const splitType = daSplitTypeSelect ? daSplitTypeSelect.value : "equal";

      if (!description) {
        if (daExpenseErrorEl) daExpenseErrorEl.textContent = "Please enter a description.";
        return;
      }
      if (isNaN(amountVal) || amountVal <= 0) {
        if (daExpenseErrorEl) daExpenseErrorEl.textContent = "Please enter a valid amount > 0.";
        return;
      }

      const participants = getSelectedParticipants();
      if (!participants.length) {
        if (daExpenseErrorEl) daExpenseErrorEl.textContent = "Select at least one person (including yourself).";
        return;
      }

      let participantPayload = [];

      if (splitType === "equal") {
        const perShareRaw = amountVal / participants.length;
        const perShare = Math.round(perShareRaw * 100) / 100;

        participantPayload = participants.map((p) => ({
          user_id: p.user_id,
          share_type: "equal",
          owed_amount: perShare,
        }));
      } else if (splitType === "amount") {
        const inputs = daSplitExtraFields
          ? daSplitExtraFields.querySelectorAll(".da_split-amount-input")
          : [];

        const amounts = [];
        let sum = 0;

        inputs.forEach((inp) => {
          const uid = Number(inp.dataset.userId);
          const val = parseFloat(inp.value);
          const amt = isNaN(val) ? 0 : Math.round(val * 100) / 100;
          amounts.push({ user_id: uid, amount: amt });
          sum += amt;
        });

        sum = Math.round(sum * 100) / 100;
        const totalRounded = Math.round(amountVal * 100) / 100;

        if (Math.abs(sum - totalRounded) > 0.01) {
          if (daExpenseErrorEl) {
            daExpenseErrorEl.textContent = `Custom amounts (${sum.toFixed(
              2
            )}) must match the total (${totalRounded.toFixed(2)}).`;
          }
          return;
        }

        participantPayload = amounts.map((a) => ({
          user_id: a.user_id,
          share_type: "amount",
          owed_amount: a.amount,
        }));
      } 

      const payload = {
        created_by: currentUser.user_id,
        payer_id: currentUser.user_id, 
        description,
        amount: amountVal,
        split_type: splitType,
        expense_date: todayISO(),
        participants: participantPayload,
      };

      const isEditing = editingExpenseId != null;
      const url    = isEditing ? `${API_BASE}/expenses/${editingExpenseId}` : `${API_BASE}/expenses`;
      const method = isEditing ? "PUT" : "POST";

      try {
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        console.log(isEditing ? "Update expense response:" : "Add expense response:", data);

        if (!res.ok) {
          if (daExpenseErrorEl) {
            daExpenseErrorEl.textContent = data.error || (isEditing ? "Failed to update expense." : "Failed to add expense.");
          }
          return;
        }

        resetExpenseForm();
        closeExpenseModal();

        editingExpenseId = null;
        editingGroupCache = null;
        document.querySelector("#da_expenseModal .da_modal-title").textContent = "Add Expense";
        document.querySelector("#da_expenseForm .da_settle-btn").textContent = "Add";

        await loadFriends();
        await loadExpenses();

        if (currentModalFriend && daModal && daModal.classList.contains("da_modal--open")) {
          const prevScroll = daModalTransactions ? daModalTransactions.scrollTop : 0;
          openFriendModal(currentModalFriend);
          requestAnimationFrame(() => {
            if (daModalTransactions) daModalTransactions.scrollTop = prevScroll;
          });
        }

        openInfoModal(
          isEditing ? "Expense updated successfully." : "Expense added successfully.",
          isEditing ? "Expense Updated" : "Expense Added"
        );
      } catch (err) {
        console.error("Save error:", err);
        if (daExpenseErrorEl) daExpenseErrorEl.textContent = "Server error while saving.";
      }

    });
  }

  // Search filter for friends
  if (daFriendSearchEl) {
    daFriendSearchEl.addEventListener("input", (e) => {
      renderFriendsList(e.target.value);
    });
  }

  if (daExpenseFriendSearch) {
    daExpenseFriendSearch.addEventListener("focus", () => {
      if (daExpenseFriendsContainer) {
        daExpenseFriendsContainer.style.display = "block";
      }
      renderExpenseFriendChips(daExpenseFriendSearch.value || "");
    });

    daExpenseFriendSearch.addEventListener("input", (e) => {
      if (daExpenseFriendsContainer) {
        daExpenseFriendsContainer.style.display = "block";
      }
      renderExpenseFriendChips(e.target.value);
    });
  }

  document.addEventListener("click", (e) => {
    if (!daExpenseModal || !daExpenseFriendsContainer || !daExpenseFriendSearch) return;

    const clickedInsideSearch =
      daExpenseFriendSearch.contains(e.target) ||
      daExpenseFriendsContainer.contains(e.target);

    const clickedInsideModal = daExpenseModal.contains(e.target);

    if (clickedInsideModal && !clickedInsideSearch) {
      daExpenseFriendsContainer.style.display = "none";
    }
  });

  if (daShowZeroFriendsCheckbox) {
    daShowZeroFriendsCheckbox.addEventListener("change", (e) => {
      daShowZeroFriends = e.target.checked;
      const searchTerm = daFriendSearchEl ? daFriendSearchEl.value : "";
      renderFriendsList(searchTerm);
    });
  }

  // Bottom navigation 
  daNavButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.target;

      daNavButtons.forEach((b) => b.classList.remove("da_nav-btn--active"));
      btn.classList.add("da_nav-btn--active");

      Object.keys(daSections).forEach((key) => {
        if (daSections[key]) daSections[key].classList.remove("da_section--active");
      });
      if (daSections[target]) daSections[target].classList.add("da_section--active");

      if (daAddExpenseBtn) {
        daAddExpenseBtn.style.display = target === "account" ? "none" : "block";
      }
    });
  });

  // Logout
  if (daLogoutBtn) {
    daLogoutBtn.addEventListener("click", () => {
      localStorage.removeItem("loggedInUser");
      openInfoModal("Logged out successfully.", "Logout");
      window.location.href = "index.html";
    });
  }

  loadFriends();
  loadExpenses();
});
