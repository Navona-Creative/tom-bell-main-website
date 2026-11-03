// Cloudflare Pages Function: POST /api/contact
// Replaces Gravity Forms + the GHL add-on. Sends each estimate request to:
//   1. GoHighLevel, via an Inbound Webhook trigger (env GHL_WEBHOOK_URL)  <- primary
//   2. Email, via Resend (env RESEND_API_KEY, LEAD_EMAIL_TO, LEAD_EMAIL_FROM) <- optional backup
// Set these in Cloudflare Pages > Settings > Variables and Secrets (Production + Preview).

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
    sms_marketing_consent: get('sms_marketing') === 'yes',
    sms_transactional_consent: get('sms_transactional') === 'yes',
    source: 'tombellcabinetry.com contact form',
    page: get('page') || '/contact/',
    submitted_at: new Date().toISOString(),
    ip: request.headers.get('cf-connecting-ip') || '',
  };
  if (!lead.email || !/^\S+@\S+\.\S+$/.test(lead.email) || !lead.phone || !lead.message) {
    return wantsJson ? json({ ok: false, error: 'missing_fields' }, 400) : done(false);
  }

  const jobs = [];
  if (env.GHL_WEBHOOK_URL) {
    jobs.push(fetch(env.GHL_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(lead),
    }).then((r) => r.ok));
  }
  if (env.RESEND_API_KEY && env.LEAD_EMAIL_TO) {
    const name = [lead.first_name, lead.last_name].filter(Boolean).join(' ') || 'Website visitor';
    const text = [
      `Name: ${name}`, `Email: ${lead.email}`, `Phone: ${lead.phone}`,
      `SMS marketing consent: ${lead.sms_marketing_consent ? 'Yes' : 'No'}`,
      `SMS updates consent: ${lead.sms_transactional_consent ? 'Yes' : 'No'}`,
      '', lead.message,
    ].join('\n');
    jobs.push(fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from: env.LEAD_EMAIL_FROM || 'Tom Bell Website <website@tombellcabinetry.com>',
        to: env.LEAD_EMAIL_TO.split(',').map((s) => s.trim()),
        reply_to: lead.email,
        subject: `New estimate request: ${name}`,
        text,
      }),
    }).then((r) => r.ok));
  }

  if (!jobs.length) {
    console.error('contact: no delivery configured (set GHL_WEBHOOK_URL and/or RESEND_API_KEY + LEAD_EMAIL_TO)');
    return done(false);
  }
  const results = await Promise.allSettled(jobs);
  const delivered = results.some((r) => r.status === 'fulfilled' && r.value === true);
  if (!delivered) console.error('contact: delivery failed', JSON.stringify(results));
  return done(delivered);
}

export const onRequestGet = () => new Response(null, { status: 405, headers: { allow: 'POST' } });
