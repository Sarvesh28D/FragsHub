const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>FragsHub - Esports Tournament Platform</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
              color: white;
              min-height: 100vh;
              padding: 20px;
            }
            .container {
              max-width: 1200px;
              margin: 0 auto;
              text-align: center;
            }
            h1 {
              font-size: 4rem;
              margin-bottom: 20px;
              text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            .subtitle {
              font-size: 1.5rem;
              margin-bottom: 40px;
              opacity: 0.9;
            }
            .features {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
              gap: 20px;
              margin: 40px 0;
            }
            .feature {
              background: rgba(255,255,255,0.1);
              padding: 30px;
              border-radius: 15px;
              backdrop-filter: blur(10px);
            }
            .feature h3 {
              font-size: 1.5rem;
              margin-bottom: 15px;
            }
            .status {
              background: rgba(0,0,0,0.2);
              padding: 20px;
              border-radius: 10px;
              margin-top: 40px;
            }
            .status-grid {
              display: flex;
              gap: 20px;
              justify-content: center;
              flex-wrap: wrap;
              margin-top: 15px;
            }
            .status-item {
              padding: 10px 20px;
              border-radius: 5px;
              font-weight: bold;
            }
            .status-ok { background: #4CAF50; }
            .status-api { background: #2196F3; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🎮 FragsHub</h1>
            <p class="subtitle">Ultimate Esports Tournament Platform</p>
            
            <div class="features">
              <div class="feature">
                <h3>🏆 Tournament Management</h3>
                <p>Create and manage esports tournaments with automated bracket generation.</p>
              </div>
              <div class="feature">
                <h3>💳 Payment Integration</h3>
                <p>Secure payment processing with Razorpay for tournament registrations.</p>
              </div>
              <div class="feature">
                <h3>👥 Team Management</h3>
                <p>Easy team registration and management system for players.</p>
              </div>
            </div>

            <div class="status">
              <h3>System Status</h3>
              <div class="status-grid">
                <div class="status-item status-ok">✅ Frontend: Port 9090</div>
                <div class="status-item status-api">✅ Backend: Port 8080</div>
              </div>
              <p style="margin-top: 15px; opacity: 0.8;">
                Ready for competitive gaming tournaments!
              </p>
            </div>
          </div>
          
          <script>
            // Test backend connection
            fetch('http://localhost:8080/health')
              .then(res => res.json())
              .then(data => {
                console.log('Backend connected:', data);
              })
              .catch(err => {
                console.log('Backend connection failed:', err);
              });
          </script>
        </body>
      </html>
    `);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

const PORT = 9090;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 FragsHub Frontend running on http://localhost:${PORT}`);
  console.log(`🎮 Ready for esports tournaments!`);
});

server.on('error', (err) => {
  console.error('Frontend server error:', err);
});
