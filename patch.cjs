const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

// Fix the extra closing brace in /api/notify-order
code = code.replace(
  `        }
      }
      
      const adminMailOptions = {`,
  `        }
      
      const adminMailOptions = {`
);

// Fix the logic in /api/notify-order-status (around line 453)
code = code.replace(
  /let assaxResult = null;\n      if \(status === 'completed'[\s\S]*?\} catch \(hgError\) \{\n          console\.error\("HankGames Automation Error:", hgError\);\n        \}\n      \}/,
  `let assaxResult = null;
      if (status === 'completed' && (process.env.ASSAX_API_KEY || true)) {
        try {
          console.log("Procesando recarga con Assax Store (estado completado)...");
          // TODO: IMPLEMENT ASSAX STORE TOP-UP
          assaxResult = { success: true, message: "Mock Assax Top-up Success" };
        } catch (err) {
          console.error("Assax Automation Error:", err);
          assaxResult = { error: String(err) };
        }
      }`
);

fs.writeFileSync('server.ts', code);
console.log('patched');
