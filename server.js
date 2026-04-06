const express = require("express");
const fetch = require("node-fetch");
const app = express();

app.use(express.json({ limit: "20mb" }));
app.use(express.static("public"));

// Proxy Claude
app.post("/api/claude", async (req, res) => {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": req.headers["x-claude-key"] || "",
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify(req.body)
    });
    const rawText = await response.text();
    const escaped = rawText.replace(/[^\x00-\x7F]/g, function(c) {
      return "\\u" + ("0000" + c.charCodeAt(0).toString(16)).slice(-4);
    });
    res.json(JSON.parse(escaped));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Proxy football-data.org (pentru gasit echipe din liga)
app.get("/api/fd/:endpoint(*)", async (req, res) => {
  try {
    const url = new URL("https://api.football-data.org/v4/" + req.params.endpoint);
    Object.entries(req.query).forEach(([k, v]) => url.searchParams.append(k, v));
    const response = await fetch(url.toString(), {
      headers: { "X-Auth-Token": req.headers["x-fd-key"] || "" }
    });
    const text = await response.text();
    try { res.json(JSON.parse(text)); }
    catch(e) { res.status(response.status).json({ error: text }); }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Proxy api-football.com (pentru statistici)
app.get("/api/af/:endpoint(*)", async (req, res) => {
  try {
    const url = new URL("https://v3.football.api-sports.io/" + req.params.endpoint);
    Object.entries(req.query).forEach(([k, v]) => url.searchParams.append(k, v));
    const response = await fetch(url.toString(), {
      headers: { "x-apisports-key": req.headers["x-af-key"] || "" }
    });
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server pornit pe portul " + PORT));
