const express = require("express");
const router = express.Router();
const handleImageUpload = require("../utils/imageUploadHandler");
const handleRequest = require("../utils/requestHandler");

router.post("/sign-up", handleRequest("auth", "signUp"));
router.post("/sign-in", handleRequest("auth", "signIn"));
router.post("/update-profile", handleRequest("auth", "updateProfile"));
router.post("/upload-profile-picture", handleRequest("auth", "uploadProfilePicture"), handleImageUpload("avatar"));
router.get("/profile", handleRequest("auth", "getProfile"));
router.get("/sign-out", handleRequest("auth", "logout"));

module.exports = router;
