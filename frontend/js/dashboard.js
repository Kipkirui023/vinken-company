const CUSTOMER_SESSION_KEY = "vinkenCustomerSession";

const customerName = document.getElementById("customerName");
const customerGreeting = document.getElementById("customerGreeting");
const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profileCompany = document.getElementById("profileCompany");
const customerInitials = document.getElementById("customerInitials");
const signOutButton = document.getElementById("signOutButton");

function readSession() {
  try {
    const session = JSON.parse(
      localStorage.getItem(CUSTOMER_SESSION_KEY) || "null",
    );
    return session && session.token ? session : null;
  } catch (error) {
    return null;
  }
}

function redirectToLogin() {
  localStorage.removeItem(CUSTOMER_SESSION_KEY);
  window.location.href = "auth.html";
}

async function loadCustomerProfile() {
  const session = readSession();
  if (!session) {
    redirectToLogin();
    return;
  }

  try {
    const response = await fetch("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || "Unable to load your account.");
    }

    const user = result.user || session.user;
    const safeName = user.name || "Customer";
    const safeCompany = user.company || "Not provided";

    customerName.textContent = safeName;
    customerGreeting.textContent = safeName.split(" ")[0];
    profileName.textContent = safeName;
    profileEmail.textContent = user.email || "—";
    profileCompany.textContent = safeCompany;

    const initials =
      safeName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("") || "CU";

    customerInitials.textContent = initials;
  } catch (error) {
    redirectToLogin();
  }
}

if (signOutButton) {
  signOutButton.addEventListener("click", () => {
    localStorage.removeItem(CUSTOMER_SESSION_KEY);
    window.location.href = "auth.html";
  });
}

loadCustomerProfile();
