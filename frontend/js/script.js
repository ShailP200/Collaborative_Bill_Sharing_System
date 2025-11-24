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
  const daShowZeroFriendsCheckbox = document.getElementById("da_showZeroFriends");

  if (daAccountNameEl) daAccountNameEl.textContent = currentUser.name || "N/A";
  if (daAccountEmailEl) daAccountEmailEl.textContent = currentUser.email || "N/A";

  // Friends / Activity elements
  const daFriendsListEl = document.getElementById("da_friendsList");
  const daFriendSearchEl = document.getElementById("da_friendSearch");
  const daActivityListEl = document.getElementById("da_activityList");

  // Declare missing variables
  const daNavButtons = document.querySelectorAll(".da_nav-btn");
  const daSections = {
    friends: document.getElementById("da_friendsSection"),
    activity: document.getElementById("da_activitySection"),
    account: document.getElementById("da_accountSection")
  };
  const daAddExpenseBtn = document.getElementById("da_addExpenseBtn");

  // Bottom navigation (Friends / Activity / Account)
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

});
