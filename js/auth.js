import { initPlanner } from "./session.js";
import { initProgress } from "./progress.js";

const users = {
  joyuu: {
    password: "study2026",
    role: "student"
  },

  admin: {
    password: "admin123",
    role: "admin"
  }
};


export async function initAuth() {

  const overlay = document.getElementById("login-overlay");
  const loginBtn = document.getElementById("login-btn");

  const usernameDisplay = document.getElementById("current-user");
  const logoutBtn = document.getElementById("logout-btn");

  const togglePassword = document.getElementById("toggle-password");
  const passwordInput = document.getElementById("password-input");

  const adminNav = document.getElementById("admin-nav");


  function updateUserDisplay() {

    const user = localStorage.getItem("currentUser");

    if (user && usernameDisplay) {
      usernameDisplay.textContent = `🌸 ${user}`;
    }

    if (adminNav) {
      adminNav.style.display =
        user === "admin" ? "flex" : "none";
    }

  }


  // Show / Hide Password
  togglePassword.addEventListener("click", () => {

    if (passwordInput.type === "password") {

      passwordInput.type = "text";
      togglePassword.textContent = "🙈";

    } else {

      passwordInput.type = "password";
      togglePassword.textContent = "👁";

    }

  });


  // Logout
  logoutBtn.addEventListener("click", () => {

    localStorage.removeItem("currentUser");

    location.reload();

  });


  // Already logged in
  const currentUser = localStorage.getItem("currentUser");

  if (currentUser) {

    overlay.style.display = "none";

    updateUserDisplay();

    await initPlanner();

    await initProgress();

  }


  // Login
  loginBtn.addEventListener("click", async () => {

    const username =
      document.getElementById("username-input").value.trim();

    const password =
      document.getElementById("password-input").value;

    const user = users[username];

    if (!user || user.password !== password) {

      const errorElement =
        document.getElementById("login-error");

      errorElement.textContent =
        "Incorrect username or password";

      errorElement.classList.remove("error-shake");

      void errorElement.offsetWidth;

      errorElement.classList.add("error-shake");

      return;

    }

    localStorage.setItem(
      "currentUser",
      username
    );

    overlay.style.display = "none";

    updateUserDisplay();

    await initPlanner();

    await initProgress();

  });

}