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
    
    // Extract and clean the text content
    if (data.content) {
      data.content = data.content.map(block => {
        if (block.type === "text") {
          // Find JSON in the text and re-serialize it cleanly
          const text = block.text;
          const start = text.indexOf("{");
          const end = text.lastIndexOf("}");
          if (start >= 0 && end >= 0) {
            const jsonStr = text.slice(start, end + 1);
            try {
              // Parse and re-serialize to get clean JSON
              const parsed = JSON.parse(jsonStr);
              block.text = JSON.stringify(parsed);
            } catch(e) {
              // If parsing fails, clean special chars and try again
              const clean = jsonStr
                .replace(/[\u0080-\uFFFF]/g, c => c.normalize ? c : "?")
                .replace(/,(\s*[}\]])/g, "$1")
                .replace(/([{,]\s*)(['"])?([a-zA-Z_][a-zA-Z0-9_]*)(['"])?\s*:/g, '$1"$3":');
              try {
                const parsed2 = JSON.parse(clean);
                block.text = JSON.stringify(parsed2);
              } catch(e2) {
                block.text = jsonStr;
              }
            }
          }
        }
        return block;
      });
    }
    
    res.json(data);
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
