const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const { sequelize } = require("./config/database");
const routes = require("./routes");
const { errorHandler } = require("./middleware/error.handler");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api", routes);

// health
app.get("/health", (req, res) => res.json({ status: "ok" }));

// error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

sequelize.authenticate()
  .then(() => console.log("Database connected"))
  .then(() => sequelize.sync({ force: false }))
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Unable to start server:", err);
    process.exit(1);
  });