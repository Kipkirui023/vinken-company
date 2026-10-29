const API_URL = "/api";

document.addEventListener("DOMContentLoaded", () => {
  initMobileNavigation();

  if (document.getElementById("products-container")) {
    loadProducts();
  }

  if (document.getElementById("services-container")) {
    loadServices();
  }

  bindJsonForm("contact-form", {
    endpoint: "/inquiries",
    successMessage:
      "Thank you. Your message has been received and our team will be in touch.",
    getPayload: (form) => {
      const fields = new FormData(form);
      const normalize = (value) =>
        typeof value === "string" ? value.trim() : "";

      return {
        organization_name: normalize(fields.get("organization")),
        contact_person: normalize(fields.get("name")),
        email: normalize(fields.get("email")),
        phone: normalize(fields.get("phone")),
        subject: normalize(fields.get("subject")),
        message: normalize(fields.get("message")),
      };
    },
  });

  bindJsonForm("quote-form", {
    endpoint: "/quotations",
    successMessage: "Your quotation request has been received.",
    getPayload: (form) => quotationPayload(new FormData(form)),
  });

  bindJsonForm("tender-form", {
    endpoint: "/quotations",
    successMessage:
      "Your procurement requirement has been received. Please email any tender or LPO documents to info@vinkensolutions.co.ke and include your reference.",
    getPayload: (form) => {
      const fields = new FormData(form);
      return {
        organization_name: fields.get("organization"),
        contact_person: fields.get("contactPerson"),
        email: fields.get("email"),
        phone: fields.get("phone"),
        product_service: fields.get("requirement"),
        quantity: fields.get("quantity"),
        delivery_location: fields.get("deliveryLocation"),
        tender_lpo_reference: fields.get("reference"),
        requirement_type: fields.get("requirementType"),
        required_delivery_date: fields.get("deliveryDate"),
        additional_requirements: fields.get("additionalInfo"),
      };
    },
  });

  const year = new Date().getFullYear();
  document
    .querySelectorAll(".footer-bottom p, footer .text-center p")
    .forEach((element) => {
      element.textContent = element.textContent
        .replace(/©|&copy;|©/g, "©")
        .replace(/\b20\d{2}\b/, year);
    });

  const today = new Date();
  const localDate = new Date(
    today.getTime() - today.getTimezoneOffset() * 60_000,
  )
    .toISOString()
    .slice(0, 10);
  document
    .querySelectorAll('input[type="date"]')
    .forEach((input) => input.setAttribute("min", localDate));
});

function initMobileNavigation() {
  const toggles = document.querySelectorAll(".navbar-toggler");

  toggles.forEach((toggle) => {
    const targetSelector = toggle.getAttribute("data-bs-target");
    if (!targetSelector) return;

    const collapse = document.querySelector(targetSelector);
    if (!collapse) return;

    toggle.addEventListener("click", (event) => {
      event.stopPropagation();
      const isExpanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isExpanded));
      collapse.classList.toggle("show", !isExpanded);
    });
  });

  document.addEventListener("click", (event) => {
    const openMenu = document.querySelector(".navbar-collapse.show");
    if (!openMenu) return;

    const toggle = document.querySelector(
      `[data-bs-target="#${openMenu.id}"]`,
    );
    const clickedInside =
      openMenu.contains(event.target) ||
      (toggle && toggle.contains(event.target));

    if (!clickedInside) {
      openMenu.classList.remove("show");
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    }
  });
}

function quotationPayload(fields) {
  return {
    organization_name: fields.get("organization_name"),
    contact_person: fields.get("contact_person"),
    email: fields.get("email"),
    phone: fields.get("phone"),
    address: fields.get("address"),
    product_service: fields.get("product_service"),
    quantity: fields.get("quantity"),
    delivery_location: fields.get("delivery_location"),
    tender_lpo_reference: fields.get("tender_lpo_reference"),
    requirement_type: fields.get("requirement_type"),
    required_delivery_date: fields.get("required_delivery_date"),
    additional_requirements: fields.get("additional_requirements"),
  };
}

async function loadProducts() {
  const container = document.getElementById("products-container");

  try {
    const result = await fetchJson(`${API_URL}/products`);
    renderProducts(container, result.data);
  } catch (error) {
    console.error("Product loading error:", error);
    renderLoadError(container, "Product listings are temporarily unavailable.");
  }
}

function renderProducts(container, products) {
  container.replaceChildren();

  if (!Array.isArray(products) || products.length === 0) {
    renderEmptyState(container, "Product listings are being updated.");
    return;
  }

  products.forEach((product) => {
    const column = document.createElement("div");
    column.className = "col-md-6 col-lg-4";

    const card = document.createElement("article");
    card.className = "card product-card h-100 border-0";

    const imageWrap = document.createElement("div");
    imageWrap.className = "product-image";
    const imageUrl = safeImageUrl(product.image);

    if (imageUrl) {
      const image = document.createElement("img");
      image.src = imageUrl;
      image.alt = product.name
        ? `${product.name} product image`
        : "Product image";
      image.loading = "lazy";
      imageWrap.append(image);
    } else {
      const placeholder = document.createElement("div");
      placeholder.className = "product-placeholder";
      placeholder.setAttribute("aria-hidden", "true");
      placeholder.innerHTML = '<i class="bi bi-box-seam"></i>';
      imageWrap.append(placeholder);
    }

    const body = document.createElement("div");
    body.className = "card-body p-4";

    const category = document.createElement("span");
    category.className = "badge bg-primary mb-2";
    category.textContent = product.category || "General supply";

    const title = document.createElement("h2");
    title.className = "h5 card-title";
    title.textContent = product.name || "Product";

    const description = document.createElement("p");
    description.className = "card-text";
    description.textContent = product.description || "";

    body.append(category, title, description);

    if (product.specifications) {
      const specifications = document.createElement("p");
      specifications.className = "small text-muted";
      specifications.textContent = `Specifications: ${product.specifications}`;
      body.append(specifications);
    }

    const link = document.createElement("a");
    link.className = "btn btn-outline-primary";
    link.href = "quote.html";
    link.textContent = "Request a quote";
    body.append(link);

    card.append(imageWrap, body);
    column.append(card);
    container.append(column);
  });
}

async function loadServices() {
  const container = document.getElementById("services-container");

  try {
    const result = await fetchJson(`${API_URL}/services`);
    renderServices(container, result.data);
  } catch (error) {
    console.error("Service loading error:", error);
    renderLoadError(container, "Service listings are temporarily unavailable.");
  }
}

function renderServices(container, services) {
  container.replaceChildren();

  if (!Array.isArray(services) || services.length === 0) {
    renderEmptyState(container, "Our service listings are being updated.");
    return;
  }

  services.forEach((service) => {
    const column = document.createElement("div");
    column.className = "col-md-6 col-lg-4";

    const card = document.createElement("article");
    card.className = "card service-card h-100 border-0";

    const icon = document.createElement("div");
    icon.className = "service-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.innerHTML = '<i class="bi bi-briefcase"></i>';

    const title = document.createElement("h2");
    title.className = "h5 card-title";
    title.textContent = service.name || "Service";

    const description = document.createElement("p");
    description.className = "card-text";
    description.textContent = service.description || "";

    const link = document.createElement("a");
    link.className = "btn btn-outline-primary";
    link.href = "quote.html";
    link.textContent = "Request a quote";

    const body = document.createElement("div");
    body.className = "card-body p-4";
    body.append(icon, title, description, link);
    card.append(body);
    column.append(card);
    container.append(column);
  });
}

function renderEmptyState(container, message) {
  const column = document.createElement("div");
  column.className = "col-12";
  column.innerHTML = `
    <div class="alert alert-light text-center border" role="status"></div>
  `;
  column.querySelector(".alert").textContent = message;
  container.append(column);
}

function renderLoadError(container, message) {
  container.replaceChildren();
  const column = document.createElement("div");
  column.className = "col-12";
  const alert = document.createElement("div");
  alert.className = "alert alert-warning text-center";
  alert.setAttribute("role", "status");
  alert.textContent = message;
  column.append(alert);
  container.append(column);
}

function safeImageUrl(value) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  try {
    const url = new URL(value, window.location.origin);
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return null;
    }
    return url.href;
  } catch {
    return null;
  }
}

function bindJsonForm(formId, { endpoint, getPayload, successMessage }) {
  const form = document.getElementById(formId);
  if (!form) {
    return;
  }

  const button = form.querySelector('button[type="submit"]');
  if (!button) {
    console.error(`Submit button not found for form "${formId}".`);
    return;
  }

  const status = form.querySelector("[data-form-status]");
  if (!status) {
    console.error(`Status message area not found for form "${formId}".`);
    return;
  }

  const originalButtonContent = button.innerHTML;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    button.disabled = true;
    button.textContent = "Sending...";
    status.textContent = "";
    status.className = "mb-3";

    try {
      const result = await postJson(`${API_URL}${endpoint}`, getPayload(form));
      const reference =
        result.data?.quotation_id ?? result.data?.inquiry_id ?? null;
      status.textContent = reference
        ? `${successMessage} Reference: #${reference}.`
        : successMessage;
      status.className = "alert alert-success mb-3";
      status.setAttribute("role", "status");
      form.reset();
    } catch (error) {
      console.error(`Form submission error (${formId}):`, error);
      status.textContent =
        error instanceof Error
          ? error.message
          : "We could not send your request. Please try again.";
      status.className = "alert alert-danger mb-3";
      status.setAttribute("role", "alert");
    } finally {
      button.disabled = false;
      button.innerHTML = originalButtonContent;
    }
  });
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });
  const result = await readJsonResponse(response);

  if (!response.ok || !result.success) {
    throw new Error(result.message || "The request could not be completed.");
  }

  return result;
}

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const result = await readJsonResponse(response);

  if (!response.ok || !result.success) {
    throw new Error(result.message || "The request could not be completed.");
  }

  return result;
}

async function readJsonResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error("The service returned an unexpected response.");
  }
  return response.json();
}
