import express from "express";
import { swaggerSpec } from "../config/swagger.js";

const docRouter = express.Router();

// 1. Raw OpenAPI 3.0 specification in JSON
docRouter.get("/swagger.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// 2. Interactive Swagger UI Web Console
docRouter.get("/", (req, res) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>StockFlow API Documentation & Interactive Console</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css" />
  <link rel="icon" type="image/png" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/favicon-32x32.png" />
  <style>
    html {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }
    *, *:before, *:after {
      box-sizing: inherit;
    }
    body {
      margin: 0;
      background: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .custom-topbar {
      background: #0f172a;
      padding: 14px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #1e293b;
    }
    .brand-title {
      color: #ffffff;
      font-weight: 800;
      font-size: 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
    }
    .brand-badge {
      background: #2563eb;
      color: white;
      font-size: 11px;
      padding: 3px 8px;
      border-radius: 6px;
      font-weight: 700;
    }
    .topbar-links a {
      color: #94a3b8;
      font-size: 12px;
      font-weight: 600;
      text-decoration: none;
      margin-left: 18px;
      transition: color 0.15s;
    }
    .topbar-links a:hover {
      color: #ffffff;
    }
    .swagger-ui .topbar {
      display: none;
    }
    .swagger-ui {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    .swagger-ui .info {
      margin: 20px 0;
    }
    .swagger-ui .info .title {
      font-family: inherit;
      color: #0f172a;
    }
    .swagger-ui .btn.authorize {
      background-color: #1d4ed8;
      border-color: #1d4ed8;
      color: white;
      border-radius: 8px;
    }
    .swagger-ui .btn.authorize svg {
      fill: white;
    }
  </style>
</head>
<body>
  <div class="custom-topbar">
    <a href="/api/doc" class="brand-title">
      <span>📦 StockFlow API</span>
      <span class="brand-badge">OpenAPI 3.0</span>
    </a>
    <div class="topbar-links">
      <a href="/api/doc/swagger.json" target="_blank">Raw JSON Spec</a>
      <a href="http://localhost:5173" target="_blank">Frontend App →</a>
    </div>
  </div>

  <div id="swagger-ui"></div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.min.js"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        url: "/api/doc/swagger.json",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "BaseLayout",
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true
      });
      window.ui = ui;
    };
  </script>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html");
  res.send(html);
});

export default docRouter;
