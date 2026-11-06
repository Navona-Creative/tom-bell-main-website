// Cloudflare Pages Function: POST /api/contact
// 1. Emails each estimate request to Matt through Resend (resend.com, free tier),
//    sending as website@tombellcabinetry.com with Reply-To set to the visitor.
// 2. Sends the visitor a branded confirmation (reply-to Matt) once Matt's copy is accepted.
// Pages > Settings > Variables: RESEND_API_KEY (secret), optional TO_EMAIL / FROM_EMAIL.

const SITE = 'https://tombellcabinetry.com';
const PHONE = '(615) 469-2781';
const PHONE_HREF = 'tel:+16154692781';
const INSTAGRAM = 'https://www.instagram.com/tombellcabinetrynashville';

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

const esc = (v) => String(v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

export async function onRequestPost({ request, env }) {
  const wantsJson = (request.headers.get('accept') || '').includes('application/json');
  const done = (ok) =>
    wantsJson ? json({ ok }, ok ? 200 : 502) : Response.redirect(new URL(ok ? '/thank-you/' : '/contact/?error=1', request.url), 303);

  let form;
  try { form = await request.formData(); } catch { return done(false); }
  const get = (k) => String(form.get(k) || '').trim().slice(0, 5000);

  // Spam: honeypot filled -> act like success, send nothing.
  if (get('website')) return done(true);

  const lead = {
    first_name: get('first_name'),
    last_name: get('last_name'),
    email: get('email'),
    phone: get('phone'),
    message: get('message'),
    page: get('page') || '/contact/',
    submitted_at: new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }) + ' CT',
  };
  if (!lead.email || !/^\S+@\S+\.\S+$/.test(lead.email) || !lead.phone || !lead.message) {
    return wantsJson ? json({ ok: false, error: 'missing_fields' }, 400) : done(false);
  }

  if (!env.RESEND_API_KEY) {
    console.error('contact: RESEND_API_KEY missing');
    return done(false);
  }
  const from = `Tom Bell Cabinetry & Custom <${env.FROM_EMAIL || 'website@tombellcabinetry.com'}>`;
  const owner = env.TO_EMAIL || 'matt@tombellcabinetry.com';
  const name = [lead.first_name, lead.last_name].filter(Boolean).join(' ') || lead.email;

  const send = async (payload) => {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) console.error('contact: resend error', res.status, await res.text());
    return res.ok;
  };

  // 1. Notify Matt.
  const rows = [
    ['Name', name], ['Email', lead.email], ['Phone', lead.phone],
    ['Message', lead.message], ['Page', lead.page], ['Submitted', lead.submitted_at],
  ];
  const ownerText = rows.map(([k, v]) => `${k}: ${v}`).join('\n');
  const ownerHtml = `<h2 style="font-family:Georgia,serif;font-weight:normal">New estimate request</h2>
<table cellpadding="6" style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">${rows
    .map(([k, v]) => `<tr><td style="color:#666;vertical-align:top"><b>${k}</b></td><td style="white-space:pre-wrap">${esc(v)}</td></tr>`)
    .join('')}</table>`;

  let ok = false;
  try {
    ok = await send({
      from: `Tom Bell Cabinetry Website <${env.FROM_EMAIL || 'website@tombellcabinetry.com'}>`,
      to: [owner],
      reply_to: lead.email,
      subject: `New estimate request: ${name}`,
      text: ownerText,
      html: ownerHtml,
    });
  } catch (e) {
    console.error('contact: resend unreachable', e && e.message);
    return done(false);
  }
  if (!ok) return done(false);

  // 2. Confirmation to the visitor. Never fails the submission.
  try {
    const first = lead.first_name || 'there';
    await send({
      from,
      to: [lead.email],
      reply_to: owner,
      subject: `Thank you, ${first} — we received your request`,
      text: confirmationText(first, lead),
      html: confirmationHtml(first, lead),
    });
  } catch (e) {
    console.error('contact: confirmation failed', e && e.message);
  }
  return done(true);
}

export const onRequestGet = () => new Response(null, { status: 405, headers: { allow: 'POST' } });

// ---------------------------------------------------------------------------
// Visitor confirmation email
// ---------------------------------------------------------------------------

const STEPS = [
  ['We reach out', 'A quick call or text to talk through the room, your wish list and timing.'],
  ['We measure and draw', 'We visit, measure and draw the space so nothing is left to guesswork.'],
  ['You get a clear price', 'A written quote, usually within a week of the first visit.'],
];

function confirmationText(first, lead) {
  return [
    `Thank you, ${first}.`,
    '',
    'We received your estimate request. Matt or a member of our team will review it and reach out, usually within one business day, to talk through your project and set up a time to measure.',
    '',
    'What happens next',
    ...STEPS.map(([t, d], i) => `${i + 1}. ${t} — ${d}`),
    '',
    'Your message',
    lead.message,
    '',
    `Need us sooner? Call or text ${PHONE}.`,
    '',
    'Tom Bell Cabinetry & Custom',
    'Shop in Madison, TN · Serving Nashville, Belle Meade, Brentwood, Franklin & Middle Tennessee',
    SITE,
  ].join('\n');
}

function confirmationHtml(first, lead) {
  const serif = "'Cormorant Garamond',Georgia,'Times New Roman',serif";
  const sans = "'Jost','Helvetica Neue',Helvetica,Arial,sans-serif";
  const ink = '#14110f', ivory = '#f2ece3', ivory2 = '#e8e0d4', stone = '#a89d8f', stoneD = '#5e554b', brass = '#c4a26b';

  const steps = STEPS.map(([t, d], i) => `
            <tr>
              <td style="padding:0 0 22px;vertical-align:top;width:44px;font-family:${serif};font-size:26px;line-height:26px;color:${brass};">0${i + 1}</td>
              <td style="padding:2px 0 22px;vertical-align:top;">
                <div style="font-family:${sans};font-size:15px;line-height:22px;font-weight:500;color:${ink};letter-spacing:.2px;">${t}</div>
                <div style="font-family:${sans};font-size:14px;line-height:22px;color:${stoneD};">${d}</div>
              </td>
            </tr>`).join('');

  const details = [lead.first_name && lead.last_name ? `${lead.first_name} ${lead.last_name}` : lead.first_name, lead.phone, lead.email]
    .filter(Boolean).map(esc).join('&nbsp;&nbsp;·&nbsp;&nbsp;');

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light only">
<title>We received your request</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500&family=Jost:wght@400;500&display=swap" rel="stylesheet">
<style>
  body{margin:0;padding:0;background:${ivory2};-webkit-text-size-adjust:100%;}
  table{border-collapse:collapse;}
  img{border:0;display:block;line-height:100%;}
  a{color:${ink};}
  @media (max-width:620px){
    .wrap{width:100%!important;}
    .pad{padding-left:24px!important;padding-right:24px!important;}
    .h1{font-size:32px!important;line-height:38px!important;}
  }
</style>
</head>
<body style="margin:0;padding:0;background:${ivory2};">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">We received your estimate request. Matt or a member of our team will reach out within one business day.&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${ivory2};">
  <tr>
    <td align="center" style="padding:32px 12px;">
      <table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:${ivory};">

        <!-- Masthead -->
        <tr>
          <td align="center" style="background:${ink};padding:34px 40px 30px;">
            <a href="${SITE}" style="text-decoration:none;">
              <img src="${SITE}/img/logo-rev.png" width="170" height="67" alt="Tom Bell Cabinetry &amp; Custom" style="width:170px;height:auto;margin:0 auto;">
            </a>
          </td>
        </tr>

        <!-- Hero -->
        <tr>
          <td style="background:${ink};">
            <img src="${SITE}/img/email-hero.jpg" width="600" height="400" alt="A custom kitchen built by Tom Bell Cabinetry" style="width:100%;max-width:600px;height:auto;">
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td class="pad" style="padding:48px 52px 8px;">
            <div style="font-family:${sans};font-size:11px;line-height:16px;letter-spacing:2.4px;text-transform:uppercase;color:${brass};padding-bottom:18px;">Estimate request received</div>
            <h1 class="h1" style="margin:0 0 20px;font-family:${serif};font-weight:400;font-size:40px;line-height:46px;color:${ink};">Thank you, ${esc(first)}.</h1>
            <p style="margin:0 0 18px;font-family:${sans};font-size:16px;line-height:27px;color:${stoneD};">We received your request. Matt or a member of our team will review it and reach out, usually within one business day, to talk through your project and set up a time to measure.</p>
            <p style="margin:0;font-family:${sans};font-size:16px;line-height:27px;color:${stoneD};">Need us sooner? Call or text <a href="${PHONE_HREF}" style="color:${ink};font-weight:500;text-decoration:none;border-bottom:1px solid ${brass};">${PHONE}</a>.</p>
          </td>
        </tr>

        <!-- Rule -->
        <tr>
          <td class="pad" style="padding:36px 52px 0;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr><td style="height:1px;line-height:1px;font-size:1px;background:${brass};">&nbsp;</td></tr></table>
          </td>
        </tr>

        <!-- Next steps -->
        <tr>
          <td class="pad" style="padding:34px 52px 8px;">
            <h2 style="margin:0 0 22px;font-family:${serif};font-weight:400;font-size:28px;line-height:34px;color:${ink};">What happens next</h2>
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">${steps}
            </table>
          </td>
        </tr>

        <!-- Your message -->
        <tr>
          <td class="pad" style="padding:8px 52px 40px;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:${ivory2};">
              <tr>
                <td style="padding:24px 26px;">
                  <div style="font-family:${sans};font-size:11px;line-height:16px;letter-spacing:2px;text-transform:uppercase;color:${stoneD};padding-bottom:10px;">Your message</div>
                  <div style="font-family:${serif};font-size:19px;line-height:29px;color:${ink};white-space:pre-wrap;">${esc(lead.message)}</div>
                  <div style="font-family:${sans};font-size:13px;line-height:20px;color:${stoneD};padding-top:14px;">${details}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td class="pad" align="center" style="padding:0 52px 52px;">
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="background:${ink};">
                  <a href="${PHONE_HREF}" style="display:inline-block;padding:17px 34px;font-family:${sans};font-size:13px;line-height:18px;letter-spacing:2px;text-transform:uppercase;color:${ivory};text-decoration:none;">Call or text ${PHONE}</a>
                </td>
              </tr>
            </table>
            <div style="padding-top:22px;font-family:${sans};font-size:14px;line-height:20px;color:${stoneD};">See our latest work on <a href="${INSTAGRAM}" style="color:${ink};font-weight:500;text-decoration:none;border-bottom:1px solid ${brass};">Instagram</a></div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td class="pad" align="center" style="background:${ink};padding:36px 52px 40px;">
            <div style="font-family:${serif};font-size:22px;line-height:28px;color:${ivory};padding-bottom:10px;">Tom Bell Cabinetry &amp; Custom</div>
            <div style="font-family:${sans};font-size:13px;line-height:21px;color:${stone};">Shop in Madison, TN<br>Serving Nashville, Belle Meade, Brentwood, Franklin &amp; Middle Tennessee</div>
            <div style="font-family:${sans};font-size:13px;line-height:21px;color:${stone};padding-top:14px;"><a href="${PHONE_HREF}" style="color:${ivory};text-decoration:none;">${PHONE}</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="mailto:sales@tombellcabinetry.com" style="color:${ivory};text-decoration:none;">sales@tombellcabinetry.com</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="${SITE}" style="color:${ivory};text-decoration:none;">tombellcabinetry.com</a></div>
            <div style="font-family:${sans};font-size:11px;line-height:18px;color:${stoneD};padding-top:22px;">You're receiving this because you requested an estimate at tombellcabinetry.com.</div>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}
