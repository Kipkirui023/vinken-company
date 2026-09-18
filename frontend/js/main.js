// ================================
// PRODUCTS API
// ================================

const API_URL = "http://localhost:5000/api";

async function loadProducts() {
  const container = document.getElementById("products-container");

  // Only run on the products page
  if (!container) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/products`);

    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }

    const result = await response.json();

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

// Display products
function displayProducts(products) {
  const container = document.getElementById("products-container");

  if (!container) {
    return;
  }

  if (products.length === 0) {
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
    .map((product) => {
      return `
            <div class="col-md-6 col-lg-4">
                <div class="card product-card h-100 shadow-sm border-0">

                    <div class="product-image">
                        ${
                          product.image
                            ? `<img 
                                src="${product.image}" 
                                alt="${product.name}"
                                class="img-fluid"
                              >`
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
                                    <strong>Specifications:</strong><br>
                                    ${product.specifications}
                                </p>
                              `
                            : ""
                        }

                        <a href="contact.html" class="btn btn-outline-primary">
                            Request a Quote
                        </a>

                    </div>
                </div>
            </div>
        `;
    })
    .join("");
}

// Load products when page opens
document.addEventListener("DOMContentLoaded", loadProducts);
