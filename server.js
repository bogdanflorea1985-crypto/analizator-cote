const express = require("express");
const fetch = require("node-fetch");
const app = express();

app.use(express.json({ limit: "20mb" }));
app.use(express.static("public"));

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
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/football/:endpoint(*)", async (req, res) => {
  try {
    const url = new URL("https://v3.football.api-sports.io/" + req.params.endpoint);
    Object.entries(req.query).forEach(([k, v]) => url.searchParams.append(k, v));
    const response = await fetch(url.toString(), {
      headers: { "x-apisports-key": req.headers["x-football-key"] || "" }
    });
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server pornit pe portul " + PORT));
