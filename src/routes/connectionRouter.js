const express = require("express");
const router = express.Router();
const handleRequest = require("../utils/requestHandler");

router.post("/add-connection", handleRequest("connection", "addConnection"));
router.post("/remove-connection", handleRequest("connection", "removeConnection"));
router.get("/connections", handleRequest("connection", "getConnections"));
router.get("/disconnected-users", handleRequest("connection", "getDisconnectedUsers"));
router.get("/users", handleRequest("connection", "getAllUsers"));

module.exports = router;