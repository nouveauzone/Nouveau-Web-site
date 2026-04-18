/**
 * Nouveau™ — Real WhatsApp Service
 * Uses Twilio WhatsApp API
 * Bot: +917733881577
 */

// ── Logger — saves all messages to console + memory ──────────────────────────
const messageLog = [];

const logger = (type, to, status, body = "") => {
  const entry = {
    timestamp: new Date().toISOString(),
    type,
    to,
    status,
    preview: body.slice(0, 80),
  };
  messageLog.push(entry);
  const emoji = status.includes("✅") ? "✅" : status.includes("❌") ? "❌" : "📱";
  console.log(`${emoji} [WhatsApp][${entry.timestamp}] ${type} → ${to} | ${status}`);
  return entry;
};

// ── Get message log (for admin panel) ────────────────────────────────────────
const getMessageLog = () => messageLog.slice(-50).reverse();

// ── Twilio client (lazy init) ─────────────────────────────────────────────────
let _client = null;
const getClient = () => {
  if (_client) return _client;
  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;

  if (!sid || !token || sid.startsWith("ACxxxxxx")) {
    return null;
  }
  try {
    _client = require("twilio")(sid, token);
    console.log("✅ Twilio WhatsApp client initialized");
    return _client;
  } catch (e) {
    console.error("❌ Twilio init failed:", e.message);
    return null;
  }
};

const FROM_NUMBER = () =>
  process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";

// ── Normalize Indian phone → whatsapp:+91XXXXXXXXXX ──────────────────────────
const toWhatsApp = (phone) => {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length < 10) return null;
  const last10 = digits.slice(-10);
  return `whatsapp:+91${last10}`;
};

// ── CORE: Send WhatsApp message ───────────────────────────────────────────────
const sendWhatsApp = async ({ to, body, type = "MSG" }) => {
  const client = getClient();
  const waTo   = toWhatsApp(to);

  if (!client) {
    logger(type, to, "⚠️ SKIPPED — Add Twilio credentials in .env", body);
    return { skipped: true, reason: "No Twilio credentials" };
  }

  if (!waTo) {
    logger(type, to, "❌ SKIPPED — Invalid phone number", body);
    return { skipped: true, reason: "Invalid phone" };
  }

  try {
    const msg = await client.messages.create({
      from: FROM_NUMBER(),
      to:   waTo,
      body,
    });
    logger(type, waTo, `✅ SENT — SID: ${msg.sid}`, body);
    return { success: true, sid: msg.sid, to: waTo };
  } catch (err) {
    logger(type, waTo, `❌ FAILED — ${err.message}`, body);
    return { success: false, error: err.message, to: waTo };
  }
};

// ════════════════════════════════════════════════════════════════════════════
// A. ORDER CONFIRMATION — sent when order is placed
// ════════════════════════════════════════════════════════════════════════════
const sendOrderConfirmation = async ({
  phone, customerName, trackingId, orderId, total, items = [], paymentMethod = "COD"
}) => {
  const trackingURL = `${process.env.CLIENT_URL || "http://localhost:3000"}/track/${trackingId}`;
  const itemLines   = items
    .slice(0, 4)
    .map(i => `  • ${i.title || "Product"} × ${i.qty} — ₹${(i.price * i.qty).toLocaleString("en-IN")}`)
    .join("\n");
  const moreItems = items.length > 4 ? `\n  + ${items.length - 4} more item(s)` : "";

  const body = [
    `🎉 *Order Confirmed! — Nouveau™* 🪷`,
    ``,
    `Namaste *${customerName}*! 🙏`,
    `Your order has been placed successfully.`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `📦 *ORDER DETAILS*`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `🆔 Tracking ID: *${trackingId}*`,
    `💰 Total Amount: *₹${Number(total).toLocaleString("en-IN")}*`,
    `💳 Payment: ${paymentMethod}`,
    ``,
    `🛍️ *Items Ordered:*`,
    itemLines + moreItems,
    ``,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `🔗 *Track your order live:*`,
    trackingURL,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    ``,
    `📞 Need help? Reply *HELP*`,
    `📦 Check status? Reply *${trackingId}*`,
    ``,
    `_Thank you for shopping with Nouveau™!_ 🌸`,
  ].join("\n");

  return sendWhatsApp({ to: phone, body, type: "ORDER_CONFIRM" });
};

// ════════════════════════════════════════════════════════════════════════════
// B. PAYMENT SUCCESS — sent after Razorpay/UPI payment verified
// ════════════════════════════════════════════════════════════════════════════
const sendPaymentSuccess = async ({
  phone, customerName, trackingId, orderId, paidAmount, paymentId, paymentMethod = "Online"
}) => {
  const body = [
    `✅ *Payment Received! — Nouveau™* 🪷`,
    ``,
    `Dear *${customerName}*, your payment is confirmed! 💚`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `💳 *PAYMENT DETAILS*`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `🆔 Tracking ID: *${trackingId}*`,
    `💰 Amount Paid: *₹${Number(paidAmount).toLocaleString("en-IN")}*`,
    `💳 Method: ${paymentMethod}`,
    `🔖 Payment Ref: \`${paymentId}\``,
    `📅 Date: ${new Date().toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric", hour:"2-digit", minute:"2-digit" })}`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `Your order is now being prepared! 🚀`,
    `We will notify you when it ships.`,
    ``,
    `_Nouveau™ — Wear the culture_ 🌸`,
  ].join("\n");

  return sendWhatsApp({ to: phone, body, type: "PAYMENT_SUCCESS" });
};

// ════════════════════════════════════════════════════════════════════════════
// C. SHIPPED — sent when admin marks order as Shipped
// ════════════════════════════════════════════════════════════════════════════
const sendShippingUpdate = async ({
  phone, customerName, trackingId, estimatedDelivery
}) => {
  const trackingURL = `${process.env.CLIENT_URL || "http://localhost:3000"}/track/${trackingId}`;
  const estDate = estimatedDelivery
    ? new Date(estimatedDelivery).toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long" })
    : "3–5 business days";

  const body = [
    `🚀 *Your Order is Shipped! — Nouveau™* 🪷`,
    ``,
    `Great news *${customerName}*! 🎉`,
    `Your order is on its way to you! 🛵`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `📦 *SHIPPING DETAILS*`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `🆔 Tracking ID: *${trackingId}*`,
    `📅 Expected Delivery: *${estDate}*`,
    ``,
    `🔗 *Track live here:*`,
    trackingURL,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    ``,
    `Please keep your phone handy for delivery. 🏠`,
    `_Nouveau™ — Wear the culture_ 🌸`,
  ].join("\n");

  return sendWhatsApp({ to: phone, body, type: "SHIPPED" });
};

// ════════════════════════════════════════════════════════════════════════════
// D. OUT FOR DELIVERY
// ════════════════════════════════════════════════════════════════════════════
const sendOutForDelivery = async ({ phone, customerName, trackingId }) => {
  const body = [
    `🛵 *Out for Delivery! — Nouveau™* 🪷`,
    ``,
    `*${customerName}*, your order is arriving TODAY! 🎉`,
    ``,
    `🆔 Tracking ID: *${trackingId}*`,
    ``,
    `📍 Please ensure someone is home to receive it.`,
    `📞 Delivery agent will call before arriving.`,
    ``,
    `_Nouveau™ — Wear the culture_ 🌸`,
  ].join("\n");

  return sendWhatsApp({ to: phone, body, type: "OUT_FOR_DELIVERY" });
};

// ════════════════════════════════════════════════════════════════════════════
// E. DELIVERED
// ════════════════════════════════════════════════════════════════════════════
const sendDeliveredMessage = async ({ phone, customerName, trackingId }) => {
  const body = [
    `✅ *Order Delivered! — Nouveau™* 🪷`,
    ``,
    `*${customerName}*, your order has been delivered! 🎉🎉`,
    ``,
    `🆔 Tracking ID: *${trackingId}*`,
    ``,
    `We hope you absolutely LOVE your Nouveau™ purchase! 💖`,
    ``,
    `⭐ *Share your experience:*`,
    `Reply *REVIEW* to leave feedback`,
    ``,
    `📞 Any issue? Reply *SUPPORT*`,
    ``,
    `_Thank you for choosing Nouveau™_ 🌸`,
    `_Wear the culture_ ✨`,
  ].join("\n");

  return sendWhatsApp({ to: phone, body, type: "DELIVERED" });
};

// ════════════════════════════════════════════════════════════════════════════
// F. INVOICE LINK
// ════════════════════════════════════════════════════════════════════════════
const sendInvoiceLink = async ({ phone, customerName, trackingId, total, items = [] }) => {
  const trackingURL = `${process.env.CLIENT_URL || "http://localhost:3000"}/track/${trackingId}`;

  const body = [
    `🧾 *Invoice — Nouveau™* 🪷`,
    ``,
    `Hi *${customerName}*! Here's your order summary:`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `🆔 Tracking ID: *${trackingId}*`,
    ``,
    `🛍️ *Items:*`,
    ...items.slice(0, 5).map(i => `  • ${i.title} × ${i.qty} = ₹${(i.price * i.qty).toLocaleString("en-IN")}`),
    ``,
    `💰 *Total Paid: ₹${Number(total).toLocaleString("en-IN")}*`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    ``,
    `🔗 Track Order: ${trackingURL}`,
    ``,
    `_Keep this message as your receipt_ 🌸`,
  ].join("\n");

  return sendWhatsApp({ to: phone, body, type: "INVOICE" });
};

// ════════════════════════════════════════════════════════════════════════════
// STATUS DISPATCHER — called from orderController on status update
// ════════════════════════════════════════════════════════════════════════════
const sendStatusUpdate = async (order, phone) => {
  if (!phone) return { skipped: true, reason: "No phone" };

  const customerName = order.shippingAddress?.name || "Customer";
  const trackingId   = order.trackingId || String(order._id);

  switch (order.orderStatus) {
    case "Processing":
      return sendWhatsApp({
        to:   phone,
        type: "PROCESSING",
        body: [
          `⚙️ *Order Processing — Nouveau™* 🪷`,
          ``,
          `*${customerName}*, your order is being prepared! 🎁`,
          `🆔 Tracking ID: *${trackingId}*`,
          ``,
          `We'll notify you once it ships! 🚀`,
          `_Nouveau™ — Wear the culture_ 🌸`,
        ].join("\n"),
      });
    case "Shipped":
      return sendShippingUpdate({
        phone, customerName, trackingId,
        estimatedDelivery: order.estimatedDelivery,
      });
    case "Out for Delivery":
      return sendOutForDelivery({ phone, customerName, trackingId });
    case "Delivered":
      return sendDeliveredMessage({ phone, customerName, trackingId });
    case "Cancelled":
      return sendWhatsApp({
        to:   phone,
        type: "CANCELLED",
        body: [
          `❌ *Order Cancelled — Nouveau™*`,
          ``,
          `*${customerName}*, your order *${trackingId}* has been cancelled.`,
          ``,
          `If this was a mistake, please contact us:`,
          `📞 Reply *SUPPORT* for help`,
          ``,
          `_Nouveau™ — Wear the culture_ 🌸`,
        ].join("\n"),
      });
    default:
      return { skipped: true, reason: `No WhatsApp for status: ${order.orderStatus}` };
  }
};

module.exports = {
  sendWhatsApp,
  sendOrderConfirmation,
  sendPaymentSuccess,
  sendShippingUpdate,
  sendOutForDelivery,
  sendDeliveredMessage,
  sendInvoiceLink,
  sendStatusUpdate,
  getMessageLog,
  toWhatsApp,
};
