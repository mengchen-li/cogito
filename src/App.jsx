import { useState, useEffect, useRef } from "react";
import Demo from "./Demo";

// =============================================================================
// SHARED GLOBAL CSS (landing + demo, exported for Demo.jsx to import)
// =============================================================================
export const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;700&display=swap');

*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#050510;--s1:#0c0c1e;--s2:#111128;--s3:#08080f;--bd:#1e1e40;
  --tx:#f0f0f8;--tx2:#d4d4e8;--dm:#9898b8;--muted:#6a6a88;
  --g1:#00e87b;--g2:#00c4f0;--wm:#f5c842;--pk:#ff6b9d;--pp:#a78bfa;--cy:#00d9ff;
  --fd:'Instrument Serif',Georgia,serif;
  --fb:'Sora',sans-serif;
  --fm:'JetBrains Mono',monospace;
}
html{scroll-behavior:smooth}
html,body{background:var(--bg);color:var(--tx);font-family:var(--fb);-webkit-font-smoothing:antialiased}
body{overflow-x:hidden}
button{font-family:var(--fb)}
input,textarea{font-family:var(--fb)}
textarea:focus,button:focus,input:focus{outline:none}
::-webkit-scrollbar{width:6px;height:6px}::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:#1e1e40;border-radius:4px}::-webkit-scrollbar-thumb:hover{background:#2a2a55}
input::placeholder,textarea::placeholder{color:#444466}

/* LANDING */
nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:14px 44px;background:rgba(5,5,16,.8);backdrop-filter:blur(20px);border-bottom:1px solid rgba(30,30,64,.35)}
.nl{display:flex;align-items:center;text-decoration:none;cursor:pointer;background:none;border:none}
.nl svg{width:30px;height:30px}.nl span{font-size:17px;font-weight:700;color:var(--tx);letter-spacing:-.03em;margin-left:-1px}
.nr{display:flex;gap:24px;align-items:center}
.nr a,.nr button.nav-link{color:var(--dm);text-decoration:none;font-size:13px;font-weight:500;transition:color .3s;background:none;border:none;cursor:pointer;font-family:var(--fb)}
.nr a:hover,.nr button.nav-link:hover{color:var(--tx)}
.nr .cta{background:linear-gradient(135deg,var(--g1),var(--g2));color:#000;border-radius:8px;padding:8px 18px;font-weight:600;cursor:pointer;border:none}
.nr .cta:hover{box-shadow:0 4px 20px rgba(0,232,123,.3)}

.hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:100px 24px 50px;position:relative;overflow:hidden}
.hero-orbs{position:absolute;inset:0;pointer-events:none}
.hero-orbs div{position:absolute;border-radius:50%;filter:blur(100px)}
.ho1{width:600px;height:600px;background:rgba(0,232,123,.06);top:-15%;left:15%;animation:drift 25s ease-in-out infinite}
.ho2{width:450px;height:450px;background:rgba(0,196,240,.05);bottom:5%;right:10%;animation:drift 25s ease-in-out infinite reverse}
@keyframes drift{0%,100%{transform:translate(0,0)}33%{transform:translate(50px,-30px)}66%{transform:translate(-30px,40px)}}
.hero-badge{display:inline-flex;align-items:center;gap:8px;padding:7px 18px;border-radius:100px;background:rgba(0,232,123,.06);border:1px solid rgba(0,232,123,.15);font-size:11px;color:var(--g1);font-weight:600;letter-spacing:.08em;text-transform:uppercase;margin-bottom:28px;animation:fu .7s ease both}
.hero-badge i{width:6px;height:6px;border-radius:50%;background:var(--g1);display:inline-block;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
.hero h1{font-family:var(--fd);font-size:clamp(48px,8.5vw,96px);font-weight:400;line-height:1.02;margin-bottom:22px;animation:fu .7s ease .08s both}
.hero h1 em{font-style:italic;background:linear-gradient(135deg,var(--g1),var(--g2),var(--wm));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hero-p{font-size:clamp(15px,1.8vw,18px);color:var(--tx2);max-width:520px;line-height:1.75;margin-bottom:36px;font-weight:400;animation:fu .7s ease .16s both}
.hero-btns{display:flex;gap:12px;animation:fu .7s ease .24s both}
.bp{background:linear-gradient(135deg,var(--g1),var(--g2));color:#000;border:none;border-radius:10px;padding:14px 28px;font-family:var(--fb);font-size:15px;font-weight:700;cursor:pointer;text-decoration:none;transition:all .3s;display:inline-flex;align-items:center;gap:6px}
.bp:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,232,123,.3)}
.bs2{background:transparent;color:var(--tx);border:1px solid var(--bd);border-radius:10px;padding:14px 28px;font-family:var(--fb);font-size:15px;font-weight:500;cursor:pointer;text-decoration:none;transition:all .3s}
.bs2:hover{border-color:#555;background:rgba(255,255,255,.02)}
@keyframes fu{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}

.mq-w{padding:36px 0;border-top:1px solid var(--bd);border-bottom:1px solid var(--bd);overflow:hidden;position:relative}
.mq-w::before,.mq-w::after{content:'';position:absolute;top:0;bottom:0;width:100px;z-index:2}
.mq-w::before{left:0;background:linear-gradient(to right,var(--bg),transparent)}
.mq-w::after{right:0;background:linear-gradient(to left,var(--bg),transparent)}
.mq-label{text-align:center;font-size:11px;color:var(--g1);letter-spacing:.18em;text-transform:uppercase;margin-bottom:12px;font-weight:700}
.mq{display:flex;gap:10px;width:max-content}
.mq-a{animation:mql 50s linear infinite}.mq-b{animation:mqr 55s linear infinite;margin-top:10px}
@keyframes mql{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
@keyframes mqr{0%{transform:translateX(-50%)}100%{transform:translateX(0)}}
.mq span{padding:7px 16px;border-radius:100px;font-size:12px;white-space:nowrap;border:1px solid rgba(255,255,255,.06);color:var(--dm);background:rgba(255,255,255,.02);transition:all .3s}
.mq span:hover{color:var(--tx);background:rgba(0,232,123,.06);border-color:rgba(0,232,123,.2);transform:scale(1.06)}

section.lp-section{padding:100px 48px;max-width:1200px;margin:0 auto}
.sl{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--g1);font-weight:700;margin-bottom:10px}
.st{font-family:var(--fd);font-size:clamp(30px,4.2vw,48px);margin-bottom:14px;line-height:1.1;font-weight:400;color:var(--tx)}
.st em{font-style:italic;background:linear-gradient(135deg,var(--g1),var(--g2));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.sd{color:var(--tx2);font-size:15px;max-width:540px;line-height:1.75}

.why-sec{display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:start;padding:100px 48px;max-width:1200px;margin:0 auto;border-top:1px solid var(--bd);border-bottom:1px solid var(--bd)}
.why-copy .sl{margin-bottom:10px}.why-copy .st{margin-bottom:14px}.why-copy .sd{margin-bottom:20px}
.why-points{display:flex;flex-direction:column;gap:12px}
.wp{display:flex;gap:14px;align-items:flex-start;padding:16px 18px;border-radius:12px;background:var(--s1);border:1px solid var(--bd);transition:all .3s}
.wp:hover{border-color:rgba(0,232,123,.2);transform:translateX(4px)}
.wp-icon{width:36px;height:36px;border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px}
.wp h4{font-size:14px;font-weight:600;color:var(--tx);margin-bottom:2px}
.wp p{font-size:12.5px;color:var(--dm);line-height:1.5}

.ph-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:44px}
.ph{background:var(--s1);border:1px solid var(--bd);border-radius:14px;padding:26px 20px;transition:all .35s;position:relative;overflow:hidden}
.ph::after{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--g1),var(--g2));transform:scaleX(0);transition:transform .35s;transform-origin:left}
.ph:hover{border-color:rgba(0,232,123,.25);background:var(--s2)}.ph:hover::after{transform:scaleX(1)}
.ph-n{font-size:10px;font-weight:700;letter-spacing:.1em;color:var(--g2);text-transform:uppercase;font-family:var(--fm);margin-bottom:10px}
.ph h3{font-size:16px;font-weight:600;margin-bottom:5px;color:var(--tx)}
.ph p{font-size:12.5px;color:var(--dm);line-height:1.6}

.feat{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;margin-bottom:72px}
.feat:nth-child(even){direction:rtl}.feat:nth-child(even)>*{direction:ltr}
.feat-tag{display:inline-block;padding:4px 12px;border-radius:100px;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;margin-bottom:12px}
.ft1{background:rgba(255,107,157,.08);color:var(--pk)}.ft2{background:rgba(0,232,123,.08);color:var(--g1)}.ft3{background:rgba(245,200,66,.08);color:var(--wm)}.ft4{background:rgba(0,196,240,.08);color:var(--g2)}.ft5{background:rgba(167,139,250,.08);color:var(--pp)}.ft6{background:rgba(0,217,255,.08);color:#00d9ff}
.feat-h{font-family:var(--fd);font-size:clamp(24px,3vw,32px);margin-bottom:10px;font-weight:400;line-height:1.15;color:var(--tx)}
.feat-p{color:var(--tx2);font-size:14px;line-height:1.75}
.feat-vis{background:var(--s1);border:1px solid var(--bd);border-radius:16px;padding:28px;min-height:220px;display:flex;align-items:center;justify-content:center;transition:all .4s;overflow:hidden}
.feat-vis:hover{border-color:rgba(0,232,123,.15)}

.o-pills{display:flex;flex-wrap:wrap;gap:7px;justify-content:center}
.o-pill{padding:9px 16px;border-radius:10px;background:var(--s2);border:1px solid var(--bd);font-size:12px;color:var(--dm);transition:all .4s;cursor:default}
.o-pill:hover{transform:scale(1.06);border-color:var(--g1);color:var(--g1)}
.o-pill:nth-child(odd){border-color:rgba(0,232,123,.12);color:#7ec8a0;background:rgba(0,232,123,.03)}
.o-pill:nth-child(even){border-color:rgba(0,196,240,.12);color:#7ab8d0;background:rgba(0,196,240,.03)}
.o-pill:nth-child(3n){border-color:rgba(245,200,66,.12);color:#c8b870;background:rgba(245,200,66,.02)}

.pr-cards{display:grid;grid-template-columns:1fr 1fr;gap:8px;width:100%}
.pr-c{padding:14px;border-radius:10px;background:var(--s2);border:1px solid var(--bd);font-size:12px;color:var(--dm);line-height:1.5;transition:all .3s}
.pr-c.hi{border-color:var(--g1);color:var(--g1);background:rgba(0,232,123,.04)}
.pr-c:hover{border-color:rgba(0,232,123,.25)}
.pr-c strong{display:block;color:var(--tx);font-size:12.5px;margin-bottom:3px}

.inv-mock{width:100%;display:flex;flex-direction:column;gap:10px}
.inv-row{display:flex;gap:8px;align-items:center}
.inv-lbl{font-size:11px;color:var(--dm);width:70px;flex-shrink:0;text-align:right}
.inv-bar{display:flex;gap:6px;flex-wrap:wrap;flex:1}
.inv-btn{padding:7px 14px;border-radius:8px;background:var(--s2);border:1px solid var(--bd);font-size:11.5px;color:var(--dm);transition:all .3s;cursor:default}
.inv-btn.a{border-color:rgba(245,200,66,.25);color:var(--wm);background:rgba(245,200,66,.04)}
.inv-btn:hover{border-color:var(--wm);color:var(--wm)}

.rp-g{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;width:100%}
.rp-i{padding:14px 10px;border-radius:10px;background:var(--s2);border:1px solid var(--bd);text-align:center;transition:all .3s;cursor:default}
.rp-i:hover{border-color:rgba(0,232,123,.2);transform:translateY(-2px)}
.rp-i .ri{font-size:18px;margin-bottom:4px;display:block}
.rp-i .rn{font-size:11px;font-weight:600;color:var(--tx2)}

.ref-mock{width:100%;display:flex;flex-direction:column;gap:10px}
.ref-box{background:#08080f;border:1px solid var(--bd);border-radius:10px;padding:14px;font-size:12.5px;color:var(--tx2);line-height:1.6;font-style:italic}
.ref-ai{background:rgba(167,139,250,.04);border:1px solid rgba(167,139,250,.15);border-radius:10px;padding:14px;font-size:12.5px;color:var(--pp);line-height:1.6}

.ext-mock{width:100%;text-align:center}
.ext-nodes{display:flex;gap:6px;justify-content:center;align-items:center;flex-wrap:wrap}
.ext-n{padding:8px 14px;border-radius:8px;font-size:11px;font-weight:600;transition:all .3s}
.ext-n.done{background:rgba(0,232,123,.06);border:1px solid rgba(0,232,123,.2);color:var(--g1)}
.ext-n.now{background:linear-gradient(135deg,var(--g1),var(--g2));color:#000;border:none;transform:scale(1.08)}
.ext-n.next{background:var(--s2);border:1px solid var(--bd);color:var(--dm)}
.ext-arr{color:#333;font-size:14px}

.ways{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:40px}
.way{background:var(--s1);border:1px solid var(--bd);border-radius:16px;padding:32px 26px;transition:all .4s;transform-style:preserve-3d}
.way:hover{border-color:rgba(0,232,123,.2)}
.way .tag{display:inline-block;padding:4px 12px;border-radius:6px;font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;margin-bottom:12px}
.way:nth-child(1) .tag{background:rgba(0,232,123,.08);color:var(--g1)}
.way:nth-child(2) .tag{background:rgba(245,200,66,.08);color:var(--wm)}
.way h3{font-size:18px;font-weight:600;margin-bottom:6px;color:var(--tx)}
.way p{color:var(--tx2);font-size:13.5px;line-height:1.7}

.theory-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-top:40px}
.th-card{padding:20px;border-radius:12px;background:var(--s1);border:1px solid var(--bd);transition:all .4s;transform-style:preserve-3d}
.th-card:hover{border-color:rgba(0,232,123,.2)}
.th-name{font-size:14px;font-weight:600;color:var(--tx);margin-bottom:4px}
.th-cite{font-size:11px;color:var(--g1);font-family:var(--fm);margin-bottom:6px}
.th-desc{font-size:12.5px;color:var(--dm);line-height:1.6}
.th-more{margin-top:20px;text-align:center;font-size:13px;color:var(--dm);font-style:italic}

.aud-list{display:flex;flex-direction:column;gap:14px;margin-top:40px;max-width:700px}
.al{background:var(--s1);border:1px solid var(--bd);border-radius:14px;padding:24px 24px;display:flex;gap:18px;align-items:flex-start;transition:all .4s;transform-style:preserve-3d}
.al:hover{border-color:rgba(0,232,123,.2);transform:translateX(6px)}
.al-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;margin-top:6px}
.al h3{font-size:16px;font-weight:600;margin-bottom:3px;color:var(--tx)}
.al p{color:var(--tx2);font-size:13px;line-height:1.65}

.cta-s{text-align:center;padding:120px 48px;max-width:1200px;margin:0 auto;position:relative}
.cta-s::before{content:'';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(0,232,123,.05),transparent 60%);pointer-events:none}
.cta-s h2{font-family:var(--fd);font-size:clamp(34px,5vw,56px);margin-bottom:14px;font-weight:400}
.cta-s h2 em{font-style:italic;background:linear-gradient(135deg,var(--g1),var(--g2));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.cta-s>p{color:var(--tx2);font-size:16px;margin-bottom:28px}
.cta-btns{display:flex;gap:12px;justify-content:center}
footer.lp-footer{padding:32px 48px;text-align:center;border-top:1px solid var(--bd);max-width:1200px;margin:0 auto}
footer.lp-footer p{color:#555;font-size:11px}

.rv{opacity:0;transform:translateY(24px);transition:all .6s cubic-bezier(.4,0,.2,1)}
.rv.vis{opacity:1;transform:translateY(0)}
.d1{transition-delay:.08s}.d2{transition-delay:.16s}.d3{transition-delay:.24s}

.cs-ov{position:fixed;inset:0;z-index:2000;display:none;align-items:center;justify-content:center;background:rgba(5,5,16,.82);backdrop-filter:blur(14px);padding:24px;animation:csFade .3s ease both}
.cs-ov.on{display:flex}@keyframes csFade{from{opacity:0}to{opacity:1}}
.cs-m{background:linear-gradient(180deg,#0c0c1e,#080818);border:1px solid rgba(0,232,123,.18);border-radius:20px;padding:42px 38px 34px;max-width:460px;width:100%;position:relative;animation:csRise .45s cubic-bezier(.22,1,.36,1) both;box-shadow:0 30px 80px rgba(0,0,0,.6),0 0 80px rgba(0,232,123,.06)}
@keyframes csRise{from{opacity:0;transform:translateY(20px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}
.cs-x{position:absolute;top:14px;right:14px;width:30px;height:30px;border-radius:8px;background:transparent;border:1px solid transparent;color:var(--dm);cursor:pointer;font-size:18px;line-height:1;display:flex;align-items:center;justify-content:center;transition:all .2s}
.cs-x:hover{border-color:var(--bd);color:var(--tx);background:rgba(255,255,255,.03)}
.cs-tag{display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:100px;background:rgba(245,200,66,.08);border:1px solid rgba(245,200,66,.22);font-size:10.5px;color:var(--wm);font-weight:700;letter-spacing:.1em;text-transform:uppercase;margin-bottom:22px}
.cs-tag i{width:5px;height:5px;border-radius:50%;background:var(--wm);animation:pulse 2s infinite}
.cs-h{font-family:var(--fd);font-size:32px;font-weight:400;line-height:1.15;margin-bottom:14px;color:var(--tx)}
.cs-h em{font-style:italic;background:linear-gradient(135deg,var(--g1),var(--g2));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.cs-p{color:var(--tx2);font-size:14px;line-height:1.7;margin-bottom:26px}
.cs-btns{display:flex;flex-direction:column;gap:10px}
.cs-btns .bp,.cs-btns .bs2{width:100%;text-align:center;justify-content:center}

@media(max-width:900px){
  nav{padding:12px 20px}.nr a:not(.cta),.nr button.nav-link:not(.cta){display:none}
  section.lp-section,.why-sec{padding:80px 20px}
  .ph-grid,.ways,.theory-grid{grid-template-columns:1fr 1fr}
  .feat,.why-sec{grid-template-columns:1fr;gap:28px}
  .feat:nth-child(even){direction:ltr}
}
@media(max-width:600px){.ph-grid,.ways,.theory-grid{grid-template-columns:1fr}.pr-cards,.rp-g{grid-template-columns:1fr 1fr}}

/* DEMO ANIMATIONS */
@keyframes slideIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
@keyframes glow{0%,100%{box-shadow:0 0 18px rgba(0,232,123,.08)}50%{box-shadow:0 0 34px rgba(0,232,123,.18)}}
@keyframes orientInNext{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:translateX(0)}}
@keyframes orientInPrev{from{opacity:0;transform:translateX(-24px)}to{opacity:1;transform:translateX(0)}}
.fade-up{animation:fadeUp .4s ease-out both}
.orient-next{animation:orientInNext .28s ease both}
.orient-prev{animation:orientInPrev .28s ease both}

@keyframes confettiFall{0%{transform:translateY(-20px) rotate(0deg);opacity:0}10%{opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}
.confetti-wrap{position:fixed;inset:0;pointer-events:none;z-index:999;overflow:hidden}
.confetti-pc{position:absolute;top:-30px;width:10px;height:14px;border-radius:2px;animation:confettiFall linear forwards}

@keyframes completionGlow{0%,100%{box-shadow:0 0 0 1px rgba(0,232,123,.28),0 0 40px rgba(0,232,123,.15)}50%{box-shadow:0 0 0 1px rgba(0,232,123,.5),0 0 80px rgba(0,232,123,.3)}}
.completion-card{animation:completionGlow 3s ease-in-out infinite,fadeUp .6s ease-out both}

.secure-badge{display:flex;align-items:flex-start;gap:10px;padding:12px 14px;border-radius:10px;background:rgba(0,232,123,.04);border:1px solid rgba(0,232,123,.2);margin-bottom:14px}
.secure-badge svg{flex-shrink:0;color:var(--g1);margin-top:1px}
.secure-badge .st1{font-size:11.5px;font-weight:600;color:var(--g1);margin-bottom:3px;letter-spacing:.02em}
.secure-badge .st2{font-size:11.5px;color:var(--tx2);line-height:1.55}
`;

// =============================================================================
// SHARED LOGO
// =============================================================================
export function Logo({ size = 30 }) {
  const id = `lg-${size}`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" style={{ display: "block" }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="64" y2="64">
          <stop offset="0%" stopColor="#00e87b" />
          <stop offset="100%" stopColor="#00c4f0" />
        </linearGradient>
      </defs>
      <circle cx="28" cy="28" r="18" stroke={`url(#${id})`} strokeWidth="5" fill="none" strokeDasharray="85 28" strokeDashoffset="-8" strokeLinecap="round" />
      <circle cx="49" cy="20" r="7" stroke={`url(#${id})`} strokeWidth="3.5" fill="none" opacity="0.85" />
      <circle cx="44" cy="14" r="2" fill={`url(#${id})`} opacity="0.6" />
    </svg>
  );
}

// =============================================================================
// LANDING PAGE
// =============================================================================
function Landing({ goDemo }) {
  const [csOpen, setCsOpen] = useState(false);
  const revealRefs = useRef([]);
  const tiltRefs = useRef([]);
  const addRv = el => { if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el); };
  const addTilt = el => { if (el && !tiltRefs.current.includes(el)) tiltRefs.current.push(el); };

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("vis"); }),
      { threshold: 0.08 }
    );
    revealRefs.current.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const handlers = tiltRefs.current.map(card => {
      const onMove = e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(800px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) scale(1.02)`;
        card.style.transition = "transform .08s ease";
      };
      const onLeave = () => {
        card.style.transform = "perspective(800px) rotateY(0) rotateX(0) scale(1)";
        card.style.transition = "transform .4s ease";
      };
      card.addEventListener("mousemove", onMove);
      card.addEventListener("mouseleave", onLeave);
      return { card, onMove, onLeave };
    });
    return () => handlers.forEach(h => {
      h.card.removeEventListener("mousemove", h.onMove);
      h.card.removeEventListener("mouseleave", h.onLeave);
    });
  }, []);

  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") setCsOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = csOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [csOpen]);

  const scrollTo = id => e => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const phases = [
    { n: "01 Orient", h: "We learn about you", p: "Quick intake on your background, style, and comfort level. The AI calibrates the session to how your mind works." },
    { n: "02 Predict", h: "Commit to a guess", p: "Before any answer shows up, you write what you think will happen. This is where deep learning begins." },
    { n: "03 Investigate", h: "Test your ideas", p: "Run experiments, change variables, try alternatives. The sandbox is yours. The AI stands by in your preferred mode." },
    { n: "04 Represent", h: "See it your way", p: "Choose from multiple explanations: analogies, traces, diagrams, comparisons. Find the angle that makes it click." },
    { n: "05 Reflect", h: "Name what changed", p: "Write what you understand now. The AI asks one follow-up question to sharpen your thinking further." },
    { n: "06 Extend", h: "Take it somewhere new", p: "Apply the concept in a fresh context. If it transfers, you own it. Your concept map grows with each session." },
  ];

  const theories = [
    { n: "Productive Failure", c: "Kapur & Bielaczyc, 2012", d: "Learners who struggle with a problem before receiving instruction develop deeper understanding and stronger transfer than those who receive instruction first." },
    { n: "Knowledge Integration", c: "Linn et al., 2018", d: "Effective learning environments help students express, distinguish, and integrate their ideas rather than simply replacing wrong ideas with correct ones." },
    { n: "Self-Regulated Learning", c: "Järvelä et al., 2018", d: "Deep learning requires learners to monitor and regulate their own cognition, motivation, and emotions. Technology can prompt these metacognitive processes." },
    { n: "Conceptual Change", c: "diSessa, 2022", d: "Learners carry fragmented intuitions (p-prims) that are resources for instruction. Working with these intuitions is more effective than overriding them." },
    { n: "Multiple Representations", c: "Ainsworth, 2006", d: "Different representations make different aspects of a concept salient. Well-designed combinations support diverse cognitive, social, and affective processes." },
    { n: "Inquiry + Direct Instruction", c: "de Jong et al., 2023", d: "The strongest learning outcomes come from combining inquiry-based and direct instruction, with the timing adapted to learner characteristics." },
    { n: "Problem-Based Learning", c: "Hmelo-Silver et al., 2018", d: "Authentic, ill-structured problems activate prior knowledge and prepare learners for new information through the PBL tutorial cycle." },
    { n: "Adaptive Expertise", c: "Hatano & Oura, 2003", d: "The goal is flexible, innovative competence that transfers across contexts, as opposed to routine procedural efficiency." },
  ];

  const mq1 = ["Python","Data Structures","Algorithms","Machine Learning","Statistics","Linear Algebra","Organic Chemistry","Neuroscience","Philosophy","Music Theory","Economics","Quantum Physics","Architecture","Game Theory","Genetics","Linguistics","Cryptography","Art History"];
  const mq2 = ["Thermodynamics","Cognitive Science","Roman History","Topology","Rust","Calculus","Molecular Biology","Jazz Theory","Electromagnetism","Psychology","Blockchain","Astronomy","Nutrition","Ethics","Web Dev","SQL","Probability","Logic"];

  return (
    <>
      <nav>
        <button className="nl" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <Logo size={30} /><span>gito</span>
        </button>
        <div className="nr">
          <button className="nav-link" onClick={scrollTo("why")}>Why Cogito</button>
          <button className="nav-link" onClick={scrollTo("cycle")}>The cycle</button>
          <button className="nav-link" onClick={scrollTo("session")}>Inside a session</button>
          <button className="nav-link" onClick={scrollTo("theory")}>The science</button>
          <button className="nav-link" onClick={scrollTo("audience")}>Who it's for</button>
          <button className="cta" onClick={goDemo}>Try the demo</button>
        </div>
      </nav>

      <header className="hero" id="top">
        <div className="hero-orbs"><div className="ho1"></div><div className="ho2"></div></div>
        <div className="hero-badge"><i></i> Adaptive Learning Environment</div>
        <h1>I think, therefore<br /><em>I learn.</em></h1>
        <p className="hero-p">Upload any topic. Cogito builds a personalized session around your thinking. Predict first, explore freely, understand deeply.</p>
        <div className="hero-btns">
          <button className="bp" onClick={() => setCsOpen(true)}>Start a session &rarr;</button>
          <button className="bs2" onClick={scrollTo("cycle")}>See how it works</button>
        </div>
      </header>

      <div className="mq-w">
        <div className="mq-label">Any subject. Your pace.</div>
        <div className="mq mq-a">{[...mq1, ...mq1].map((t, i) => <span key={i}>{t}</span>)}</div>
        <div className="mq mq-b">{[...mq2, ...mq2].map((t, i) => <span key={i}>{t}</span>)}</div>
      </div>

      <div className="why-sec rv" ref={addRv} id="why">
        <div className="why-copy">
          <div className="sl">Why Cogito</div>
          <h2 className="st">Learning that works <em>with your brain</em></h2>
          <p className="sd" style={{ marginBottom: 20 }}>Most tools hand you the answer and move on. Cogito makes you think first. That one difference changes how deeply concepts stick, how flexibly you can apply them, and how much you remember a week later.</p>
        </div>
        <div className="why-points">
          <div className="wp"><div className="wp-icon" style={{ background: "rgba(0,232,123,.08)", color: "var(--g1)" }}>&#9672;</div><div><h4>Predict before you peek</h4><p>Committing to a guess before seeing the answer activates your prior knowledge and primes your brain for deeper processing.</p></div></div>
          <div className="wp"><div className="wp-icon" style={{ background: "rgba(0,196,240,.08)", color: "var(--g2)" }}>&#9881;</div><div><h4>AI that adapts to you</h4><p>The tutor adjusts tone, depth, and pacing based on your profile. Socratic questions for some, direct explanations for others.</p></div></div>
          <div className="wp"><div className="wp-icon" style={{ background: "rgba(245,200,66,.08)", color: "var(--wm)" }}>&#9733;</div><div><h4>See concepts from every angle</h4><p>Multiple representation styles for every idea. Pick the one that clicks, or try several to build richer mental models.</p></div></div>
          <div className="wp"><div className="wp-icon" style={{ background: "rgba(167,139,250,.08)", color: "var(--pp)" }}>&#10070;</div><div><h4>Reflection that refines</h4><p>Writing what you learned is powerful. Having an AI that probes the gaps in your explanation makes it transformative.</p></div></div>
        </div>
      </div>

      <section className="lp-section" id="cycle">
        <div className="sl rv" ref={addRv}>The Learning Cycle</div>
        <h2 className="st rv" ref={addRv}>Six phases of <em>active thinking</em></h2>
        <p className="sd rv" ref={addRv}>Every session follows the same cycle. You think first. You explore on your own terms. The AI meets you where you are.</p>
        <div className="ph-grid">
          {phases.map((ph, i) => (
            <div key={i} className={`ph rv ${i % 3 === 1 ? "d1" : i % 3 === 2 ? "d2" : ""}`} ref={addRv}>
              <div className="ph-n">{ph.n}</div>
              <h3>{ph.h}</h3>
              <p>{ph.p}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-section" id="session">
        <div className="sl rv" ref={addRv}>Inside a Session</div>
        <h2 className="st rv" ref={addRv}>What it feels like to <em>think with Cogito</em></h2>
        <p className="sd rv" ref={addRv} style={{ marginBottom: 56 }}>Each phase is designed to feel like a conversation with a sharp study partner who gives the answer at exactly the right moment.</p>

        <div className="feat rv" ref={addRv}>
          <div><span className="feat-tag ft1">Phase 1 &middot; Orient</span><div className="feat-h">The AI adapts to you before the first question</div><p className="feat-p">Cogito opens with a short intake: your experience level, how you prefer explanations, and what kind of feedback keeps you motivated. Every answer reshapes the AI's tone, pacing, and depth. You can update your profile anytime.</p></div>
          <div className="feat-vis"><div className="o-pills">{["Socratic questions","Step-by-step examples","Warm encouragement","Absolute beginner","Concise and direct","Metaphors first","Challenge me","Visual learner","I break things to learn"].map((t, i) => <div key={i} className="o-pill">{t}</div>)}</div></div>
        </div>

        <div className="feat rv" ref={addRv}>
          <div><span className="feat-tag ft2">Phase 2 &middot; Predict</span><div className="feat-h">The most powerful 30 seconds of the session</div><p className="feat-p">You see a new concept and commit to a guess before any explanation appears. Research shows this single act activates your prior knowledge, surfaces hidden assumptions, and creates a genuine desire to find out. Wrong guesses are often more valuable than right ones.</p></div>
          <div className="feat-vis"><div className="pr-cards"><div className="pr-c hi"><strong>Your prediction</strong>"I think the reaction will produce CO&#8322; because both inputs contain carbon."</div><div className="pr-c"><strong>Alternative A</strong>"The product will be water only."</div><div className="pr-c"><strong>Alternative B</strong>"Nothing will happen without a catalyst."</div><div className="pr-c"><strong>Write your own</strong>Free-text input for any prediction you have in mind.</div></div></div>
        </div>

        <div className="feat rv" ref={addRv}>
          <div><span className="feat-tag ft3">Phase 3 &middot; Investigate</span><div className="feat-h">Your sandbox, your experiments</div><p className="feat-p">Run the original scenario, then modify it. Change a variable, swap an input, test a hypothesis. The AI tutor is always available, responding in the style you chose during Orient. Predict first, then verify.</p></div>
          <div className="feat-vis"><div className="inv-mock">
            <div className="inv-row"><div className="inv-lbl">Scenario</div><div className="inv-bar"><div className="inv-btn a">Original</div><div className="inv-btn">Change input</div><div className="inv-btn">Remove step</div><div className="inv-btn">Add variable</div></div></div>
            <div className="inv-row"><div className="inv-lbl">AI mode</div><div className="inv-bar"><div className="inv-btn a">Socratic</div><div className="inv-btn">Direct</div><div className="inv-btn">Encouraging</div><div className="inv-btn">Challenging</div></div></div>
            <div style={{ textAlign: "center", fontSize: 11, color: "var(--dm)", marginTop: 6 }}>Modify anything. Run. Compare. Ask the AI.</div>
          </div></div>
        </div>

        <div className="feat rv" ref={addRv}>
          <div><span className="feat-tag ft4">Phase 4 &middot; Represent</span><div className="feat-h">Multiple angles on the same idea</div><p className="feat-p">A trace table clicks for analytical thinkers. An analogy clicks for intuitive ones. A diagram helps spatial minds. Cogito generates multiple representations for every concept and lets you choose the lens that fits.</p></div>
          <div className="feat-vis"><div className="rp-g"><div className="rp-i"><span className="ri" style={{ color: "var(--g1)" }}>&#9998;</span><span className="rn">Line-by-line</span></div><div className="rp-i"><span className="ri" style={{ color: "var(--g2)" }}>&#9638;</span><span className="rn">Trace table</span></div><div className="rp-i"><span className="ri" style={{ color: "var(--wm)" }}>&#9654;</span><span className="rn">Animation</span></div><div className="rp-i"><span className="ri" style={{ color: "var(--pk)" }}>&#10070;</span><span className="rn">Analogy</span></div><div className="rp-i"><span className="ri" style={{ color: "var(--pp)" }}>&#9733;</span><span className="rn">Concept map</span></div><div className="rp-i"><span className="ri" style={{ color: "#63b3ff" }}>&#8644;</span><span className="rn">Comparison</span></div></div></div>
        </div>

        <div className="feat rv" ref={addRv}>
          <div><span className="feat-tag ft5">Phase 5 &middot; Reflect</span><div className="feat-h">Say it in your own words</div><p className="feat-p">Write what you understand now. The AI reads your reflection, spots the gaps, and asks one follow-up question that pushes your explanation further. You refine your own understanding through dialogue.</p></div>
          <div className="feat-vis"><div className="ref-mock"><div className="ref-box">"Combustion requires both fuel and oxygen. The heat breaks molecular bonds, and the atoms recombine into CO&#8322; and H&#8322;O, releasing energy."</div><div className="ref-ai">Cogito asks: "You mentioned heat breaks bonds. Where does the initial energy come from to start the reaction? And once it starts, why does it keep going?"</div></div></div>
        </div>

        <div className="feat rv" ref={addRv}>
          <div><span className="feat-tag ft6">Phase 6 &middot; Extend</span><div className="feat-h">Transfer is the real test</div><p className="feat-p">A new challenge uses the same concept in a different context. If you can apply the idea to something you have never seen before, the understanding is yours. Your growing concept map tracks how ideas connect across sessions.</p></div>
          <div className="feat-vis"><div className="ext-mock"><div className="ext-nodes"><span className="ext-n done">Atoms</span><span className="ext-arr">&rarr;</span><span className="ext-n done">Bonds</span><span className="ext-arr">&rarr;</span><span className="ext-n now">Reactions</span><span className="ext-arr">&rarr;</span><span className="ext-n next">Equilibrium</span><span className="ext-arr">&rarr;</span><span className="ext-n next">Thermodynamics</span></div><div style={{ fontSize: 11, color: "var(--dm)", marginTop: 14 }}>Your concept map after this session</div></div></div>
        </div>
      </section>

      <section className="lp-section" id="ways">
        <div className="sl rv" ref={addRv}>Get Started</div>
        <h2 className="st rv" ref={addRv}>Pick a course or <em>bring your own</em></h2>
        <p className="sd rv" ref={addRv} style={{ marginBottom: 36 }}>Start with a structured lesson path, or upload anything and let Cogito build one for you.</p>
        <div className="ways">
          <div className="way rv" ref={el => { addRv(el); addTilt(el); }}><div className="tag">Curated Courses</div><h3>Jump into structured paths</h3><p>Python basics, organic chemistry, music theory, and more. Each course breaks a topic into small lessons built around the six-phase cycle. One concept at a time.</p></div>
          <div className="way rv d1" ref={el => { addRv(el); addTilt(el); }}><div className="tag">Upload Anything</div><h3>Turn any material into a session</h3><p>Paste a textbook chapter, a Wikipedia article, or your own notes. Cogito reads the content and generates predictions, experiments, and reflections.</p></div>
        </div>
      </section>

      <section className="lp-section" id="theory">
        <div className="sl rv" ref={addRv}>The Science Behind It</div>
        <h2 className="st rv" ref={addRv}>Grounded in <em>two decades of research</em></h2>
        <p className="sd rv" ref={addRv} style={{ marginBottom: 36 }}>Every design decision in Cogito traces back to peer-reviewed research in the Learning Sciences. Here are some of the core frameworks.</p>
        <div className="theory-grid">
          {theories.map((t, i) => (
            <div key={i} className={`th-card rv ${i % 2 ? "d1" : ""}`} ref={el => { addRv(el); addTilt(el); }}>
              <div className="th-name">{t.n}</div>
              <div className="th-cite">{t.c}</div>
              <div className="th-desc">{t.d}</div>
            </div>
          ))}
        </div>
        <div className="th-more rv" ref={addRv}>...and drawing from Constructionism (Papert), Cognitive Apprenticeship (Collins, Brown &amp; Newman), Metacognition (Flavell, Brown), scaffolding research (Kollar et al.), and more.</div>
      </section>

      <section className="lp-section" id="audience">
        <div className="sl rv" ref={addRv}>Who It's For</div>
        <h2 className="st rv" ref={addRv}>For anyone who wants to <em>actually understand</em></h2>
        <p className="sd rv" ref={addRv} style={{ marginBottom: 36 }}>Getting the answer is easy. Understanding why is the hard part. Cogito is for people who care about the why.</p>
        <div className="aud-list">
          <div className="al rv" ref={el => { addRv(el); addTilt(el); }}><div className="al-dot" style={{ background: "var(--g1)" }}></div><div><h3>Students</h3><p>Studying for exams, picking up a new subject, or filling gaps in understanding. Cogito builds knowledge from scratch with patience and structure.</p></div></div>
          <div className="al rv d1" ref={el => { addRv(el); addTilt(el); }}><div className="al-dot" style={{ background: "var(--g2)" }}></div><div><h3>Self-directed learners</h3><p>Tired of passive tutorials that vanish from memory the next day. Cogito makes you think before you receive, so concepts stick.</p></div></div>
          <div className="al rv d2" ref={el => { addRv(el); addTilt(el); }}><div className="al-dot" style={{ background: "var(--wm)" }}></div><div><h3>Educators and researchers</h3><p>Exploring how AI can scaffold deeper learning. Cogito is a working prototype grounded in Learning Sciences research and open to feedback.</p></div></div>
        </div>
      </section>

      <div className="cta-s" id="start">
        <h2 className="rv" ref={addRv}>Ready to <em>think?</em></h2>
        <p className="rv" ref={addRv}>Try a session. Pick a lesson or upload something of your own.</p>
        <div className="cta-btns rv" ref={addRv}>
          <button className="bp" onClick={goDemo}>Launch the demo &rarr;</button>
          <button className="bs2" onClick={scrollTo("cycle")}>Review the cycle</button>
        </div>
      </div>

      <footer className="lp-footer"><p>Cogito. Built by Mengchen at Penn GSE.</p></footer>

      <div className={`cs-ov${csOpen ? " on" : ""}`} onClick={e => { if (e.target === e.currentTarget) setCsOpen(false); }}>
        <div className="cs-m">
          <button className="cs-x" onClick={() => setCsOpen(false)} aria-label="Close">&times;</button>
          <div className="cs-tag"><i></i> Coming Soon</div>
          <h3 className="cs-h">Full sessions<br />are <em>launching soon</em></h3>
          <p className="cs-p">Personalized intake, your own uploaded materials, progress across sessions. Until then, try the interactive demo to feel the full six-phase cycle.</p>
          <div className="cs-btns">
            <button className="bp" onClick={() => { setCsOpen(false); goDemo(); }}>Try the interactive demo &rarr;</button>
            <button className="bs2" onClick={() => setCsOpen(false)}>Maybe later</button>
          </div>
        </div>
      </div>
    </>
  );
}

// =============================================================================
// ROOT APP WITH HASH-BASED ROUTING
// =============================================================================
export default function App() {
  const [page, setPage] = useState(() =>
    typeof window !== "undefined" && window.location.hash === "#demo" ? "demo" : "landing"
  );

  useEffect(() => {
    const onHash = () => {
      setPage(window.location.hash === "#demo" ? "demo" : "landing");
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const goDemo = () => { window.location.hash = "demo"; };
  const goHome = () => { window.location.hash = ""; };

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      {page === "demo" ? <Demo goHome={goHome} /> : <Landing goDemo={goDemo} />}
    </>
  );
}
