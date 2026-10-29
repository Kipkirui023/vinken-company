(() => {
  "use strict";

  const API_KEY_STORAGE = "916ffc63920b280ef57b324915d06eb2";
  const QUOTATION_STATUSES = [
    "new",
    "reviewing",
    "quoted",
    "completed",
    "cancelled",
  ];
  const state = {
    apiKey: "",
    inquiries: [],
    quotations: [],
    products: [],
    services: [],
    view: "overview",
    catalogueTab: "products",
  };

  const byId = (id) => document.getElementById(id);
  const loginScreen = byId("loginScreen");
  const appShell = byId("appShell");
  const loginForm = byId("loginForm");
  const loginError = byId("loginError");
  const loginSubmit = byId("loginSubmit");
  const notice = byId("dashboardNotice");
  const detailDialog = byId("detailDialog");

  function element(tag, className, text) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined && text !== null) item.textContent = String(text);
    return item;
  }

  async function request(url, options = {}, apiKey = state.apiKey) {
    const headers = new Headers(options.headers || {});
    headers.set("x-admin-api-key", apiKey);
    if (options.body && !headers.has("content-type")) {
      headers.set("content-type", "application/json");
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "same-origin",
    });
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      if (response.status === 404) {
        throw new Error(
          `The server at ${window.location.origin} does not provide the dashboard API. ` +
            "Start the app with “npm start” and open http://localhost:5000/admin.html, " +
            "or configure your web host to forward /api requests to the Express server.",
        );
      }
      throw new Error(
        `The server returned an unexpected response (${response.status}).`,
      );
    }

    let result;
    try {
      result = await response.json();
    } catch {
      throw new Error(
        `The server returned an invalid response (${response.status}).`,
      );
    }

    if (!response.ok || result.success === false) {
      const error = new Error(
        result.message || `Request failed (${response.status}).`,
      );
      error.status = response.status;
      throw error;
    }
    return result;
  }

  async function loadData(apiKey) {
    const [inquiries, quotations, products, services] = await Promise.all([
      request("/api/inquiries", {}, apiKey),
      request("/api/quotations", {}, apiKey),
      request("/api/products", {}, apiKey),
      request("/api/services", {}, apiKey),
    ]);

    state.inquiries = inquiries.data || [];
    state.quotations = quotations.data || [];
    state.products = products.data || [];
    state.services = services.data || [];
    state.apiKey = apiKey;
    sessionStorage.setItem(API_KEY_STORAGE, apiKey);
    showDashboard();
    renderAll();
  }

  function showDashboard() {
    loginScreen.hidden = true;
    appShell.hidden = false;
    byId("todayLabel").textContent = new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(new Date());
  }

  function showLogin(message = "") {
    state.apiKey = "";
    sessionStorage.removeItem(API_KEY_STORAGE);
    appShell.hidden = true;
    loginScreen.hidden = false;
    loginError.textContent = message;
    loginError.hidden = !message;
    byId("adminKey").focus();
  }

  function showNotice(message, isError = false) {
    notice.textContent = message;
    notice.classList.toggle("is-error", isError);
    notice.hidden = !message;
  }

  function dateLabel(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  }

  function readableStatus(value) {
    return String(value || "unknown").replaceAll("_", " ");
  }

  function statusPill(status) {
    const label = readableStatus(status);
    return element(
      "span",
      `status-pill status-${String(status || "").toLowerCase()}`,
      label,
    );
  }

  function contactCell(record) {
    const wrapper = element("div", "contact-cell");
    wrapper.append(
      element(
        "strong",
        "",
        record.contact_person || record.organization_name || "Unknown contact",
      ),
      element(
        "span",
        "",
        record.organization_name || record.email || "No organization",
      ),
    );
    return wrapper;
  }

  function createCell(content, className = "") {
    const cell = element("td", className);
    if (content instanceof Node) cell.append(content);
    else if (content !== undefined && content !== null)
      cell.textContent = String(content);
    return cell;
  }

  function createRowAction(type, id, label) {
    const button = element("button", "row-action");
    button.type = "button";
    button.dataset.action = type;
    button.dataset.id = String(id);
    button.setAttribute("aria-label", label);
    button.title = label;
    const icon = element("i", "bi bi-eye");
    icon.setAttribute("aria-hidden", "true");
    button.append(icon);
    return button;
  }

  function renderMetrics() {
    const newInquiries = state.inquiries.filter(
      (item) => item.status === "new",
    ).length;
    const openQuotes = state.quotations.filter((item) =>
      ["new", "reviewing"].includes(item.status),
    ).length;
    byId("metricInquiries").textContent = state.inquiries.length;
    byId("metricNewInquiries").textContent =
      `${newInquiries} new ${newInquiries === 1 ? "inquiry" : "inquiries"}`;
    byId("metricQuotations").textContent = state.quotations.length;
    byId("metricOpenQuotes").textContent = `${openQuotes} need attention`;
    byId("metricProducts").textContent = state.products.length;
    byId("metricServices").textContent = state.services.length;
    byId("inquiryNavCount").textContent = newInquiries;
    byId("quotationNavCount").textContent = openQuotes;
    byId("productTabCount").textContent = state.products.length;
    byId("serviceTabCount").textContent = state.services.length;
    byId("inquiryTotal").textContent =
      `${state.inquiries.length} ${state.inquiries.length === 1 ? "message" : "messages"}`;
    byId("quotationTotal").textContent =
      `${state.quotations.length} ${state.quotations.length === 1 ? "request" : "requests"}`;
  }

  function renderChart() {
    const now = new Date();
    const months = [];
    for (let offset = 5; offset >= 0; offset -= 1) {
      const month = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      months.push({
        label: new Intl.DateTimeFormat(undefined, { month: "short" }).format(
          month,
        ),
        year: month.getFullYear(),
        month: month.getMonth(),
        count: 0,
      });
    }

    state.quotations.forEach((item) => {
      const date = new Date(item.created_at);
      if (Number.isNaN(date.getTime())) return;
      const bucket = months.find(
        (month) =>
          month.year === date.getFullYear() && month.month === date.getMonth(),
      );
      if (bucket) bucket.count += 1;
    });

    const max = Math.max(1, ...months.map((month) => month.count));
    const chart = byId("quoteChart");
    chart.replaceChildren();
    months.forEach((month, index) => {
      const column = element("div", "chart-month");
      const track = element("div", "chart-bar-track");
      const bar = element(
        "div",
        `chart-bar${index === months.length - 1 ? " is-current" : ""}`,
      );
      const height =
        month.count === 0 ? 5 : Math.max(10, (month.count / max) * 100);
      bar.style.height = `${height}%`;
      bar.title = `${month.count} ${month.count === 1 ? "request" : "requests"}`;
      bar.setAttribute(
        "aria-label",
        `${month.label}: ${month.count} ${month.count === 1 ? "request" : "requests"}`,
      );
      track.append(bar);
      column.append(track, element("small", "", month.label));
      chart.append(column);
    });
  }

  function renderStatusSummary() {
    const counts = new Map(QUOTATION_STATUSES.map((status) => [status, 0]));
    state.quotations.forEach((item) =>
      counts.set(item.status, (counts.get(item.status) || 0) + 1),
    );
    const total = Math.max(1, state.quotations.length);
    const summary = byId("statusSummary");
    summary.replaceChildren();
    QUOTATION_STATUSES.forEach((status) => {
      const line = element("div", "status-line");
      const track = element("div", "status-track");
      const fill = element("div", "status-fill");
      fill.style.width = `${(counts.get(status) / total) * 100}%`;
      track.append(fill);
      line.append(
        element("span", "", readableStatus(status)),
        track,
        element("span", "status-number", counts.get(status)),
      );
      summary.append(line);
    });
  }

  function renderRecentInquiries() {
    const body = byId("recentInquiries");
    body.replaceChildren();
    const recent = [...state.inquiries].slice(0, 5);
    recent.forEach((item) => {
      const row = document.createElement("tr");
      row.append(
        createCell(contactCell(item)),
        createCell(
          element("span", "table-clip", item.subject || "General inquiry"),
        ),
        createCell(dateLabel(item.created_at), "table-date"),
        createCell(statusPill(item.status)),
        createCell(createRowAction("inquiry", item.id, "View inquiry")),
      );
      body.append(row);
    });
    if (recent.length === 0) {
      const row = document.createElement("tr");
      const cell = createCell("No customer inquiries yet.");
      cell.colSpan = 5;
      cell.className = "empty-table-cell";
      row.append(cell);
      body.append(row);
    }
  }

  function matchesFilters(item, search, status, fields) {
    const query = search.trim().toLocaleLowerCase();
    const matchesSearch =
      !query ||
      fields.some((field) =>
        String(item[field] || "")
          .toLocaleLowerCase()
          .includes(query),
      );
    return matchesSearch && (status === "all" || item.status === status);
  }

  function renderInquiries() {
    const search = byId("inquirySearch").value;
    const status = byId("inquiryStatusFilter").value;
    const matches = state.inquiries.filter((item) =>
      matchesFilters(item, search, status, [
        "contact_person",
        "organization_name",
        "email",
        "subject",
        "message",
      ]),
    );
    const body = byId("inquiriesTable");
    body.replaceChildren();
    matches.forEach((item) => {
      const row = document.createElement("tr");
      row.append(
        createCell(contactCell(item)),
        createCell(
          element("span", "table-clip", item.subject || "General inquiry"),
        ),
        createCell(element("span", "table-clip", item.message || "")),
        createCell(dateLabel(item.created_at), "table-date"),
        createCell(statusPill(item.status)),
        createCell(createRowAction("inquiry", item.id, "View inquiry")),
      );
      body.append(row);
    });
    byId("inquiriesEmpty").hidden = matches.length !== 0;
    byId("inquiriesTable").closest(".table-wrap").hidden = matches.length === 0;
  }

  function renderQuotations() {
    const search = byId("quotationSearch").value;
    const status = byId("quotationStatusFilter").value;
    const matches = state.quotations.filter((item) =>
      matchesFilters(item, search, status, [
        "contact_person",
        "organization_name",
        "email",
        "product_service",
        "requirement_type",
        "tender_lpo_reference",
      ]),
    );
    const body = byId("quotationsTable");
    body.replaceChildren();
    matches.forEach((item) => {
      const row = document.createElement("tr");
      const editor = element("div", "status-editor");
      const select = document.createElement("select");
      select.setAttribute("aria-label", `Status for request ${item.id}`);
      QUOTATION_STATUSES.forEach((value) => {
        const option = element("option", "", readableStatus(value));
        option.value = value;
        option.selected = item.status === value;
        select.append(option);
      });
      const save = element("button", "status-save");
      save.type = "button";
      save.dataset.action = "save-status";
      save.dataset.id = String(item.id);
      save.setAttribute("aria-label", `Save status for request ${item.id}`);
      save.title = "Save status";
      save.append(element("i", "bi bi-check2"));
      editor.append(select, save);
      const detail = createRowAction("quotation", item.id, "View request");
      row.append(
        createCell(contactCell(item)),
        createCell(element("span", "table-clip", item.product_service || "—")),
        createCell(item.requirement_type || "Quotation"),
        createCell(dateLabel(item.created_at), "table-date"),
        createCell(editor),
        createCell(detail),
      );
      body.append(row);
    });
    byId("quotationsEmpty").hidden = matches.length !== 0;
    byId("quotationsTable").closest(".table-wrap").hidden =
      matches.length === 0;
  }

  function renderCatalogueList(type) {
    const isProduct = type === "products";
    const records = isProduct ? state.products : state.services;
    const list = byId(isProduct ? "productList" : "serviceList");
    const empty = byId(isProduct ? "productsEmpty" : "servicesEmpty");
    const counter = byId(isProduct ? "productListCount" : "serviceListCount");
    list.replaceChildren();
    counter.textContent = `${records.length} ${records.length === 1 ? "item" : "items"}`;
    empty.hidden = records.length !== 0;
    records.forEach((item) => {
      const row = element("div", "catalogue-item");
      const icon = element("span", "catalogue-item-icon");
      icon.append(
        element("i", isProduct ? "bi bi-box-seam" : "bi bi-briefcase"),
      );
      const description = isProduct
        ? item.category || item.description || "Product"
        : item.description || "Company service";
      const main = element("div", "catalogue-item-main");
      main.append(
        element("strong", "", item.name),
        element("span", "", description),
      );
      const remove = element("button", "delete-button", "Remove");
      remove.type = "button";
      remove.dataset.action = `delete-${type}`;
      remove.dataset.id = String(item.id);
      remove.append(element("i", "bi bi-trash"));
      row.append(icon, main, remove);
      list.append(row);
    });
  }

  function renderAll() {
    renderMetrics();
    renderChart();
    renderStatusSummary();
    renderRecentInquiries();
    renderInquiries();
    renderQuotations();
    renderCatalogueList("products");
    renderCatalogueList("services");
    showNotice("");
  }

  function setView(view) {
    state.view = view;
    document.querySelectorAll(".view-section").forEach((section) => {
      section.hidden = section.id !== `view-${view}`;
    });
    document.querySelectorAll(".nav-item").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.view === view);
    });
    const names = {
      overview: "Overview",
      inquiries: "Inquiries",
      quotations: "Quote requests",
      catalogue: "Catalogue",
    };
    byId("currentPage").textContent = names[view] || "Overview";
    closeSidebar();
  }

  function setCatalogueTab(tab) {
    state.catalogueTab = tab;
    const isProducts = tab === "products";
    byId("productsCatalogue").hidden = !isProducts;
    byId("servicesCatalogue").hidden = isProducts;
    document.querySelectorAll(".catalogue-tab").forEach((button) => {
      const active = button.dataset.catalogueTab === tab;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
    });
  }

  function showDetails(record, kind) {
    const isQuotation = kind === "quotation";
    byId("dialogEyebrow").textContent = isQuotation
      ? `QUOTE REQUEST #${record.id}`
      : `INQUIRY #${record.id}`;
    byId("dialogTitle").textContent = isQuotation
      ? record.product_service || "Quote request"
      : record.subject || "General inquiry";
    const details = byId("dialogDetails");
    details.replaceChildren();
    const entries = isQuotation
      ? [
          ["Customer", record.contact_person],
          ["Organization", record.organization_name],
          ["Email", record.email],
          ["Phone", record.phone],
          ["Requirement type", record.requirement_type],
          ["Quantity", record.quantity],
          ["Delivery location", record.delivery_location],
          ["Required by", record.required_delivery_date],
          ["Tender / LPO reference", record.tender_lpo_reference],
          ["Status", readableStatus(record.status)],
          ["Received", dateLabel(record.created_at)],
          ["Additional requirements", record.additional_requirements],
        ]
      : [
          ["Contact", record.contact_person],
          ["Organization", record.organization_name],
          ["Email", record.email],
          ["Phone", record.phone],
          ["Status", readableStatus(record.status)],
          ["Received", dateLabel(record.created_at)],
          ["Message", record.message],
        ];

    entries.forEach(([label, value]) => {
      if (!value) return;
      details.append(element("dt", "", label), element("dd", "", value));
    });
    detailDialog.showModal();
  }

  async function handleStatusSave(button) {
    const id = button.dataset.id;
    const select = button.parentElement.querySelector("select");
    button.disabled = true;
    try {
      await request(`/api/quotations/${encodeURIComponent(id)}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: select.value }),
      });
      const item = state.quotations.find((record) => String(record.id) === id);
      if (item) item.status = select.value;
      renderMetrics();
      renderStatusSummary();
      renderQuotations();
      showNotice(`Request #${id} updated to ${readableStatus(select.value)}.`);
    } catch (error) {
      if (error.status === 401)
        return showLogin("Your session has expired. Please sign in again.");
      showNotice(error.message, true);
      button.disabled = false;
    }
  }

  async function handleDelete(button, type) {
    const isProduct = type === "products";
    const records = isProduct ? state.products : state.services;
    const item = records.find(
      (record) => String(record.id) === button.dataset.id,
    );
    if (
      !item ||
      !window.confirm(`Remove “${item.name}” from the public catalogue?`)
    )
      return;
    button.disabled = true;
    try {
      await request(`/api/${type}/${encodeURIComponent(item.id)}`, {
        method: "DELETE",
      });
      if (isProduct)
        state.products = state.products.filter(
          (record) => String(record.id) !== String(item.id),
        );
      else
        state.services = state.services.filter(
          (record) => String(record.id) !== String(item.id),
        );
      renderMetrics();
      renderCatalogueList(type);
      showNotice(`${item.name} has been removed from the catalogue.`);
    } catch (error) {
      if (error.status === 401)
        return showLogin("Your session has expired. Please sign in again.");
      showNotice(error.message, true);
      button.disabled = false;
    }
  }

  function formValues(form) {
    return Object.fromEntries(new FormData(form).entries());
  }

  async function handleCatalogueSubmit(form, type) {
    const isProduct = type === "products";
    const feedback = byId(isProduct ? "productFeedback" : "serviceFeedback");
    const submit = form.querySelector('button[type="submit"]');
    const values = formValues(form);
    const payload = isProduct
      ? {
          name: values.name.trim(),
          category_id: values.category_id ? Number(values.category_id) : null,
          description: values.description.trim() || null,
          specifications: values.specifications.trim() || null,
          image: values.image.trim() || null,
        }
      : {
          name: values.name.trim(),
          description: values.description.trim() || null,
          image: values.image.trim() || null,
        };
    feedback.textContent = "";
    feedback.classList.remove("is-error");
    submit.disabled = true;
    try {
      await request(`/api/${type}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const result = await request(`/api/${type}`);
      if (isProduct) state.products = result.data || [];
      else state.services = result.data || [];
      form.reset();
      renderMetrics();
      renderCatalogueList(type);
      feedback.textContent = `${isProduct ? "Product" : "Service"} added successfully.`;
    } catch (error) {
      if (error.status === 401)
        return showLogin("Your session has expired. Please sign in again.");
      feedback.textContent = error.message;
      feedback.classList.add("is-error");
    } finally {
      submit.disabled = false;
    }
  }

  function closeSidebar() {
    byId("sidebar").classList.remove("is-open");
    byId("sidebarScrim").classList.remove("is-open");
    byId("menuToggle").setAttribute("aria-expanded", "false");
  }

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const key = byId("adminKey").value.trim();
    if (!key) return;
    loginError.hidden = true;
    loginSubmit.disabled = true;
    loginSubmit.querySelector("span").textContent = "Signing in…";
    try {
      await loadData(key);
      loginForm.reset();
    } catch (error) {
      loginError.textContent =
        error.status === 401
          ? "That administrator key was not accepted."
          : error.message;
      loginError.hidden = false;
    } finally {
      loginSubmit.disabled = false;
      loginSubmit.querySelector("span").textContent = "Sign in";
    }
  });

  document.addEventListener("click", (event) => {
    const viewButton = event.target.closest("[data-view]");
    if (viewButton) return setView(viewButton.dataset.view);

    const tab = event.target.closest("[data-catalogue-tab]");
    if (tab) return setCatalogueTab(tab.dataset.catalogueTab);

    const action = event.target.closest("[data-action]");
    if (!action) return;
    if (action.dataset.action === "inquiry") {
      const item = state.inquiries.find(
        (record) => String(record.id) === action.dataset.id,
      );
      if (item) showDetails(item, "inquiry");
    } else if (action.dataset.action === "quotation") {
      const item = state.quotations.find(
        (record) => String(record.id) === action.dataset.id,
      );
      if (item) showDetails(item, "quotation");
    } else if (action.dataset.action === "save-status") {
      handleStatusSave(action);
    } else if (action.dataset.action === "delete-products") {
      handleDelete(action, "products");
    } else if (action.dataset.action === "delete-services") {
      handleDelete(action, "services");
    }
  });

  byId("inquirySearch").addEventListener("input", renderInquiries);
  byId("inquiryStatusFilter").addEventListener("change", renderInquiries);
  byId("quotationSearch").addEventListener("input", renderQuotations);
  byId("quotationStatusFilter").addEventListener("change", renderQuotations);
  byId("productForm").addEventListener("submit", (event) => {
    event.preventDefault();
    handleCatalogueSubmit(event.currentTarget, "products");
  });
  byId("serviceForm").addEventListener("submit", (event) => {
    event.preventDefault();
    handleCatalogueSubmit(event.currentTarget, "services");
  });
  byId("refreshButton").addEventListener("click", async () => {
    byId("refreshButton").disabled = true;
    try {
      await loadData(state.apiKey);
      showNotice("Dashboard data refreshed.");
    } catch (error) {
      if (error.status === 401)
        return showLogin("Your session has expired. Please sign in again.");
      showNotice(error.message, true);
    } finally {
      byId("refreshButton").disabled = false;
    }
  });
  byId("signOutButton").addEventListener("click", () => showLogin());
  byId("closeDialog").addEventListener("click", () => detailDialog.close());
  byId("dialogDone").addEventListener("click", () => detailDialog.close());
  byId("menuToggle").addEventListener("click", () => {
    const isOpen = byId("sidebar").classList.toggle("is-open");
    byId("sidebarScrim").classList.toggle("is-open", isOpen);
    byId("menuToggle").setAttribute("aria-expanded", String(isOpen));
  });
  byId("sidebarScrim").addEventListener("click", closeSidebar);

  const existingKey = sessionStorage.getItem(API_KEY_STORAGE);
  if (existingKey) {
    loadData(existingKey).catch((error) => {
      if (error.status === 401) {
        showLogin("Your session has expired. Please sign in again.");
      } else {
        showLogin(error.message);
      }
    });
  } else {
    byId("adminKey").focus();
  }
})();
