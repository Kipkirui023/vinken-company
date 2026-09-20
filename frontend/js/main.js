// ============================================================
// VINKEN SOLUTIONS LIMITED
// MAIN JAVASCRIPT
// ============================================================

const API_URL = "http://localhost:5000/api";

// ============================================================
// PAGE INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", function () {
  console.log("Vinken Solutions website loaded successfully.");

  // Products
  if (document.getElementById("products-container")) {
    loadProducts();
  }

  // Services
  if (document.getElementById("services-container")) {
    loadServices();
  }

  // Contact form
  initializeContactForm();

  // Request quotation form
  initializeQuoteForm();
});

// ============================================================
// PRODUCTS
// ============================================================

async function loadProducts() {
  const container = document.getElementById("products-container");

  if (!container) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/products`);

    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }

    const result = await response.json();

    console.log("Products:", result);

    if (!result.success) {
      throw new Error(result.message || "Unable to load products");
    }

    displayProducts(result.data);
  } catch (error) {
    console.error("Product loading error:", error);

    container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger text-center">
                    <strong>Unable to load products.</strong>
                    <br>
                    Please try again later.
                </div>
            </div>
        `;
  }
}

function displayProducts(products) {
  const container = document.getElementById("products-container");

  if (!container) {
    return;
  }

  if (!products || products.length === 0) {
    container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info text-center">
                    No products are currently available.
                </div>
            </div>
        `;

    return;
  }

  container.innerHTML = products
    .map(function (product) {
      return `
            <div class="col-md-6 col-lg-4">

                <div class="card product-card h-100 shadow-sm border-0">

                    <div class="product-image">

                        ${
                          product.image
                            ? `
                                    <img
                                        src="${product.image}"
                                        alt="${product.name}"
                                        class="img-fluid"
                                    >
                                `
                            : `
                                    <div class="product-placeholder">
                                        <i class="bi bi-box-seam"></i>
                                    </div>
                                `
                        }

                    </div>

                    <div class="card-body">

                        <span class="badge bg-primary mb-2">
                            ${product.category || "General Supply"}
                        </span>

                        <h5 class="card-title">
                            ${product.name}
                        </h5>

                        <p class="card-text">
                            ${product.description || ""}
                        </p>

                        ${
                          product.specifications
                            ? `
                                    <p class="small text-muted">

                                        <strong>
                                            Specifications:
                                        </strong>

                                        <br>

                                        ${product.specifications}

                                    </p>
                                `
                            : ""
                        }

                        <a
                            href="quote.html"
                            class="btn btn-outline-primary"
                        >
                            Request a Quote
                        </a>

                    </div>

                </div>

            </div>
        `;
    })
    .join("");
}

// ============================================================
// SERVICES
// ============================================================

async function loadServices() {
  const container = document.getElementById("services-container");

  if (!container) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/services`);

    if (!response.ok) {
      throw new Error("Failed to fetch services");
    }

    const result = await response.json();

    console.log("Services:", result);

    if (!result.success) {
      throw new Error(result.message || "Unable to load services");
    }

    displayServices(result.data);
  } catch (error) {
    console.error("Service loading error:", error);

    container.innerHTML = `
            <div class="col-12">

                <div class="alert alert-danger text-center">

                    <strong>
                        Unable to load services.
                    </strong>

                    <br>

                    Please try again later.

                </div>

            </div>
        `;
  }
}

function displayServices(services) {
  const container = document.getElementById("services-container");

  if (!container) {
    return;
  }

  if (!services || services.length === 0) {
    container.innerHTML = `
            <div class="col-12">

                <div class="alert alert-info text-center">
                    No services are currently available.
                </div>

            </div>
        `;

    return;
  }

  container.innerHTML = services
    .map(function (service) {
      return `
            <div class="col-md-6 col-lg-4">

                <div class="card service-card h-100 shadow-sm border-0">

                    <div class="card-body">

                        <div class="service-icon mb-3">
                            <i class="bi bi-briefcase"></i>
                        </div>

                        <h5 class="card-title">
                            ${service.name}
                        </h5>

                        <p class="card-text">
                            ${service.description || ""}
                        </p>

                        <a
                            href="quote.html"
                            class="btn btn-outline-primary"
                        >
                            Request a Quote
                        </a>

                    </div>

                </div>

            </div>
        `;
    })
    .join("");
}

// ============================================================
// CONTACT FORM
// ============================================================

function initializeContactForm() {
  const contactForm = document.getElementById("contact-form");

  if (!contactForm) {
    return;
  }

  console.log("Contact form detected.");

  contactForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const submitButton = contactForm.querySelector('button[type="submit"]');

    if (!submitButton) {
      return;
    }

    const originalText = submitButton.innerHTML;

    submitButton.disabled = true;

    submitButton.innerHTML = `
                <span
                    class="spinner-border spinner-border-sm"
                    role="status"
                ></span>

                Sending...
            `;

    const formData = {
      organization_name: document
        .getElementById("organization_name")
        ?.value.trim(),

      contact_person: document.getElementById("contact_person")?.value.trim(),

      email: document.getElementById("email")?.value.trim(),

      phone: document.getElementById("phone")?.value.trim(),

      subject: document.getElementById("subject")?.value.trim(),

      message: document.getElementById("message")?.value.trim(),
    };

    try {
      const response = await fetch(`${API_URL}/inquiries`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to submit inquiry.");
      }

      alert(
        "Thank you! Your inquiry has been submitted successfully. We will get back to you soon.",
      );

      contactForm.reset();
    } catch (error) {
      console.error("Contact form error:", error);

      alert(
        error.message ||
          "Unable to submit your inquiry. Please try again later.",
      );
    } finally {
      submitButton.disabled = false;

      submitButton.innerHTML = originalText;
    }
  });
}

// ============================================================
// REQUEST A QUOTE
// ============================================================

function initializeQuoteForm() {
  const quoteForm = document.getElementById("quote-form");

  if (!quoteForm) {
    return;
  }

  console.log("Quote form detected.");

  const submitButton = document.getElementById("quote-submit-button");

  const messageContainer = document.getElementById("quote-message");

  if (!submitButton) {
    console.error("quote-submit-button not found.");

    return;
  }

  if (!messageContainer) {
    console.error("quote-message not found.");

    return;
  }

  quoteForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    console.log("Quotation form submitted.");

    const originalButtonText = submitButton.innerHTML;

    // ------------------------------------------------
    // LOADING
    // ------------------------------------------------

    submitButton.disabled = true;

    submitButton.innerHTML = `
                <span
                    class="spinner-border spinner-border-sm me-2"
                    role="status"
                ></span>

                Submitting Request...
            `;

    messageContainer.innerHTML = "";

    // ------------------------------------------------
    // FORM DATA
    // ------------------------------------------------

    const formData = {
      organization_name: document
        .getElementById("organization_name")
        .value.trim(),

      contact_person: document.getElementById("contact_person").value.trim(),

      email: document.getElementById("email").value.trim(),

      phone: document.getElementById("phone").value.trim(),

      address: document.getElementById("address").value.trim(),

      product_service: document.getElementById("product_service").value.trim(),

      quantity: document.getElementById("quantity").value.trim(),

      delivery_location: document
        .getElementById("delivery_location")
        .value.trim(),

      tender_lpo_reference: document
        .getElementById("tender_lpo_reference")
        .value.trim(),

      requirement_type: document.getElementById("requirement_type").value,

      required_delivery_date: document.getElementById("required_delivery_date")
        .value,

      additional_requirements: document
        .getElementById("additional_requirements")
        .value.trim(),
    };

    console.log("Quotation data:", formData);

    // ------------------------------------------------
    // SEND TO API
    // ------------------------------------------------

    try {
      const response = await fetch(`${API_URL}/quotations`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(formData),
      });

      console.log("Quotation response status:", response.status);

      const result = await response.json();

      console.log("Quotation API response:", result);

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to submit quotation request.",
        );
      }

      // ------------------------------------------------
      // SUCCESS
      // ------------------------------------------------

      const quotationId =
        result.data && result.data.quotation_id
          ? result.data.quotation_id
          : "N/A";

      messageContainer.innerHTML = `

                    <div
                        class="alert alert-success"
                        role="alert"
                    >

                        <h5 class="alert-heading">

                            <i
                                class="bi bi-check-circle me-2"
                            ></i>

                            Request Submitted Successfully

                        </h5>

                        <p class="mb-1">

                            Thank you for contacting
                            Vinken Solutions Limited.

                        </p>

                        <p class="mb-0">

                            Your quotation request has been received.
                            Our team will review your requirements
                            and get back to you.

                        </p>

                        <hr>

                        <small>

                            Reference:

                            <strong>
                                #${quotationId}
                            </strong>

                        </small>

                    </div>

                `;

      quoteForm.reset();

      messageContainer.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    } catch (error) {
      console.error("Quotation request error:", error);

      messageContainer.innerHTML = `

                    <div
                        class="alert alert-danger"
                        role="alert"
                    >

                        <i
                            class="bi bi-exclamation-triangle me-2"
                        ></i>

                        ${
                          error.message ||
                          "Unable to submit your request. Please try again."
                        }

                    </div>

                `;

      messageContainer.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    } finally {
      submitButton.disabled = false;

      submitButton.innerHTML = originalButtonText;
    }
  });
}
