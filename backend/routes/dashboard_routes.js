const express = require("express");
const router = express.Router();
const DashboardController = require("../controllers/dashboard_controller");
const { protegerRuta } = require("../middlewares/auth_middleware");

// Todos pueden ver el dashboard principal
router.get("/", protegerRuta, DashboardController.obtenerDashboard);

module.exports = router;
