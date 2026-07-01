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

function cap(str) {
  return str ? str.replace(/-/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); }) : '';
}

function row(label, value) {
  if (!value) return '';
  return '<tr>' +
    '<td style="padding:9px 14px;font-size:13px;color:#6b7280;font-family:Arial,sans-serif;width:170px;vertical-align:top;border-bottom:1px solid #f3f4f6;">' + label + '</td>' +
    '<td style="padding:9px 14px;font-size:14px;color:#111827;font-family:Arial,sans-serif;vertical-align:top;border-bottom:1px solid #f3f4f6;">' + value + '</td>' +
    '</tr>';
}

function section(title, rows) {
  var content = rows.filter(Boolean).join('');
  if (!content) return '';
  return '<div style="margin-bottom:18px;">' +
    '<div style="background:#b8922a;padding:8px 14px;border-radius:6px 6px 0 0;">' +
    '<span style="font-size:11px;font-weight:700;color:#fff;letter-spacing:0.1em;text-transform:uppercase;font-family:Arial,sans-serif;">' + title + '</span>' +
    '</div>' +
    '<table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 6px 6px;">' +
    '<tbody>' + content + '</tbody></table></div>';
}

function buildEmail(d) {
  var service = cap(v(d, 'service-required'));
  var hasFlightData = v(d, 'airline') || v(d, 'flight-number');
  var hasNotes = v(d, 'special-requests') || v(d, 'special-instructions');

  return '<!DOCTYPE html><html><head><meta charset="UTF-8"></head>' +
    '<body style="margin:0;padding:0;background:#f3f4f6;">' +
    '<div style="max-width:620px;margin:32px auto;">' +

    '<div style="background:#0d0d0d;padding:24px 28px;border-radius:10px 10px 0 0;">' +
    '<div style="font-size:21px;font-weight:700;color:#fff;font-family:Arial,sans-serif;letter-spacing:-0.02em;">QuickRide<span style="color:#b8922a;">Africa</span></div>' +
    '<div style="font-size:11px;color:#9ca3af;margin-top:4px;letter-spacing:0.08em;text-transform:uppercase;font-family:Arial,sans-serif;">New Booking Request</div>' +
    '</div>' +

    '<div style="background:#f9fafb;padding:20px 20px 6px;">' +

    section('Client Information', [
      row('Full Name',        v(d, 'full-name')),
      row('Company',          v(d, 'company')),
      row('Email',            v(d, 'email')),
      row('Phone',            v(d, 'phone')),
      row('WhatsApp',         v(d, 'whatsapp')),
      row('Country',          v(d, 'country')),
      row('Preferred Contact', cap(v(d, 'contact-method')))
    ]) +

    section('Trip Details', [
      row('Service',          service),
      row('Pickup Date',      v(d, 'pickup-date')),
      row('Pickup Time',      v(d, 'pickup-time')),
      row('Pickup Location',  v(d, 'pickup-location')),
      row('Drop-off Location', v(d, 'dropoff-location')),
      row('Return Journey',   cap(v(d, 'return-journey'))),
      row('Return Date',      v(d, 'return-date')),
      row('Return Time',      v(d, 'return-time'))
    ]) +

    section('Passengers & Luggage', [
      row('Passengers',   v(d, 'num-passengers')),
      row('Children',     v(d, 'num-children')),
      row('Large Bags',   v(d, 'num-large-bags')),
      row('Hand Luggage', v(d, 'num-hand-luggage'))
    ]) +

    section('Vehicle', [
      row('Vehicle Selected', cap(v(d, 'vehicle')))
    ]) +

    (hasFlightData ? section('Flight Details', [
      row('Airline',        v(d, 'airline')),
      row('Flight Number',  v(d, 'flight-number')),
      row('Arrival Airport', v(d, 'arrival-airport')),
      row('Origin Airport', v(d, 'origin-airport')),
      row('Arrival Date',   v(d, 'arrival-date')),
      row('Arrival Time',   v(d, 'arrival-time')),
      row('Meet & Greet',   cap(v(d, 'meet-greet')))
    ]) : '') +

    (hasNotes ? section('Additional Notes', [
      row('Special Requests',     v(d, 'special-requests')),
      row('Special Instructions', v(d, 'special-instructions'))
    ]) : '') +

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

  var name = v(d, 'full-name');
  var service = cap(v(d, 'service-required'));

  try {
    await sendToResend(apiKey, {
      from: 'QuickRide Africa <noreply@quickride.africa>',
      to: ['booking@quickride.africa'],
      reply_to: v(d, 'email') || undefined,
      subject: 'New Booking: ' + (service || 'Request') + (name ? ' — ' + name : ''),
      html: buildEmail(d)
    });
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('book.js error:', err.message);
    res.status(500).json({ error: 'Failed to send email' });
  }
};
