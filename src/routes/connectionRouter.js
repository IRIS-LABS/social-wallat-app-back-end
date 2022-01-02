const express = require("express");
const router = express.Router();
const handleRequest = require("../utils/requestHandler");

router.post("/add-connection", handleRequest("connection", "addConnection"));
router.get("/connections", handleRequest("connection", "getConnections"));
router.get("/users", handleRequest("connection", "getAllUsers"));

module.exports = router;