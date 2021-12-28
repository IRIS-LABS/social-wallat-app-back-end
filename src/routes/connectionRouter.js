const express = require("express");
const router = express.Router();
const handleRequest = require("../utils/requestHandler");

router.post("/add-connection", handleRequest("connection", "addConnection"));
router.get("/connections", handleRequest("connection", "getConnections"));

module.exports = router;