const customerModel = require("../models/customerModel");
const authService = require("../services/authService");

function sanitizeCustomer(customer) {
  if (!customer) {
    return null;
  }

  return {
    id: customer.id,
    name: customer.contact_person || customer.name || "Customer",
    email: customer.email,
    company: customer.organization_name || "",
    role: "customer",
  };
}

async function signupCustomer(req, res) {
  try {
    const name = String(req.body.name || "").trim();
    const company = String(req.body.company || "").trim();
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();
    const password = String(req.body.password || "").trim();

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    const existingCustomer = await customerModel.getCustomerByEmail(email);
    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: "An account with that email already exists.",
      });
    }

    const { hash } = await authService.hashPassword(password);
    const customerId = await customerModel.createCustomer({
      organization_name: company,
      contact_person: name,
      email,
      phone: "",
      address: "",
      password_hash: hash,
    });

    const user = sanitizeCustomer({
      id: customerId,
      contact_person: name,
      organization_name: company,
      email,
    });

    const token = authService.generateCustomerToken(user);

    return res.status(201).json({
      success: true,
      message: "Customer account created successfully.",
      token,
      user,
    });
  } catch (error) {
    console.error("Customer signup error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to create the customer account right now.",
    });
  }
}

async function loginCustomer(req, res) {
  try {
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();
    const password = String(req.body.password || "").trim();

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const customer = await customerModel.getCustomerByEmail(email);
    if (!customer || !customer.password_hash) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isValid = await authService.comparePassword(
      password,
      customer.password_hash,
    );
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const user = sanitizeCustomer(customer);
    const token = authService.generateCustomerToken(user);

    return res.json({
      success: true,
      message: "Login successful.",
      token,
      user,
    });
  } catch (error) {
    console.error("Customer login error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to log in at the moment.",
    });
  }
}

async function getCurrentCustomer(req, res) {
  try {
    const customer = await customerModel.getCustomerById(req.user.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    return res.json({
      success: true,
      user: sanitizeCustomer(customer),
    });
  } catch (error) {
    console.error("Customer profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load the customer profile.",
    });
  }
}

module.exports = {
  signupCustomer,
  loginCustomer,
  getCurrentCustomer,
};
