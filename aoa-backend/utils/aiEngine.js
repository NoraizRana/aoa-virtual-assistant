const { spawn } = require("child_process");
const path      = require("path");

const SEARCH_SCRIPT = path.join(__dirname, "../model/search.py");

const findAnswer = (query) => {
  return new Promise((resolve) => {
    console.log(`🔍 Searching for: "${query}"`);

    const py  = spawn("py", [SEARCH_SCRIPT, query]);
    let   out = "";
    let   err = "";

    py.stdout.on("data", d => { out += d.toString(); });
    py.stderr.on("data", d => { err += d.toString(); });

    py.on("close", (code) => {
      try {
        // Extract JSON from output
        const start   = out.indexOf("[");
        const end     = out.lastIndexOf("]");
        if (start !== -1 && end !== -1) {
          const results = JSON.parse(out.substring(start, end + 1));
          if (results.length > 0) {
            console.log(`✅ Best match: "${results[0].topic}" (score: ${results[0].score})`);
            resolve({ found: true, data: results[0], alternatives: results.slice(1) });
          } else {
            resolve({ found: false });
          }
        } else {
          resolve({ found: false });
        }
      } catch (e) {
        console.log("⚠️  Search error:", e.message);
        resolve({ found: false });
      }
    });

    // Timeout after 8 seconds
    setTimeout(() => {
      py.kill();
      resolve({ found: false });
    }, 8000);
  });
};

module.exports = { findAnswer };