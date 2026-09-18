const serviceModel = require("../models/serviceModel");

// Get all services
const getServices = async (req, res) => {
  try {
    const services = await serviceModel.getAllServices();

    res.json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    console.error("Error fetching services:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch services",
    });
  }
};

// Get one service
const getService = async (req, res) => {
  try {
    const service = await serviceModel.getServiceById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.json({
      success: true,
      data: service,
    });
  } catch (error) {
    console.error("Error fetching service:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch service",
    });
  }
};

// Create service
const addService = async (req, res) => {
  try {
    const { name, description, image } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Service name is required",
      });
    }

    const serviceId = await serviceModel.createService({
      name,
      description,
      image,
    });

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      serviceId,
    });
  } catch (error) {
    console.error("Error creating service:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create service",
    });
  }
};

// Delete service
const removeService = async (req, res) => {
  try {
    const deleted = await serviceModel.deleteService(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting service:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete service",
    });
  }
};

module.exports = {
  getServices,
  getService,
  addService,
  removeService,
};
