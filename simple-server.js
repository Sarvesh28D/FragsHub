const http = require('http');
const path = require('path');

const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      message: 'FragsHub Backend API is running!',
      port: 8080
    }));
  } else if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <html>
        <head><title>FragsHub Backend</title></head>
        <body style="font-family: Arial; padding: 20px; background: #1e3c72; color: white;">
          <h1>🎮 FragsHub Backend API</h1>
          <p>Server is running on port 8080</p>
          <ul>
            <li><a href="/health" style="color: #4CAF50;">/health</a> - Health check</li>
            <li><a href="/api/tournaments" style="color: #2196F3;">/api/tournaments</a> - Tournament endpoints</li>
            <li><a href="/api/teams" style="color: #FF9800;">/api/teams</a> - Team management</li>
            <li><a href="/api/payments" style="color: #9C27B0;">/api/payments</a> - Payment processing</li>
          </ul>
        </body>
      </html>
    `);
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found', path: req.url }));
  }
});

const PORT = 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 FragsHub Backend running on http://localhost:${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🎮 Ready for esports tournaments!`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});
