const nodemailer = require("nodemailer");

const createTransporter = () => {
  // If no email config, use ethereal (test) transport
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === "your_gmail@gmail.com") {
    return null; // will skip sending
  }
  return nodemailer.createTransport({
    host:   process.env.EMAIL_HOST || "smtp.gmail.com",
    port:   parseInt(process.env.EMAIL_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendOrderEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.log(`📧 Email skipped (no SMTP config) — To: ${to} | Subject: ${subject}`);
    return;
  }
  await transporter.sendMail({
    from:    process.env.EMAIL_FROM || "Nouveau™ <noreply@nouveau.in>",
    to,
    subject,
    html,
  });
  console.log(`📧 Email sent → ${to}`);
};

const orderConfirmHTML = (order, user) => `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#faf7f2">
  <div style="background:#B76E79;padding:32px 40px;text-align:center">
    <h1 style="color:#fff;font-family:Georgia,serif;font-size:28px;margin:0">Order Confirmed! 🪷</h1>
    <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;letter-spacing:2px">NOUVEAU™</p>
  </div>
  <div style="padding:36px 40px">
    <p style="color:#555;font-size:15px">Hi <strong>${user?.name || "Customer"}</strong>, your order has been placed successfully!</p>
    <div style="background:#fff;border:1px solid #eadbd2;border-radius:10px;padding:20px;margin:20px 0">
      <p style="font-size:12px;letter-spacing:2px;color:#B76E79;margin:0 0 6px">ORDER ID</p>
      <p style="font-size:20px;font-weight:bold;color:#1a1a1a;margin:0;letter-spacing:2px">${order._id}</p>
    </div>
    <table style="width:100%;border-collapse:collapse;margin:20px 0">
      <thead><tr style="background:#f3ede5"><th style="padding:10px;text-align:left;font-size:12px;color:#888;letter-spacing:1px">PRODUCT</th><th style="padding:10px;text-align:right;font-size:12px;color:#888">QTY</th><th style="padding:10px;text-align:right;font-size:12px;color:#888">PRICE</th></tr></thead>
      <tbody>
        ${order.items.map(i => `<tr style="border-bottom:1px solid #eee"><td style="padding:12px 10px;font-size:14px;color:#333">${i.title} <span style="color:#999;font-size:12px">/ ${i.size}</span></td><td style="padding:12px 10px;text-align:right;font-size:14px">×${i.qty}</td><td style="padding:12px 10px;text-align:right;font-size:14px;font-weight:bold;color:#B76E79">₹${(i.price*i.qty).toLocaleString("en-IN")}</td></tr>`).join("")}
      </tbody>
    </table>
    <div style="text-align:right;padding:12px 10px;border-top:2px solid #B76E79">
      <span style="font-size:16px;font-weight:bold;color:#1a1a1a">Total: ₹${order.total?.toLocaleString("en-IN")}</span>
    </div>
    <div style="background:#f3ede5;border-radius:10px;padding:16px 20px;margin:20px 0">
      <p style="font-size:12px;letter-spacing:2px;color:#B76E79;margin:0 0 8px">DELIVERING TO</p>
      <p style="font-size:14px;color:#333;margin:0">${order.shippingAddress?.name} · ${order.shippingAddress?.phone}</p>
      <p style="font-size:13px;color:#777;margin:4px 0 0">${order.shippingAddress?.street}, ${order.shippingAddress?.city}, ${order.shippingAddress?.state} – ${order.shippingAddress?.pincode}</p>
    </div>
    <p style="color:#555;font-size:14px">Expected delivery: <strong>5–7 business days</strong></p>
    <div style="background:#D4AF37;color:#fff;padding:14px 20px;border-radius:8px;margin:20px 0;text-align:center">
      <p style="margin:0;font-size:13px">Track your order anytime at <strong>nouveau.in/track</strong></p>
    </div>
  </div>
  <div style="background:#B76E79;padding:20px 40px;text-align:center">
    <p style="color:rgba(255,255,255,0.7);font-size:12px;margin:0">© 2026 Nouveau™ · Own Your Aura · Made with ♥ in India</p>
  </div>
</div>
`;

const shippedEmailHTML = (order) => `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#faf7f2">
  <div style="background:#2d6a4f;padding:32px 40px;text-align:center">
    <h1 style="color:#fff;font-family:Georgia,serif;font-size:28px;margin:0">Your Order is Shipped! 🚚</h1>
  </div>
  <div style="padding:36px 40px">
    <p style="color:#555;font-size:15px">Great news! Your Nouveau™ order <strong>${order._id}</strong> has been shipped and is on its way.</p>
    <div style="background:#d4edda;border:1px solid #c3e6cb;border-radius:10px;padding:20px;margin:20px 0;text-align:center">
      <p style="font-size:24px;margin:0">📦 → 🚚 → 🏠</p>
      <p style="color:#155724;font-size:14px;font-weight:bold;margin:8px 0 0">Expected in 3–5 days</p>
    </div>
    <p style="color:#555;font-size:14px">Payment method: <strong>${order.paymentMethod}</strong></p>
  </div>
  <div style="background:#B76E79;padding:20px;text-align:center">
    <p style="color:rgba(255,255,255,0.7);font-size:12px;margin:0">© 2026 Nouveau™ · Own Your Aura</p>
  </div>
</div>
`;

module.exports = { sendOrderEmail, orderConfirmHTML, shippedEmailHTML };
