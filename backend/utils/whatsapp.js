const axios = require("axios");

const INTERAKT_ENDPOINT = "https://api.interakt.ai/v1/public/message/";

const normalizeIndianPhone = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  return digits.slice(-10);
};

const formatAddress = (address = {}) => {
  if (typeof address === "string") return address.trim();

  return [
    address.street,
    address.city,
    address.state,
    address.pincode,
  ]
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join(", ");
};

const sendWhatsAppConfirmation = async ({
  customerName,
  phone,
  orderId,
  amount,
  address,
}) => {
  const apiKey = String(process.env.INTERAKT_API_KEY || "").trim();
  if (!apiKey) {
    throw new Error("INTERAKT_API_KEY is missing");
  }

  const phoneNumber = normalizeIndianPhone(phone);
  if (!phoneNumber || phoneNumber.length !== 10) {
    throw new Error("Invalid customer phone number");
  }

  const safeName = String(customerName || "Customer").trim() || "Customer";
  const safeOrderId = String(orderId || "").trim() || "N/A";
  const safeAmount = Number(amount || 0).toLocaleString("en-IN");
  const safeAddress = formatAddress(address) || "Address not available";

  const payload = {
    countryCode: "+91",
    phoneNumber,
    callbackData: "order_confirmation",
    type: "Template",
    template: {
      name: "order_confirmation",
      languageCode: "en",
      bodyValues: [
        safeName,
        `#${safeOrderId}`,
        `₹${safeAmount}`,
        safeAddress,
        "3-5 working days",
      ],
    },
  };

  const response = await axios.post(INTERAKT_ENDPOINT, payload, {
    headers: {
      Authorization: `Basic ${apiKey}`,
      "Content-Type": "application/json",
    },
    timeout: 15000,
  });

  return {
    success: true,
    phoneNumber,
    response: response.data,
  };
};

module.exports = {
  sendWhatsAppConfirmation,
  normalizeIndianPhone,
  formatAddress,
};
