const https = require("https");

function createCheckout(secretKey, payload) {
  return new Promise(function (resolve, reject) {
    const body = JSON.stringify(payload);
    const options = {
      hostname: "payments.yoco.com",
      path: "/api/checkouts",
      method: "POST",
      headers: {
        Authorization: "Bearer " + secretKey,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
    };
    const req = https.request(options, function (resp) {
      let data = "";
      resp.on("data", function (chunk) { data += chunk; });
      resp.on("end", function () {
        try {
          const parsed = JSON.parse(data);
          if (resp.statusCode >= 200 && resp.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error("Yoco " + resp.statusCode + ": " + data));
          }
        } catch (e) {
          reject(new Error("Invalid Yoco response: " + data));
        }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function safeOrigin(origin) {
  if (!origin) return "https://quickride.africa";
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return origin;
  if (/^https:\/\/quickride\.africa$/.test(origin)) return origin;
  return "https://quickride.africa";
}

module.exports = async function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const secretKey = process.env.YOCO_SECRET_KEY;
  if (!secretKey)
    return res.status(500).json({ error: "Server configuration error" });

  const { amountInCents, currency = "ZAR", name, reference, origin } =
    req.body || {};

  const cents = parseInt(amountInCents, 10);
  if (!cents || isNaN(cents) || cents < 100)
    return res.status(400).json({ error: "Amount must be at least R1.00" });

  const base = safeOrigin(origin);

  const refParam = reference ? "?ref=" + encodeURIComponent(reference) : "";
  const nameParam = name
    ? (refParam ? "&" : "?") + "name=" + encodeURIComponent(name)
    : "";

  try {
    const checkout = await createCheckout(secretKey, {
      amount: cents,
      currency,
      successUrl: base + "/pay-success.html" + refParam + nameParam,
      cancelUrl: base + "/pay.html" + refParam + nameParam,
      metadata: {
        clientName: name || "",
        reference: reference || "",
      },
    });

    console.log(
      "Checkout created:",
      checkout.id,
      "| Name:",
      name || "-",
      "| Ref:",
      reference || "-",
      "| Amount:",
      (cents / 100).toFixed(2),
      currency
    );

    res.status(200).json({ ok: true, redirectUrl: checkout.redirectUrl });
  } catch (err) {
    console.error("pay.js error:", err.message);
    res.status(500).json({ error: "Could not create payment session. Please try again." });
  }
};
