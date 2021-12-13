const express = require("express");
const config = require("config");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();

var corsOptions = {
  origin: config.get("FRONTEND_URL"),
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser(config.get("COOKIE_SECRET")));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

//Routers
const exampleRouter = require("./routes/exampleRouter");

app.get("/", (req, res) => {
  res.status(200).send("Server is ok!");
});

app.use("/api/example", exampleRouter);

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Server is listening in ${port}`);
});
