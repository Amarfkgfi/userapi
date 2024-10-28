const http = require("http");
const fs = require("fs");

const server = http.createServer((req, res) => {
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

    if (req.url === "/") {
        res.end("Hello from the home side");
    
    } else if (req.url === "/userapi") {
        if (req.method === "GET") {
            fs.readFile(`${__dirname}/UserApi/userapi.json`, "utf-8", (err, data) => {
                if (err) {
                    res.writeHead(500, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ error: "Failed to read data" }));
                    return;
                }
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(data);
            });
        } else if (req.method === "POST") {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString(); // Convert Buffer to string
            });

            req.on('end', () => {
                const newUser = JSON.parse(body);

                fs.readFile(`${__dirname}/UserApi/userapi.json`, "utf-8", (err, data) => {
                    if (err) {
                        res.writeHead(500, { "Content-Type": "application/json" });
                        res.end(JSON.stringify({ error: "Failed to read data" }));
                        return;
                    }

                    const users = JSON.parse(data);
                    const newId = users.length ? (parseInt(users[users.length - 1].id) + 1).toString() : "1"; // Use string ID
                    const userToAdd = { id: newId, ...newUser };
                    users.push(userToAdd);

                    fs.writeFile(`${__dirname}/UserApi/userapi.json`, JSON.stringify(users, null, 2), err => {
                        if (err) {
                            res.writeHead(500, { "Content-Type": "application/json" });
                            res.end(JSON.stringify({ error: "Failed to save data" }));
                            return;
                        }
                        res.writeHead(201, { "Content-Type": "application/json" });
                        res.end(JSON.stringify({ message: "User added successfully!", user: userToAdd }));
                    });
                });
            });
        } else if (req.method === "PUT") {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString(); // Convert Buffer to string
            });

            req.on('end', async () => {
                try {
                    const updatedUser = JSON.parse(body);

                    if (!updatedUser.id) {
                        res.writeHead(400, { "Content-Type": "application/json" });
                        res.end(JSON.stringify({ error: "User ID is required for update" }));
                        return;
                    }

                    const data = await fs.promises.readFile(`${__dirname}/UserApi/userapi.json`, "utf-8");
                    const users = JSON.parse(data);

                    const userIndex = users.findIndex(user => user.id === updatedUser.id);
                    if (userIndex === -1) {
                        res.writeHead(404, { "Content-Type": "application/json" });
                        res.end(JSON.stringify({ error: "User not found" }));
                        return;
                    }

                    users[userIndex] = { ...users[userIndex], ...updatedUser };

                    await fs.promises.writeFile(`${__dirname}/UserApi/userapi.json`, JSON.stringify(users, null, 2));

                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ message: "User updated successfully!", user: users[userIndex] }));

                } catch (error) {
                    console.error("Error updating user:", error);
                    res.writeHead(500, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ error: "Failed to update data" }));
                }
            });
        } 
        else if (req.method === "DELETE") {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
        
            req.on('end', async () => {
                try {
                    const { id } = JSON.parse(body); // Extract ID from request body
                    if (!id) {
                        res.writeHead(400, { "Content-Type": "application/json" });
                        res.end(JSON.stringify({ error: "User ID is required for deletion" }));
                        return;
                    }
        
                    const data = await fs.promises.readFile(`${__dirname}/UserApi/userapi.json`, "utf-8");
                    const users = JSON.parse(data);
        
                    // Filter out users with the given id
                    const updatedUsers = users.filter(user => user.id !== id);
        
                    if (updatedUsers.length === users.length) {
                        res.writeHead(404, { "Content-Type": "application/json" });
                        res.end(JSON.stringify({ error: "User not found or ID is invalid" }));
                        return;
                    }
        
                    await fs.promises.writeFile(`${__dirname}/UserApi/userapi.json`, JSON.stringify(updatedUsers, null, 2));
        
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ message: "User deleted successfully" }));
                } catch (error) {
                    console.error("Error deleting user:", error); // Log error on server
                    res.writeHead(500, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ error: "Failed to delete data" }));
                }
            });
        }
        
        
    }else if (req.url.startsWith("/userapi/") && req.method === "GET") {
        const userId = req.url.split("/").pop(); // Extract ID from the URL
        fs.readFile(`${__dirname}/UserApi/userapi.json`, "utf-8", (err, data) => {
            if (err) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Failed to read data" }));
                return;
            }

            const users = JSON.parse(data);
            const user = users.find(user => user.id.toString() === userId); // Ensure type matches

            if (!user) {
                res.writeHead(404, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "User not found" }));
                return;
            }

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(user));
        });
    }
     
    else {
        res.writeHead(404, { "Content-Type": "text/html" });
        res.end("<h1>404 error: Page doesn't exist</h1>");
    }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
