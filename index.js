const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const SECRET_KEY = "api-gateway-test-secret";

// CORS: Allow all origins
app.use(cors());

// Body parser
app.use(express.json());

// Logging: Log all incoming requests (method, url, headers, body)
// API Gateway Note: Test if the Gateway correctly forwards these fields
// app.use(
//   morgan((tokens, req, res) => {
//     return [
//       tokens.method(req, res),
//       tokens.url(req, res),
//       "Headers:",
//       JSON.stringify(req.headers),
//       "Body:",
//       JSON.stringify(req.body),
//     ].join(" ");
//   }),
// );

// 1. Access log (ngắn gọn)

app.use(morgan("combined"));

// 2. Debug request (chi tiết)

app.use((req, res, next) => {
  console.log("\n===== REQUEST START =====");

  console.log("Method:", req.method);

  console.log("Original URL:", req.originalUrl);

  console.log("Base URL:", req.baseUrl);

  console.log("Path:", req.path);

  console.log("Query:", req.query);

  console.log("Headers:", req.headers);

  console.log("Body:", req.body);

  console.log("IP:", req.ip);

  console.log("X-Forwarded-For:", req.headers["x-forwarded-for"]);

  console.log("===== REQUEST END =====");

  next();
});

// 3. Debug response (rất hữu ích khi bị 404/500)

app.use((req, res, next) => {
  const oldSend = res.send;

  res.send = function (data) {
    console.log("----- RESPONSE START -----");

    console.log("Status:", res.statusCode);

    console.log("Response Body:", data);

    console.log("----- RESPONSE END -----\n");

    return oldSend.apply(res, arguments);
  };

  next();
});

const swaggerDocument = JSON.parse(
  fs.readFileSync(path.join(__dirname, "swagger.json"), "utf8"),
);

// Swagger UI at /docs
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Endpoint trả về file swagger.json (dùng để import vào API Gateway)
app.get("/swagger.json", (req, res) => {
  res.json(swaggerDocument);
});

// 1. Basic APIs (no auth)
// API Gateway Note: Test GET forwarding and query param preservation here
app.get("/test", (req, res) => {
  res.json({
    method: req.method,
    query: req.query,
    headers: req.headers,
  });
});

// API Gateway Note: Test POST body forwarding here
app.post("/test", (req, res) => {
  res.json({
    method: req.method,
    body: req.body,
    headers: req.headers,
  });
});

// 2. Auth flow (JWT)
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "123456") {
    const token = jwt.sign({ user: "admin", role: "tester" }, SECRET_KEY, {
      expiresIn: "1h",
    });
    res.json({ token });
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
});

/**
 * JWT Middleware
 * API Gateway Note: Test Authorization header forwarding here
 */
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    // API Gateway Note: Validate JWT is correctly passed from frontend through Gateway
    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) return res.sendStatus(403);
      // API Gateway Note: JWT is decoded here to extract user info
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// 3. Protected APIs
// API Gateway Note: Verify this endpoint remains protected behind Gateway
app.get("/profile", authenticateJWT, (req, res) => {
  res.json({
    user: req.user.user,
    role: req.user.role,
  });
});

app.post("/booking", authenticateJWT, (req, res) => {
  res.json({
    decoded_user: req.user,
    body: req.body,
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running locally at http://localhost:${PORT}`);
  console.log(`Accessible from internet if using a tunnel (e.g., ngrok)`);
  console.log(`Swagger UI: http://localhost:${PORT}/docs`);
});
