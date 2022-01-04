const express = require("express");
const router = express.Router();
const handleRequest = require("../utils/requestHandler");

router.post("/sign-up", handleRequest("auth", "signUp"));
router.post("/sign-in", handleRequest("auth", "signIn"));
router.post("/update-profile", handleRequest("auth", "updateProfile"));
router.get("/profile", handleRequest("auth", "getProfile"));
router.get("/sign-out", handleRequest("auth", "logout"));

module.exports = router;
