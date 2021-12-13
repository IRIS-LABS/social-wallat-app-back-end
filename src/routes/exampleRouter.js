const express = require("express");
const router = express.Router();
const handleRequest = require("../utils/requestHandler");

router.get("/example", handleRequest("example", "example"));

module.exports = router;
