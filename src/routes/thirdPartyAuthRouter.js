const express = require("express");
const router = express.Router();
const config = require("config");
const { passport } = require("../controllers/thirdPartyAuth");
const handleRequest = require("../utils/requestHandler");

router.use(passport.initialize());

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${config.get("FRONTEND_URL")}/error?code=#2112261`,
    session: false,
  }),
  handleRequest("thirdPartyAuth", "googleCallback")
);

router.get("/verify", handleRequest("thirdPartyAuth", "verify"));

router.get(
  "/partial-user-data",
  handleRequest("thirdPartyAuth", "getPartialUserData")
);

router.post(
  "/complete-user-profile",
  handleRequest("thirdPartyAuth", "completeUserProfile")
);

module.exports = router;
