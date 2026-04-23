const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard_controller");
const { protegerRuta } = require("../middlewares/auth_middleware");

router.use(protegerRuta);

router.get("/", dashboardController.obtenerDashboard);

module.exports = router;
