import { ArrowDown, Check, ChevronDown, ExternalLink, Heart, ShieldCheck } from "lucide-react";

const PAYMENT_LINKS = {
  one: import.meta.env.VITE_PAWS_VENEZUELA_ONE_BISCUIT_URL?.trim() || "https://buy.stripe.com/6oUeVdfpm7UV07C3ZmafS00",
  two: import.meta.env.VITE_PAWS_VENEZUELA_TWO_BISCUITS_URL?.trim() || "https://buy.stripe.com/8x24gzb96grr07CcvSafS01",
  donation: import.meta.env.VITE_PAWS_VENEZUELA_DONATION_URL?.trim() || "https://donate.stripe.com/dRm28r1yw0stcUo9jGafS02",
};

const CAMPAIGN_INGREDIENTS = [
  "Apple",
  "Peanut butter",
  "Eggs",
  "Cider vinegar",
  "Oat flour",
];

type PaymentButtonProps = {
  href?: string;
  children: React.ReactNode;
  secondary?: boolean;
};

function PaymentButton({ href, children, secondary = false }: PaymentButtonProps) {
  const className = `pv-button ${secondary ? "pv-button--secondary" : ""}`;

  if (!href) {
    return (
      <span className={`${className} pv-button--disabled`} aria-disabled="true" title="Payment link coming soon">
        {children}<small>Payment link coming soon</small>
      </span>
    );
  }

  return (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer">
      {children}<ExternalLink aria-hidden="true" size={18} />
    </a>
  );
}

export default function PawsForVenezuela() {
  const linksReady = Boolean(PAYMENT_LINKS.one && PAYMENT_LINKS.two && PAYMENT_LINKS.donation);

  return (
    <main className="pv-page">
      <style>{`
        .pv-page{--ink:#2c2a29;--gold:#ffc56e;--cream:#fff8ec;--red:#cf4520;overflow:hidden;background:#fff;color:var(--ink);font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.65}
        .pv-page *{box-sizing:border-box}.pv-shell{width:min(100% - 32px,1040px);margin-inline:auto}.pv-section{padding:58px 0}.pv-section--cream{background:var(--cream)}
        .pv-brand{display:block;width:180px;height:auto;margin:0 auto 20px}.pv-hero{position:relative;padding:28px 0 56px;text-align:center;background:radial-gradient(circle at 10% 15%,rgba(255,197,110,.35),transparent 34%),radial-gradient(circle at 90% 85%,rgba(207,69,32,.12),transparent 35%),#fff8ec}
        .pv-eyebrow{margin:0 0 8px;color:var(--red);font-family:var(--font-caps);font-size:.78rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase}.pv-page h1,.pv-page h2,.pv-page h3{color:var(--ink)}.pv-page h1{max-width:720px;margin:0 auto;font-size:clamp(3rem,13vw,6.5rem);line-height:.9;letter-spacing:-.035em}.pv-subtitle{margin:13px 0 25px;font-family:var(--font-script);font-size:clamp(1.75rem,8vw,3rem);line-height:1;color:var(--red)}
        .pv-lead{max-width:720px;margin:0 auto 20px;font-size:1.05rem}.pv-instruction{max-width:690px;margin:0 auto 24px;padding:15px 17px;border:2px solid var(--gold);border-radius:18px;background:#fff;font-weight:750;line-height:1.45}.pv-actions{display:grid;gap:12px;max-width:520px;margin:0 auto}.pv-button{display:flex;min-height:56px;align-items:center;justify-content:center;gap:9px;padding:14px 18px;border:2px solid var(--ink);border-radius:14px;background:var(--ink);box-shadow:0 6px 0 rgba(44,42,41,.18);color:#fff;font-weight:800;line-height:1.2;text-align:center;text-decoration:none;transition:transform .18s cubic-bezier(.2,.8,.2,1),box-shadow .18s cubic-bezier(.2,.8,.2,1)}.pv-button:hover{transform:translateY(-2px);box-shadow:0 8px 0 rgba(44,42,41,.18)}.pv-button:active{transform:translateY(3px);box-shadow:0 2px 0 rgba(44,42,41,.18)}.pv-button:focus-visible{outline:4px solid rgba(207,69,32,.3);outline-offset:3px}.pv-button--secondary{background:#fff;color:var(--ink)}.pv-button--disabled{cursor:not-allowed;flex-wrap:wrap;opacity:.55;box-shadow:none}.pv-button--disabled small{display:block;width:100%;font-size:.7rem;font-weight:650}
        .pv-down{display:flex;width:42px;height:42px;align-items:center;justify-content:center;margin:28px auto 0;border-radius:50%;background:var(--gold);color:var(--ink)}.pv-section h2{margin:0 0 28px;font-size:clamp(2.3rem,10vw,4.3rem);line-height:.95;text-align:center}
        .pv-payment-grid{display:grid;gap:16px}.pv-payment-card{display:flex;min-height:245px;flex-direction:column;padding:24px;border:2px solid rgba(44,42,41,.12);border-radius:24px;background:#fff;text-align:center}.pv-payment-card--featured{border-color:var(--gold);background:linear-gradient(145deg,#fff,#fff8ec)}.pv-payment-card h3{margin:0;font-size:2rem;line-height:1}.pv-price{margin:12px 0 5px;font-family:var(--font-display);font-size:3.5rem;line-height:1}.pv-payment-card p:not(.pv-price){margin:0 0 22px;color:rgba(44,42,41,.65)}.pv-payment-card .pv-button{margin-top:auto}.pv-secure{display:flex;align-items:center;justify-content:center;gap:7px;margin:18px 0 0;color:rgba(44,42,41,.65);font-size:.82rem}.pv-config-warning{max-width:650px;margin:0 auto 20px;padding:12px 16px;border-radius:12px;background:#fff0ed;color:#7c2715;text-align:center;font-size:.86rem;font-weight:700}
        .pv-ingredients{max-width:620px;margin:24px auto 0;border:2px solid rgba(44,42,41,.12);border-radius:18px;background:#fff;overflow:hidden}.pv-ingredients summary{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:17px 20px;cursor:pointer;font-weight:800;list-style:none}.pv-ingredients summary::-webkit-details-marker{display:none}.pv-ingredients summary svg{flex:none;transition:transform .18s ease}.pv-ingredients[open] summary svg{transform:rotate(180deg)}.pv-ingredients__body{padding:0 20px 18px;border-top:1px solid rgba(44,42,41,.1);color:rgba(44,42,41,.72)}.pv-ingredients__body p{margin:15px 0 8px}.pv-ingredients__body ul{margin:0;padding-left:20px}.pv-allergen{font-size:.82rem;font-weight:650}
        .pv-copy{max-width:740px;margin:0 auto;text-align:center}.pv-copy p{margin:0 0 16px}.pv-highlight{font-weight:800}.pv-image{display:block;width:100%;max-width:620px;max-height:520px;object-fit:contain;margin:26px auto 0;border-radius:18px;background:#fff;box-shadow:0 22px 55px rgba(44,42,41,.12)}.pv-caption{max-width:620px;margin:12px auto 0;color:rgba(44,42,41,.62);font-size:.8rem;text-align:center}
        .pv-rac-grid{display:grid;gap:26px;align-items:center}.pv-rac-grid h2{text-align:left}.pv-rac-grid .pv-image{margin:0}.pv-rac-grid .pv-button{margin-top:20px}.pv-final{text-align:center;background:var(--gold)}.pv-final p{max-width:610px;margin:0 auto 24px;font-size:1.05rem}.pv-final .pv-actions{grid-template-columns:1fr}.pv-footer{padding:20px 16px;background:var(--ink);color:#fff;font-size:.76rem;text-align:center}
        @media(min-width:700px){.pv-section{padding:82px 0}.pv-hero{padding:36px 0 74px}.pv-actions--hero{grid-template-columns:1fr 1fr;max-width:720px}.pv-payment-grid{grid-template-columns:repeat(3,1fr)}.pv-rac-grid{grid-template-columns:.9fr 1.1fr}.pv-rac-grid>div:first-child{order:2}.pv-final .pv-actions{grid-template-columns:repeat(3,1fr);max-width:880px}}
        @media(prefers-reduced-motion:reduce){.pv-button{transition:none}}
      `}</style>

      <section className="pv-hero">
        <div className="pv-shell">
          <img className="pv-brand" src="/images/paws-for-venezuela/logo.png" alt="The Woofing Oven" />
          <p className="pv-eyebrow">A dog biscuit fundraiser</p>
          <h1>Paws for Venezuela 🇻🇪🐾</h1>
          <p className="pv-subtitle">Dog biscuits for a cause</p>
          <p className="pv-lead">Thank you for supporting Paws for Venezuela. These special decorated dog biscuits have been created by The Woofing Oven to help raise funds for Red de Apoyo Canino, an animal rescue organisation in Venezuela helping dogs and other animals in need.</p>
          <p className="pv-instruction">Select your donation, pay through the button below, then take your dog biscuit from the display.</p>
          <div className="pv-actions pv-actions--hero">
            <a className="pv-button" href="#payment-options">Select your donation <ArrowDown size={18} /></a>
            <a className="pv-button pv-button--secondary" href="#where-support-goes">Read more <ArrowDown size={18} /></a>
          </div>
          <a className="pv-down" href="#payment-options" aria-label="Choose your donation"><ArrowDown size={21} /></a>
        </div>
      </section>

      <section className="pv-section pv-section--cream" id="payment-options">
        <div className="pv-shell">
          <p className="pv-eyebrow" style={{textAlign:"center"}}>Please pay before taking your biscuit</p><h2>Choose your option</h2>
          {!linksReady && <p className="pv-config-warning">Campaign payment links are being connected. Payment buttons will activate as soon as the Stripe links are added.</p>}
          <div className="pv-payment-grid">
            <article className="pv-payment-card"><h3>1 Biscuit</h3><p className="pv-price">€3</p><p>One decorated dog biscuit</p><PaymentButton href={PAYMENT_LINKS.one}>Pay €3</PaymentButton></article>
            <article className="pv-payment-card pv-payment-card--featured"><h3>2 Biscuits</h3><p className="pv-price">€6</p><p>Two decorated dog biscuits</p><PaymentButton href={PAYMENT_LINKS.two}>Pay €6</PaymentButton></article>
            <article className="pv-payment-card"><h3>Choose your donation</h3><p className="pv-price" style={{fontSize:"2.45rem"}}>Your amount</p><p>Choose how much you would like to give</p><PaymentButton href={PAYMENT_LINKS.donation}>Make a donation</PaymentButton></article>
          </div>
          <details className="pv-ingredients">
            <summary>View biscuit ingredients <ChevronDown aria-hidden="true" size={20} /></summary>
            <div className="pv-ingredients__body">
              <p><strong>Thank you for your donation!</strong> Our Paws for Venezuela biscuits are made with:</p>
              <ul>{CAMPAIGN_INGREDIENTS.map((ingredient) => <li key={ingredient}>{ingredient}</li>)}</ul>
              <p className="pv-allergen">Contains peanuts, eggs and oats. Please ask a member of staff before taking a biscuit if your dog has allergies or dietary sensitivities.</p>
            </div>
          </details>
          <p className="pv-secure"><ShieldCheck size={16} /> Secure online payment powered by Stripe</p>
        </div>
      </section>

      <section className="pv-section" id="where-support-goes">
        <div className="pv-shell pv-copy"><h2>Where your support goes</h2><p><span className="pv-highlight">100% of the money raised from these Paws for Venezuela dog biscuits will be donated to Red de Apoyo Canino</span>, a Venezuelan animal rescue organisation helping animals in urgent need.</p><p>Thanks to our first Paws for Venezuela fundraising day, we raised €450, rounded it up to €500, and the full amount has already been sent to Red de Apoyo Canino.</p><img className="pv-image" loading="lazy" src="/images/paws-for-venezuela/transfer-confirmation.png" alt="Confirmation of the €500 transfer to Red de Apoyo Canino" /><p className="pv-caption">€500 already sent to Red de Apoyo Canino thanks to the support received during our first fundraising day.</p></div>
      </section>

      <section className="pv-section pv-section--cream"><div className="pv-shell pv-copy"><Heart aria-hidden="true" size={34} fill="#cf4520" color="#cf4520" style={{margin:"0 auto 16px"}}/><h2>Why this cause matters to us</h2><p>Some of you may not know that we are Venezuelan, and this cause is very close to our hearts.</p><p>We know there is a huge need for humanitarian help for people, but we also want to do our little part for the dogs being left behind — many without owners, without microchips, without names, and without anyone looking for them.</p><p className="pv-highlight">Every biscuit bought helps us send a little more support to the animals who need it.</p><img className="pv-image" loading="lazy" src="/images/paws-for-venezuela/biscuit-display.jpg" alt="Paws for Venezuela decorated paw-shaped dog biscuit in front of the campaign display" /></div></section>

      <section className="pv-section"><div className="pv-shell pv-rac-grid"><div><img className="pv-image" loading="lazy" src="/images/paws-for-venezuela/red-de-apoyo-canino.png" alt="Red de Apoyo Canino animal rescue work in Venezuela" /></div><div><h2>About Red de Apoyo Canino</h2><p>Red de Apoyo Canino is an animal rescue organisation in Venezuela helping dogs and other animals through rescue, food, care, and support.</p><a className="pv-button" href="https://www.instagram.com/reddeapoyocanino/" target="_blank" rel="noopener noreferrer">Follow on Instagram <ExternalLink size={18}/></a></div></div></section>

      <section className="pv-section pv-final"><div className="pv-shell"><Check size={38} strokeWidth={3} style={{margin:"0 auto 14px"}}/><h2>Ready to support?</h2><p>Choose your option below, pay securely online, and take your dog biscuit from the display <strong>after payment</strong>.</p><div className="pv-actions"><PaymentButton href={PAYMENT_LINKS.one} secondary>Pay €3 — 1 Biscuit</PaymentButton><PaymentButton href={PAYMENT_LINKS.two} secondary>Pay €6 — 2 Biscuits</PaymentButton><PaymentButton href={PAYMENT_LINKS.donation} secondary>Choose your donation</PaymentButton></div></div></section>
      <footer className="pv-footer">BrewDog is kindly hosting this display. Payments are handled directly by The Woofing Oven through Stripe.</footer>
    </main>
  );
}
