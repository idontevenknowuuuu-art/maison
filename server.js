const http = require('http');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const PORT = process.env.PORT || 3000;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'kahad238@gmail.com';
const SMTP_USER = process.env.SMTP_USER || 'idontevenknowuuuu@gmail.com';
const SMTP_PASS = process.env.SMTP_PASS || 'suhgarwsfqjcioqu';

let transporter = null;
let emailReady = false;

// ─── Setup Gmail SMTP ────────────
async function setupEmail() {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });
  console.log('  📧 Using Gmail SMTP (' + SMTP_USER + ')');
  emailReady = true;
  console.log('  ✅ Email system ready!\n');
}

const MIME_TYPES = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// ─── Email HTML Template ───────────────────────────────────────────
function buildOrderEmailHTML(order, isAdmin) {
  const itemRows = order.items.map(item => `
    <tr>
      <td style="padding:12px;border-bottom:1px solid #E8DDD0;">
        <img src="${item.img}" alt="${item.name}" style="width:60px;height:60px;object-fit:cover;border-radius:4px;">
      </td>
      <td style="padding:12px;border-bottom:1px solid #E8DDD0;font-family:'DM Sans',Arial,sans-serif;">
        <strong>${item.name}</strong><br>
        <span style="color:#6B6560;font-size:0.85rem;">${item.category || ''}</span>
      </td>
      <td style="padding:12px;border-bottom:1px solid #E8DDD0;text-align:center;font-family:'DM Sans',Arial,sans-serif;">×${item.qty}</td>
      <td style="padding:12px;border-bottom:1px solid #E8DDD0;text-align:right;font-weight:600;font-family:'DM Sans',Arial,sans-serif;">$${item.price * item.qty}</td>
    </tr>
  `).join('');

  const customerInfo = isAdmin ? `
    <div style="background:#F5F0E8;padding:16px;border-radius:6px;margin-bottom:24px;">
      <h3 style="margin:0 0 8px;font-family:'DM Sans',Arial,sans-serif;font-size:0.85rem;text-transform:uppercase;letter-spacing:0.1em;color:#6B6560;">Customer Details</h3>
      <p style="margin:4px 0;font-family:'DM Sans',Arial,sans-serif;"><strong>Name:</strong> ${order.customer.name}</p>
      <p style="margin:4px 0;font-family:'DM Sans',Arial,sans-serif;"><strong>Email:</strong> ${order.customer.email}</p>
      <p style="margin:4px 0;font-family:'DM Sans',Arial,sans-serif;"><strong>Phone:</strong> ${order.customer.phone || 'N/A'}</p>
    </div>
  ` : '';

  return `
  <!DOCTYPE html>
  <html>
  <body style="margin:0;padding:0;background:#F5F0E8;font-family:'DM Sans',Arial,sans-serif;">
    <div style="max-width:600px;margin:0 auto;padding:20px;">
      <div style="background:linear-gradient(135deg,#5C3D2E,#2D1F14);padding:32px;text-align:center;border-radius:8px 8px 0 0;">
        <h1 style="margin:0;color:#FDFCFA;font-family:Georgia,serif;font-size:2rem;font-weight:400;letter-spacing:0.15em;">MAI<span style="color:#C9A84C;">S</span>ON</h1>
        <p style="margin:8px 0 0;color:rgba(245,240,232,0.6);font-size:0.75rem;letter-spacing:0.3em;text-transform:uppercase;">Luxury Furniture</p>
      </div>
      
      <div style="background:#FDFCFA;padding:32px;border-radius:0 0 8px 8px;box-shadow:0 4px 20px rgba(28,20,12,0.1);">
        <h2 style="font-family:Georgia,serif;font-size:1.5rem;font-weight:400;color:#1A1A1A;margin:0 0 8px;">
          ${isAdmin ? '🔔 New Order Received' : '✅ Order Confirmed'}
        </h2>
        <p style="color:#6B6560;margin:0 0 24px;font-size:0.9rem;">
          ${isAdmin 
            ? `A new order <strong>${order.id}</strong> has been placed.`
            : `Thank you for your order, <strong>${order.customer.name}</strong>! Your order <strong>${order.id}</strong> is being processed.`
          }
        </p>

        ${customerInfo}

        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
          <thead>
            <tr style="background:#F5F0E8;">
              <th style="padding:10px;text-align:left;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:#6B6560;">Image</th>
              <th style="padding:10px;text-align:left;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:#6B6560;">Product</th>
              <th style="padding:10px;text-align:center;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:#6B6560;">Qty</th>
              <th style="padding:10px;text-align:right;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:#6B6560;">Price</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>

        <div style="border-top:2px solid #E8DDD0;padding-top:16px;">
          <table style="width:100%;font-family:'DM Sans',Arial,sans-serif;">
            <tr><td style="padding:4px 0;color:#6B6560;">Subtotal</td><td style="padding:4px 0;text-align:right;">$${order.subtotal}</td></tr>
            <tr><td style="padding:4px 0;color:#6B6560;">Shipping</td><td style="padding:4px 0;text-align:right;">${order.shipping === 0 ? 'FREE' : '$' + order.shipping}</td></tr>
            <tr><td style="padding:8px 0 0;font-size:1.2rem;font-weight:700;color:#5C3D2E;border-top:1px solid #E8DDD0;">Total</td><td style="padding:8px 0 0;text-align:right;font-size:1.2rem;font-weight:700;color:#5C3D2E;border-top:1px solid #E8DDD0;">$${order.total}</td></tr>
          </table>
        </div>

        ${!isAdmin ? `
        <div style="margin-top:24px;padding:16px;background:#F5F0E8;border-radius:6px;text-align:center;">
          <p style="margin:0;color:#6B6560;font-size:0.85rem;">We'll notify you when your order ships. Questions? Reply to this email.</p>
        </div>` : ''}
      </div>

      <div style="text-align:center;padding:24px;color:#6B6560;font-size:0.75rem;">
        <p style="margin:0;">MAISON — Luxury Furniture · Est. 2012</p>
      </div>
    </div>
  </body>
  </html>`;
}

// ─── API Handler ────────────────────────────────────────────────────
async function handleOrderAPI(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    try {
      const order = JSON.parse(body);
      
      if (!order.customer || !order.customer.email) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Customer email required' }));
        return;
      }

      if (!emailReady) {
        res.writeHead(503, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Email system initializing...' }));
        return;
      }

      // Send to ADMIN
      await transporter.sendMail({
        from: `"MAISON Furniture" <${SMTP_USER}>`,
        to: ADMIN_EMAIL,
        subject: `🔔 New Order ${order.id} — $${order.total}`,
        html: buildOrderEmailHTML(order, true)
      });
      console.log('📧 Admin email sent to', ADMIN_EMAIL);

      // Send to CUSTOMER
      await transporter.sendMail({
        from: `"MAISON Furniture" <${SMTP_USER}>`,
        to: order.customer.email,
        subject: `✅ Order Confirmed — ${order.id}`,
        html: buildOrderEmailHTML(order, false)
      });
      console.log('📧 Customer email sent to', order.customer.email);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Emails sent!' }));
    } catch (err) {
      console.error('❌ Email error:', err.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
  });
}

// ─── HTTP Server ────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  // Handle CORS preflight for all routes
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/api/order') {
    return handleOrderAPI(req, res);
  }

  // Serve static files
  let filePath = req.url === '/' ? '/furniture.html' : req.url.split('?')[0];
  filePath = path.join(__dirname, filePath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

// ─── Start ──────────────────────────────────────────────────────────
(async () => {
  console.log('\n  🏡 MAISON Furniture Server');
  console.log('  ─────────────────────────');
  console.log(`  🌐 Port: ${PORT}`);
  console.log(`  📧 Admin: ${ADMIN_EMAIL}\n`);
  
  await setupEmail();
  
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`  Server running on port ${PORT}`);
    console.log('  Press Ctrl+C to stop.\n');
  });
})();
