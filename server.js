const express = require("express");
const fs = require("fs");

const app = express(); // Create an Express app

app.use(express.json()); // Middleware to parse JSON bodies

app.use((req, res, next) => {
    // Set CORS headers for all responses
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === "OPTIONS") {
        // Handle preflight request
        res.writeHead(204);
        res.end();
        return;
    }
    next(); // Call the next middleware
});

app.get("/", (req, res) => {
    res.end("Hello from the home side");
});

// Add your routes here (userapi handling)
app.get("/userapi", (req, res) => {
    fs.readFile(`${__dirname}/UserApi/userapi.json`, "utf-8", (err, data) => {
        if (err) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Failed to read data" }));
            return;
        }
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(data);
    });
});

// Add other routes (POST, PUT, DELETE)

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
