// Cloudflare Pages Function: POST /api/contact
// Emails each estimate request to Matt via the "tom-bell-contact-mailer" Worker
// (Cloudflare Email Service, sending as website@tombellcabinetry.com).
// The Worker is attached to this Pages project as the service binding MAILER
// (Pages > Settings > Bindings).

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

  if (!env.MAILER) {
    console.error('contact: MAILER service binding missing');
    return done(false);
  }
  try {
    const res = await env.MAILER.fetch('https://mailer/send', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(lead),
    });
    if (!res.ok) console.error('contact: mailer error', res.status, await res.text());
    return done(res.ok);
  } catch (e) {
    console.error('contact: mailer unreachable', e && e.message);
    return done(false);
  }
}

export const onRequestGet = () => new Response(null, { status: 405, headers: { allow: 'POST' } });
