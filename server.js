const express = require("express");
const fetch = require("node-fetch");
const app = express();

app.use(express.json({ limit: "20mb" }));
app.use(express.static("public"));

function escapeUnicode(str) {
  return str.replace(/[^\x00-\x7F]/g, function(c) {
    return "\\u" + ("0000" + c.charCodeAt(0).toString(16)).slice(-4);
  });
}

app.get("/api/football/:endpoint(*)", async (req, res) => {
  try {
    const url = new URL("https://api.football-data.org/v4/" + req.params.endpoint);
    Object.entries(req.query).forEach(([k, v]) => url.searchParams.append(k, v));
    const response = await fetch(url.toString(), {
      headers: { "X-Auth-Token": req.headers["x-football-key"] || "" }
    });
    const text = await response.text();
    try {
      res.json(JSON.parse(text));
    } catch(e) {
      res.status(response.status).json({ error: text, errorCode: response.status });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/football/:endpoint(*)", async (req, res) => {
  try {
    const url = new URL("https://api.football-data.org/v4/" + req.params.endpoint);
    Object.entries(req.query).forEach(([k, v]) => url.searchParams.append(k, v));
    const response = await fetch(url.toString(), {
      headers: { "X-Auth-Token": req.headers["x-football-key"] || "" }
    });
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server pornit pe portul " + PORT));
