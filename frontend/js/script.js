// LOGIN PAGE (index.html)

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
        openInfoModal("Backend not ready yet", "Notice");

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

  // ---------- REGISTER ----------
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
        openInfoModal("Backend not connected yet", "Notice");

        const data = await res.json();
        console.log("Register response:", data);

        if (!res.ok || !data.ok) {
          alert(data.error || "Registration failed");
          return;
        }

        openInfoModal(
          "Registration successful! You can now log in.",
          "Registration Complete"
        );
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
  // Are we on the dashboard page?
  const daApp = document.querySelector(".da_app");
  if (!daApp) return;

  // Make sure user is logged in
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
  const daShowZeroFriendsCheckbox =
    document.getElementById("da_showZeroFriends");

  if (daAccountNameEl) daAccountNameEl.textContent = currentUser.name || "N/A";
  if (daAccountEmailEl)
    daAccountEmailEl.textContent = currentUser.email || "N/A";

  // Friends / Activity elements
  const daFriendsListEl = document.getElementById("da_friendsList");
  const daFriendSearchEl = document.getElementById("da_friendSearch");
  const daActivityListEl = document.getElementById("da_activityList");

  // Declare missing variables
  const daNavButtons = document.querySelectorAll(".da_nav-btn");
  const daSections = {
    friends: document.getElementById("da_friendsSection"),
    activity: document.getElementById("da_activitySection"),
    account: document.getElementById("da_accountSection"),
  };
  const daAddExpenseBtn = document.getElementById("da_addExpenseBtn");

  // Bottom navigation (Friends / Activity / Account)
  daNavButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.target;

      daNavButtons.forEach((b) => b.classList.remove("da_nav-btn--active"));
      btn.classList.add("da_nav-btn--active");

      Object.keys(daSections).forEach((key) => {
        if (daSections[key])
          daSections[key].classList.remove("da_section--active");
      });
      if (daSections[target])
        daSections[target].classList.add("da_section--active");

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
});

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
    daFriends.forEach((f) => {
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

      const signed =
        balance > 0 ? `+${balance.toFixed(2)}` : balance.toFixed(2);
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

  const filtered = daFriends.filter((f) => f.name.toLowerCase().includes(term));
  if (!filtered.length) {
    const p = document.createElement("p");
    p.style.fontSize = "0.85rem";
    p.style.color = "#888";
    p.textContent = "No friends match your search.";
    daExpenseFriendsContainer.appendChild(p);
    return;
  }

  filtered.forEach((friend) => {
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

  Array.from(selectedFriendIds).forEach((idStr) => {
    const friend = daFriends.find((f) => String(f.user_id) === idStr);
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
    dayText: d.getDate().toString(),
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
      g.expense_date,
      g.created_at
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
        const others = rows.filter((r) => r.user_id !== currentUser.user_id);
        const who =
          others.length === 1
            ? friendMap.get(others[0].user_id) || "friend"
            : "friends";
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
