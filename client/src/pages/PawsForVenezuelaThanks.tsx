import { Check, Heart, MessageCircle } from "lucide-react";
import { Link } from "wouter";

const CAMPAIGN_URL = "https://www.thewoofingoven.ie/paws-for-venezuela";
const SHARE_MESSAGE =
  "I just supported Paws for Venezuela, helping animals in need through Red de Apoyo Canino. Every little bit helps! 🇻🇪🐾 Join me here:";
const WHATSAPP_URL = `https://wa.me/?text=${encodeURIComponent(`${SHARE_MESSAGE} ${CAMPAIGN_URL}`)}`;

export default function PawsForVenezuelaThanks() {
  return (
    <main className="pvt-page">
      <style>{`
        .pvt-page{--ink:#2c2a29;--gold:#ffc56e;--cream:#fff8ec;--red:#cf4520;display:grid;min-height:100vh;place-items:center;overflow:hidden;background:radial-gradient(circle at 10% 15%,rgba(255,197,110,.48),transparent 35%),radial-gradient(circle at 90% 85%,rgba(207,69,32,.14),transparent 38%),var(--cream);color:var(--ink);font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:28px 16px;text-align:center}
        .pvt-card{width:min(100%,610px);padding:34px 22px;border:2px solid rgba(44,42,41,.1);border-radius:30px;background:rgba(255,255,255,.94);box-shadow:0 24px 70px rgba(44,42,41,.14)}
        .pvt-brand{display:block;width:160px;height:auto;margin:0 auto 22px}.pvt-check{display:flex;width:72px;height:72px;align-items:center;justify-content:center;margin:0 auto 20px;border-radius:50%;background:#c9f8df;color:#087a4b}
        .pvt-eyebrow{margin:0 0 8px;color:var(--red);font-family:var(--font-caps);font-size:.78rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.pvt-page h1{margin:0;font-size:clamp(2.8rem,12vw,5rem);line-height:.92;letter-spacing:-.035em}.pvt-lead{max-width:470px;margin:22px auto 12px;font-size:1.08rem;line-height:1.65}.pvt-note{display:flex;align-items:center;justify-content:center;gap:7px;margin:0 auto 28px;color:rgba(44,42,41,.68);font-size:.92rem}
        .pvt-share{margin:0 -4px 24px;padding:22px 16px;border-radius:20px;background:var(--cream)}.pvt-share h2{margin:0 0 7px;font-size:1.35rem}.pvt-share p{margin:0 0 16px;color:rgba(44,42,41,.7);font-size:.92rem;line-height:1.5}
        .pvt-button{display:flex;min-height:56px;align-items:center;justify-content:center;gap:9px;padding:14px 18px;border:2px solid var(--ink);border-radius:14px;background:var(--ink);box-shadow:0 6px 0 rgba(44,42,41,.18);color:#fff;font-weight:800;text-decoration:none;transition:transform .18s,box-shadow .18s}.pvt-button--whatsapp{border-color:#128c4b;background:#25d366;box-shadow:0 6px 0 #128c4b;color:#153d28}.pvt-button:hover{transform:translateY(-2px);box-shadow:0 8px 0 rgba(44,42,41,.18)}.pvt-button--whatsapp:hover{box-shadow:0 8px 0 #128c4b}.pvt-button:focus-visible,.pvt-home:focus-visible{outline:4px solid rgba(207,69,32,.3);outline-offset:3px}.pvt-home{display:inline-block;color:var(--ink);font-size:.9rem;font-weight:750;text-underline-offset:4px}
        @media(min-width:600px){.pvt-card{padding:42px 48px}.pvt-share{margin-inline:0;padding:24px}}
        @media(prefers-reduced-motion:reduce){.pvt-button{transition:none}}
      `}</style>

      <section className="pvt-card" aria-labelledby="thank-you-title">
        <img className="pvt-brand" src="/images/paws-for-venezuela/logo.png" alt="The Woofing Oven" />
        <div className="pvt-check" aria-hidden="true"><Check size={38} strokeWidth={3} /></div>
        <p className="pvt-eyebrow">Payment successful</p>
        <h1 id="thank-you-title">Thank you!</h1>
        <p className="pvt-lead">Your support means so much. Every contribution helps Red de Apoyo Canino care for animals in Venezuela who need food, shelter, and a little more love.</p>
        <p className="pvt-note"><Heart size={17} fill="#cf4520" color="#cf4520" /> Every little bit makes a difference.</p>

        <div className="pvt-share">
          <h2>Help us spread the word</h2>
          <p>Share Paws for Venezuela with friends and invite them to be part of it too.</p>
          <a className="pvt-button pvt-button--whatsapp" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={21} aria-hidden="true" /> Share on WhatsApp
          </a>
        </div>

        <Link className="pvt-home" href="/paws-for-venezuela">Back to Paws for Venezuela</Link>
      </section>
    </main>
  );
}
