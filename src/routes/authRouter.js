const express = require("express");
const router = express.Router();
const handleRequest = require("../utils/requestHandler");

router.post("/sign-up", handleRequest("auth", "signUp"));

module.exports = router;
