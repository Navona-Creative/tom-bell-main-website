// Cloudflare Pages Function: POST /api/contact
// Emails each estimate request to Matt through Resend (resend.com, free tier),
// sending as website@tombellcabinetry.com with Reply-To set to the visitor.
// Pages > Settings > Variables: RESEND_API_KEY (secret), optional TO_EMAIL / FROM_EMAIL.

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

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
  const name = [lead.first_name, lead.last_name].filter(Boolean).join(' ') || lead.email;
  const rows = [
    ['Name', name], ['Email', lead.email], ['Phone', lead.phone],
    ['Message', lead.message], ['Page', lead.page], ['Submitted', lead.submitted_at],
  ];
  const esc = (v) => v.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n');
  const html = `<h2 style="font-family:Georgia,serif;font-weight:normal">New estimate request</h2>
<table cellpadding="6" style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">${rows
    .map(([k, v]) => `<tr><td style="color:#666;vertical-align:top"><b>${k}</b></td><td style="white-space:pre-wrap">${esc(v)}</td></tr>`)
    .join('')}</table>`;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from: `Tom Bell Cabinetry Website <${env.FROM_EMAIL || 'website@tombellcabinetry.com'}>`,
        to: [env.TO_EMAIL || 'matt@tombellcabinetry.com'],
        reply_to: lead.email,
        subject: `New estimate request: ${name}`,
        text,
        html,
      }),
    });
    if (!res.ok) console.error('contact: resend error', res.status, await res.text());
    return done(res.ok);
  } catch (e) {
    console.error('contact: resend unreachable', e && e.message);
    return done(false);
  }
}

export const onRequestGet = () => new Response(null, { status: 405, headers: { allow: 'POST' } });
