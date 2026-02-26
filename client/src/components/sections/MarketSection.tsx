export function MarketSection() {
  return (
    <>
      <style>{`
        /* SECTION BACKGROUND + LAYOUT */
        .woofing-market-section {
          padding: 6rem 8vw;
          background: linear-gradient(135deg, #fff7d9, #ffe5ff);
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .woofing-market-container {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          gap: 4rem;
          align-items: flex-start;
          flex-wrap: wrap;
        }

        /* TEXT SIDE */
        .woofing-market-copy {
          flex: 1 1 400px;
          min-width: 350px;
        }

        .woofing-market-title {
          font-size: 3.2rem;
          line-height: 1.2;
          color: #3b145a;
          position: relative;
          display: inline-block;
          margin-bottom: 2rem;
        }

        /* SQUIGGLY UNDERLINE */
        .woofing-market-title::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -0.4rem;
          width: 100%;
          height: 8px;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='8'><path d='M0 5 Q 25 0 50 5 T 100 5 T 150 5 T 200 5' fill='transparent' stroke='%23ff9a1f' stroke-width='3' stroke-linecap='round'/></svg>");
          background-repeat: repeat-x;
          background-size: 60px 8px;
        }

        .woofing-market-intro {
          font-size: 1.4rem;
          line-height: 1.7;
          color: #4b2d63;
          margin-bottom: 1.8rem;
        }

        .woofing-market-subtitle {
          font-weight: 600;
          color: #3b145a;
          margin-bottom: 1rem;
          font-size: 1.2rem;
        }

        .woofing-market-list {
          list-style: none;
          padding: 0;
          margin: 0 0 2rem;
          color: #3b145a;
          font-size: 1.3rem;
        }

        .woofing-market-list li {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          margin-bottom: 0.8rem;
        }

        .woofing-market-outro {
          font-weight: 600;
          color: #3b145a;
          margin-top: 1rem;
          font-size: 1.3rem;
        }

        /* EMOJI ANIMATION */
        .market-emoji {
          display: inline-block;
          animation: emojiBounce 2.2s ease-in-out infinite;
        }
        @keyframes emojiBounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-3px) scale(1.05); }
        }

        /* PHOTO SIDE */
        .woofing-market-photo-wrap {
          flex: 0 1 480px;
          max-width: 480px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        /* FIXED PHOTO BOX — This prevents the giant stretching */
        .woofing-market-photo-box {
          width: 100% !important;
          max-width: 480px !important;
          aspect-ratio: 4/3;
          border-radius: 1.5rem;
          overflow: hidden;
          border: 3px dashed #ff9a1f;
          background: #fffdf6;
          box-shadow: 0 16px 30px rgba(0, 0, 0, 0.12);
          animation: photoFloat 4s ease-in-out infinite;
        }

        /* IMAGE INSIDE BOX */
        .market-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          border-radius: 1.5rem;
        }

        @keyframes photoFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        /* ARROW NOTE */
        .woofing-market-arrow-note {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 1rem;
          color: #3b145a;
        }

        .arrow-line {
          display: inline-block;
          font-size: 1.2rem;
          animation: arrowWiggle 1.8s ease-in-out infinite;
        }

        .arrow-text {
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        @keyframes arrowWiggle {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(3px); }
        }

        /* MOBILE */
        @media (max-width: 820px) {
          .woofing-market-container {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
      
      <section id="market" className="woofing-market-section">
        <div className="woofing-market-container">
          {/* TEXT SIDE */}
          <div className="woofing-market-copy">
            <h2 className="woofing-market-title">
              We're in Dún Laoghaire Every Sunday!
            </h2>
            <p className="woofing-market-intro">
              Each week, we bring <strong>The Woofing Oven</strong> to life at the Dún Laoghaire
              People's Park market. You'll find us surrounded by good vibes, happy dogs,
              and the smell of freshly baked treats — from Woofles to Pupcakes to custom
              Barkday goodies.
            </p>

            <p className="woofing-market-subtitle">Pop by for:</p>
            <ul className="woofing-market-list">
              <li><span className="market-emoji">🐾</span> Freshly baked natural treats</li>
              <li><span className="market-emoji">🎂</span> Cake orders & collections</li>
              <li><span className="market-emoji">🐶</span> Free sniffs and taste tests</li>
              <li><span className="market-emoji">💛</span> A quick chat with us (and a very excited Bella & Ben if they're on duty)</li>
            </ul>

            <p className="woofing-market-outro">
              Sundays are for wagging tails — come see us!
            </p>
          </div>

          {/* PHOTO SIDE */}
          <div className="woofing-market-photo-wrap">
            <div className="woofing-market-photo-box">
              <img
                src="https://i.ibb.co/3m2Hvhny/image-2.png"
                alt="The Woofing Oven Market Stall"
                className="market-photo"
              />
            </div>

            <div className="woofing-market-arrow-note">
              <span className="arrow-line">➜➜➜</span>
              <span className="arrow-text">We are unmissable!</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
