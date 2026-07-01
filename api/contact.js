const https = require('https');

function sendToResend(apiKey, payload) {
  return new Promise(function (resolve, reject) {
    const body = JSON.stringify(payload);
    const options = {
      hostname: 'api.resend.com',
      path: '/emails',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };
    const req = https.request(options, function (resp) {
      let data = '';
      resp.on('data', function (chunk) { data += chunk; });
      resp.on('end', function () {
        if (resp.statusCode >= 200 && resp.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error('Resend ' + resp.statusCode + ': ' + data));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function v(d, key) {
  return (d[key] || '').toString().trim();
}

function buildEmail(d) {
  var name    = v(d, 'name');
  var email   = v(d, 'email');
  var phone   = v(d, 'phone');
  var company = v(d, 'company');
  var message = v(d, 'message').replace(/\n/g, '<br>');

  return '<!DOCTYPE html><html><head><meta charset="UTF-8"></head>' +
    '<body style="margin:0;padding:0;background:#f3f4f6;">' +
    '<div style="max-width:580px;margin:32px auto;">' +

    '<div style="background:#0d0d0d;padding:24px 28px;border-radius:10px 10px 0 0;">' +
    '<div style="font-size:21px;font-weight:700;color:#fff;font-family:Arial,sans-serif;letter-spacing:-0.02em;">QuickRide<span style="color:#b8922a;">Africa</span></div>' +
    '<div style="font-size:11px;color:#9ca3af;margin-top:4px;letter-spacing:0.08em;text-transform:uppercase;font-family:Arial,sans-serif;">New Contact Enquiry</div>' +
    '</div>' +

    '<div style="background:#fff;padding:28px;">' +

    '<table style="width:100%;border-collapse:collapse;margin-bottom:24px;"><tbody>' +
    '<tr><td style="padding:10px 0;font-size:13px;color:#6b7280;font-family:Arial,sans-serif;width:110px;border-bottom:1px solid #f3f4f6;">Name</td>' +
    '<td style="padding:10px 0;font-size:14px;color:#111827;font-family:Arial,sans-serif;border-bottom:1px solid #f3f4f6;">' + name + '</td></tr>' +
    '<tr><td style="padding:10px 0;font-size:13px;color:#6b7280;font-family:Arial,sans-serif;border-bottom:1px solid #f3f4f6;">Email</td>' +
    '<td style="padding:10px 0;font-size:14px;font-family:Arial,sans-serif;border-bottom:1px solid #f3f4f6;"><a href="mailto:' + email + '" style="color:#b8922a;text-decoration:none;">' + email + '</a></td></tr>' +
    (phone ? '<tr><td style="padding:10px 0;font-size:13px;color:#6b7280;font-family:Arial,sans-serif;border-bottom:1px solid #f3f4f6;">Phone</td>' +
    '<td style="padding:10px 0;font-size:14px;color:#111827;font-family:Arial,sans-serif;border-bottom:1px solid #f3f4f6;">' + phone + '</td></tr>' : '') +
    (company ? '<tr><td style="padding:10px 0;font-size:13px;color:#6b7280;font-family:Arial,sans-serif;border-bottom:1px solid #f3f4f6;">Company</td>' +
    '<td style="padding:10px 0;font-size:14px;color:#111827;font-family:Arial,sans-serif;border-bottom:1px solid #f3f4f6;">' + company + '</td></tr>' : '') +
    '</tbody></table>' +

    '<div style="background:#f9fafb;border-left:3px solid #b8922a;padding:16px 20px;border-radius:0 6px 6px 0;">' +
    '<p style="margin:0 0 8px;font-size:11px;color:#9ca3af;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:0.08em;">Message</p>' +
    '<p style="margin:0;font-size:14px;color:#374151;font-family:Arial,sans-serif;line-height:1.75;">' + message + '</p>' +
    '</div>' +

    '</div>' +

    '<div style="background:#0d0d0d;padding:14px 28px;border-radius:0 0 10px 10px;text-align:center;">' +
    '<p style="margin:0;font-size:12px;color:#6b7280;font-family:Arial,sans-serif;">Submitted from ' +
    '<a href="https://quickride.africa" style="color:#b8922a;text-decoration:none;">quickride.africa</a></p>' +
    '</div></div></body></html>';
}

module.exports = async function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  var d = req.body || {};
  var apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Server configuration error' });

  try {
    await sendToResend(apiKey, {
      from: 'QuickRide Africa <noreply@quickride.africa>',
      to: ['booking@quickride.africa'],
      reply_to: v(d, 'email') || undefined,
      subject: 'New Enquiry from ' + (v(d, 'name') || 'Website Visitor'),
      html: buildEmail(d)
    });
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('contact.js error:', err.message);
    res.status(500).json({ error: 'Failed to send email' });
  }
};
