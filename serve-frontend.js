const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

// MIME types for different file extensions
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Parse URL and remove query parameters
  let filePath = req.url.split('?')[0];
  
  // Default to login.html for root path
  if (filePath === '/') {
    filePath = '/login.html';
  }
  
  // Build full file path
  const fullPath = path.join(__dirname, filePath);
  
  // Get file extension
  const extname = String(path.extname(fullPath)).toLowerCase();
  const mimeType = mimeTypes[extname] || 'application/octet-stream';
  
  // Check if file exists
  fs.access(fullPath, fs.constants.F_OK, (err) => {
    if (err) {
      // File not found
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <body>
            <h1>404 - File Not Found</h1>
            <p>The requested file ${filePath} was not found.</p>
            <a href="/login.html">Go to MoneyVault Login</a>
          </body>
        </html>
      `);
      return;
    }
    
    // Read and serve the file
    fs.readFile(fullPath, (err, content) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <body>
              <h1>500 - Internal Server Error</h1>
              <p>Error reading file: ${err.message}</p>
            </body>
          </html>
        `);
        return;
      }
      
      // Set CORS headers to allow API requests
      res.writeHead(200, {
        'Content-Type': mimeType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      });
      res.end(content);
    });
  });
});

server.listen(PORT, () => {
  console.log(`🌐 MoneyVault Frontend Server running on http://localhost:${PORT}`);
  console.log(`🔗 Open http://localhost:${PORT} to access MoneyVault`);
  console.log(`📱 Direct login: http://localhost:${PORT}/login.html`);
});
