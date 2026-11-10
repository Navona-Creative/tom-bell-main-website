// Cloudflare Pages Function: POST /api/designer
// Designer Partner Program signups from /designer-partners/.
// 1. Emails each signup to Matt through Resend (same setup as /api/contact).
// 2. Sends the designer a short branded confirmation (reply-to Matt).
// Uses the same Pages variables as contact.js: RESEND_API_KEY, TURNSTILE_SECRET_KEY, optional TO_EMAIL / FROM_EMAIL.

const SITE = 'https://tombellcabinetry.com';
const PHONE = '(615) 469-2781';
const PHONE_HREF = 'tel:+16154692781';

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

const esc = (v) => String(v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

export async function onRequestPost({ request, env }) {
  const wantsJson = (request.headers.get('accept') || '').includes('application/json');
  const done = (ok) =>
    wantsJson
      ? json({ ok }, ok ? 200 : 502)
      : Response.redirect(new URL(ok ? '/designer-partners/thank-you/' : '/designer-partners/?error=1#join', request.url), 303);

  let form;
  try { form = await request.formData(); } catch { return done(false); }
  const get = (k) => String(form.get(k) || '').trim().slice(0, 500);

  // Spam: honeypot filled -> act like success, send nothing.
  if (get('website')) return done(true);

  // Spam: Cloudflare Turnstile.
  if (env.TURNSTILE_SECRET_KEY) {
    const token = String(form.get('cf-turnstile-response') || '').trim();
    if (!token) return wantsJson ? json({ ok: false, error: 'captcha' }, 400) : done(false);
    try {
      const body = new FormData();
      body.append('secret', env.TURNSTILE_SECRET_KEY);
      body.append('response', token);
      const ip = request.headers.get('CF-Connecting-IP');
      if (ip) body.append('remoteip', ip);
      const v = await (await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body })).json();
      if (!v.success) {
        console.warn('designer: turnstile failed', JSON.stringify(v['error-codes'] || []));
        return wantsJson ? json({ ok: false, error: 'captcha' }, 400) : done(false);
      }
    } catch (e) {
      console.error('designer: turnstile unreachable', e && e.message);
      return done(false);
    }
  } else {
    console.error('designer: TURNSTILE_SECRET_KEY missing');
  }

  const p = {
    name: get('name'),
    company: get('company'),
    email: get('email'),
    phone: get('phone'),
    submitted_at: new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }) + ' CT',
  };
  if (!p.name || !p.company || !/^\S+@\S+\.\S+$/.test(p.email)) {
    return wantsJson ? json({ ok: false, error: 'missing_fields' }, 400) : done(false);
  }

  if (!env.RESEND_API_KEY) {
    console.error('designer: RESEND_API_KEY missing');
    return done(false);
  }
  const fromAddr = env.FROM_EMAIL || 'website@tombellcabinetry.com';
  const owner = env.TO_EMAIL || 'matt@tombellcabinetry.com';

  const send = async (payload) => {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) console.error('designer: resend error', res.status, await res.text());
    return res.ok;
  };

  // 1. Notify Matt.
  const rows = [
    ['Name', p.name], ['Company', p.company], ['Email', p.email], ['Phone', p.phone || '(not given)'],
    ['Submitted', p.submitted_at],
  ];
  let ok = false;
  try {
    ok = await send({
      from: `Tom Bell Cabinetry Website <${fromAddr}>`,
      to: [owner],
      reply_to: p.email,
      subject: `New Designer Partner signup: ${p.name}, ${p.company}`,
      text: ['New Designer Partner Program signup. Next step: schedule an intro call.', '', ...rows.map(([k, v]) => `${k}: ${v}`)].join('\n'),
      html: `<h2 style="font-family:Georgia,serif;font-weight:normal">New Designer Partner signup</h2>
<p style="font-family:Arial,sans-serif;font-size:14px">Next step: schedule an intro call.</p>
<table cellpadding="6" style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">${rows
        .map(([k, v]) => `<tr><td style="color:#666;vertical-align:top"><b>${k}</b></td><td>${esc(v)}</td></tr>`)
        .join('')}</table>`,
    });
  } catch (e) {
    console.error('designer: resend unreachable', e && e.message);
    return done(false);
  }
  if (!ok) return done(false);

  // 2. Confirmation to the designer. Never fails the submission.
  try {
    const first = p.name.split(/\s+/)[0];
    await send({
      from: `Tom Bell Cabinetry & Custom <${fromAddr}>`,
      to: [p.email],
      reply_to: owner,
      subject: `Welcome, ${first} — Tom Bell Designer Partner Program`,
      text: [
        `Thank you, ${first}.`,
        '',
        "We received your Designer Partner Program signup. We'll be in touch within one business day to schedule a quick intro call to learn about your clientele, your process, and whether we're a good fit.",
        '',
        `Need us sooner? Call or text ${PHONE}.`,
        '',
        'Tom Bell Cabinetry & Custom',
        SITE,
      ].join('\n'),
      html: confirmationHtml(first),
    });
  } catch (e) {
    console.error('designer: confirmation failed', e && e.message);
  }
  return done(true);
}

export const onRequestGet = () => new Response(null, { status: 405, headers: { allow: 'POST' } });

function confirmationHtml(first) {
  const serif = "'Cormorant Garamond',Georgia,'Times New Roman',serif";
  const sans = "'Jost','Helvetica Neue',Helvetica,Arial,sans-serif";
  const ink = '#14110f', ivory = '#f2ece3', ivory2 = '#e8e0d4', stone = '#a89d8f', stoneD = '#5e554b', brass = '#c4a26b';
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only">
<title>Welcome to the Designer Partner Program</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500&family=Jost:wght@400;500&display=swap" rel="stylesheet">
<style>body{margin:0;padding:0;background:${ivory2}}table{border-collapse:collapse}img{border:0;display:block}@media (max-width:620px){.wrap{width:100%!important}.pad{padding-left:24px!important;padding-right:24px!important}}</style>
</head>
<body style="margin:0;padding:0;background:${ivory2};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${ivory2};"><tr><td align="center" style="padding:32px 12px;">
<table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:${ivory};">
  <tr><td align="center" style="background:${ink};padding:34px 40px 30px;"><a href="${SITE}"><img src="${SITE}/img/logo-rev.png" width="170" height="67" alt="Tom Bell Cabinetry &amp; Custom" style="width:170px;height:auto;margin:0 auto;"></a></td></tr>
  <tr><td style="background:${ink};"><img src="${SITE}/img/email-hero.jpg" width="600" height="400" alt="A custom kitchen built by Tom Bell Cabinetry" style="width:100%;max-width:600px;height:auto;"></td></tr>
  <tr><td class="pad" style="padding:48px 52px 48px;">
    <div style="font-family:${sans};font-size:11px;letter-spacing:2.4px;text-transform:uppercase;color:${brass};padding-bottom:18px;">Designer Partner Program</div>
    <h1 style="margin:0 0 20px;font-family:${serif};font-weight:400;font-size:40px;line-height:46px;color:${ink};">Thank you, ${esc(first)}.</h1>
    <p style="margin:0 0 18px;font-family:${sans};font-size:16px;line-height:27px;color:${stoneD};">We received your signup. We'll be in touch within one business day to schedule a quick intro call to learn about your clientele, your process, and whether we're a good fit.</p>
    <p style="margin:0;font-family:${sans};font-size:16px;line-height:27px;color:${stoneD};">Need us sooner? Call or text <a href="${PHONE_HREF}" style="color:${ink};font-weight:500;text-decoration:none;border-bottom:1px solid ${brass};">${PHONE}</a>.</p>
  </td></tr>
  <tr><td class="pad" align="center" style="background:${ink};padding:36px 52px 40px;">
    <div style="font-family:${serif};font-size:22px;line-height:28px;color:${ivory};padding-bottom:10px;">Tom Bell Cabinetry &amp; Custom</div>
    <div style="font-family:${sans};font-size:13px;line-height:21px;color:${stone};">Shop in Madison, TN · Serving Nashville &amp; Middle Tennessee</div>
    <div style="font-family:${sans};font-size:13px;line-height:21px;color:${stone};padding-top:14px;"><a href="${PHONE_HREF}" style="color:${ivory};text-decoration:none;">${PHONE}</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="${SITE}" style="color:${ivory};text-decoration:none;">tombellcabinetry.com</a></div>
  </td></tr>
</table></td></tr></table>
</body></html>`;
}
