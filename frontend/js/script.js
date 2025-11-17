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