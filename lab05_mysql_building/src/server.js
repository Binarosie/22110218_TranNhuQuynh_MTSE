const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const { sequelize } = require("./config/database");
const routes = require("./routes");
const { errorHandler } = require("./middleware/error.handler");
const { apiLimiter } = require("./middleware/rateLimit");
const { cleanupExpiredTokens } = require("./utils/tokenCleanup");

const app = express();

// CORS must be before helmet
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"], // Frontend origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet({
  crossOriginResourcePolicy: false
}));

app.use(express.json());
app.use(morgan("dev"));

// Apply rate limiting to all API routes
app.use("/api", apiLimiter);
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
    
    // Clean up expired tokens every 24 hours
    setInterval(() => {
      cleanupExpiredTokens().catch(err => 
        console.error('Token cleanup failed:', err)
      );
    }, 24 * 60 * 60 * 1000);
    
    // Run cleanup on startup
    cleanupExpiredTokens().catch(err => 
      console.error('Initial token cleanup failed:', err)
    );
  })
  .catch((err) => {
    console.error("Unable to start server:", err);
    process.exit(1);
  });