const authTabs = document.querySelectorAll("[data-auth-tab]");
const authPanels = {
  login: document.getElementById("loginPanel"),
  signup: document.getElementById("signupPanel"),
};

const showTab = (target) => {
  authTabs.forEach((tab) => {
    const isActive = tab.dataset.authTab === target;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  Object.entries(authPanels).forEach(([key, panel]) => {
    const isActive = key === target;
    panel.classList.toggle("active", isActive);
  });
};

authTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    showTab(tab.dataset.authTab);
  });
});

const setMessage = (element, message, type) => {
  if (!element) return;
  element.textContent = message;
  element.classList.remove("error", "success");
  if (type) element.classList.add(type);
};

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const CUSTOMER_SESSION_KEY = "vinkenCustomerSession";

async function submitCustomerRequest(
  url,
  payload,
  messageElement,
  successText,
) {
  messageElement.textContent = "";
  messageElement.classList.remove("error", "success");

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Request failed.");
    }

    const session = {
      token: result.token,
      user: result.user,
      email: result.user?.email || payload.email,
      name: result.user?.name || payload.name || "Customer",
    };

    localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(session));

    setMessage(messageElement, successText, "success");

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 600);
  } catch (error) {
    setMessage(
      messageElement,
      error.message || "Something went wrong.",
      "error",
    );
  }
}

if (loginForm) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(loginForm);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "").trim();
    const messageEl = document.getElementById("loginMessage");

    if (!email || !password) {
      setMessage(messageEl, "Please enter both email and password.", "error");
      return;
    }

    submitCustomerRequest(
      "/api/auth/login",
      { email, password },
      messageEl,
      "Login successful. Redirecting to your customer dashboard...",
    );
  });
}

if (signupForm) {
  signupForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(signupForm);
    const name = String(formData.get("name") || "").trim();
    const company = String(formData.get("company") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "").trim();
    const messageEl = document.getElementById("signupMessage");

    if (!name || !email || !password) {
      setMessage(messageEl, "Please complete all required fields.", "error");
      return;
    }

    if (password.length < 6) {
      setMessage(
        messageEl,
        "Password must be at least 6 characters long.",
        "error",
      );
      return;
    }

    submitCustomerRequest(
      "/api/auth/signup",
      { name, company, email, password },
      messageEl,
      "Account created successfully. Redirecting to your customer portal...",
    );
  });
}
