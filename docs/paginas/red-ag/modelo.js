/* ============ EL MODELO Y LAS SIMULACIONES (debajo de la red de problemas) ============
   Responde la guía de la sesión 18/11/2026 (puntos 2, 3 y 4): entorno y agentes, sistema multiagente, reglas, interacciones,
   modelo dinámico causal y las tres simulaciones (SIM-01 huertas y decisión, SIM-02 orgánicos y compostaje, SIM-03 hábitat y fauna).
   Las simulaciones corren aquí mismo con las ecuaciones de los gráficos G1–G16 (documento «Modelamiento dinámico y simulación»).
   Los valores marcados (S) en ese documento son supuestos para calibrar con la Mesa y con datos de campo. */
(function(){
'use strict';
const POP_K=1037929; // población de Kennedy 2024 (suma de las 12 UPZ, upz.json)
const LIM='#cfff5e',ESC_C={A:'#7a8480',B:'#dba73a',C:'#cfff5e'};
const fmt=(v,d=0)=>(+v).toLocaleString('es-CO',{maximumFractionDigits:d,minimumFractionDigits:d});
const el=(t,a={},h='')=>{const e=document.createElement(t);for(const k in a)e.setAttribute(k,a[k]);e.innerHTML=h;return e};
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/* íconos de línea (24 × 24), mismo trazo que el resto de la página */
const I={
 casa:'<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/>',
 persona:'<circle cx="12" cy="7" r="3.2"/><path d="M5 21v-1a7 7 0 0 1 14 0v1"/>',
 promotor:'<circle cx="9" cy="7" r="3"/><path d="M3 20v-1a6 6 0 0 1 10-4.5"/><path d="M17 12.5l1.4 2.8 3.1.4-2.3 2.1.6 3-2.8-1.5-2.8 1.5.6-3-2.3-2.1 3.1-.4z"/>',
 tienda:'<path d="M3 9l1.5-5h15L21 9"/><path d="M4 9v11h16V9"/><path d="M3 9h18"/><path d="M9 20v-6h6v6"/>',
 acopio:'<path d="M3 21V9l9-5 9 5v12"/><path d="M7 21v-8h10v8"/><path d="M7 17h10"/>',
 hongo:'<path d="M4 12a8 8 0 0 1 16 0z"/><path d="M10 12v6a2 2 0 0 0 4 0v-6"/>',
 asamblea:'<circle cx="12" cy="6" r="2.4"/><circle cx="5" cy="10" r="2"/><circle cx="19" cy="10" r="2"/><path d="M8 20a4 4 0 0 1 8 0"/><path d="M1.5 19a3.5 3.5 0 0 1 6-2.4"/><path d="M22.5 19a3.5 3.5 0 0 0-6-2.4"/>',
 inst:'<path d="M3 10l9-6 9 6"/><path d="M5 10v9M9 10v9M15 10v9M19 10v9"/><path d="M3 21h18"/>',
 basura:'<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 14h10l1-14"/><path d="M10 11v6M14 11v6"/>',
 camion:'<path d="M3 6h11v10H3z"/><path d="M14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.6"/><circle cx="17" cy="17.5" r="1.6"/>',
 ave:'<path d="M16 7h.01"/><path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20"/><path d="m20 7 2 .5-2 .5"/><path d="M10 18v3"/><path d="M14 17.75V21"/><path d="M7 18a6 6 0 0 0 3.84-10.61"/>',
 carro:'<path d="M5 17h14v-5l-2-5H7l-2 5z"/><path d="M5 12h14"/><circle cx="8" cy="17" r="1.6"/><circle cx="16" cy="17" r="1.6"/>',
 mercado:'<path d="M3 21V10l4-3 4 3 4-3 4 3 2 1v10"/><path d="M2 21h20"/><path d="M8 21v-5h8v5"/>',
 brote:'<path d="M12 21v-9"/><path d="M12 12c0-4-3-7-8-7 0 4 3 7 8 7z"/><path d="M12 14c0-3 2.5-6 7-6 0 3.5-2.5 6-7 6z"/>',
 hoja:'<path d="M5 19c0-9 6-14 15-14 0 9-5 15-14 15"/><path d="M5 19l8-8"/>',
 agua:'<path d="M2 8c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 6 0"/><path d="M2 13c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 6 0"/><path d="M2 18c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 6 0"/>',
 luz:'<path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z"/>',
 edificio:'<path d="M4 21V4h10v17"/><path d="M14 9h6v12"/><path d="M8 8h2M8 12h2M8 16h2M17 13h.01M17 17h.01"/><path d="M2 21h20"/>',
 via:'<path d="M5 21 9 3M19 21 15 3"/><path d="M12 6v2M12 11v2M12 16v2"/>',
 compost:'<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/><path d="M12 8c-2 2-2 5 0 8 2-3 2-6 0-8z"/>',
 reloj:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 peso:'<path d="M6 8h12l2 13H4z"/><circle cx="12" cy="5" r="2"/>',
 red:'<circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="M7 6h10M6 8l5 8M18 8l-5 8"/>',
 diana:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
 capas:'<path d="M12 3 2 8l10 5 10-5z"/><path d="M2 13l10 5 10-5"/>',
 regla:'<path d="M4 6h16M4 12h10M4 18h6"/><path d="M15 16l2 2 4-5"/>',
 flechas:'<path d="M4 8h13l-3-3"/><path d="M20 16H7l3 3"/>',
 play:'<path d="M7 4v16l13-8z"/>',
 pregunta:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7"/><path d="M12 17h.01"/>',
 politica:'<path d="M12 3v18"/><path d="M8 21h8"/><path d="M5 7h14"/><path d="M5 7l-3 7a3 3 0 0 0 6 0z"/><path d="M19 7l-3 7a3 3 0 0 0 6 0z"/>',
 sol:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
 candado:'<rect x="5" y="11" width="14" height="10" rx="1"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
 crece:'<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
 precio:'<path d="M12 2v20"/><path d="M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
 cubo:'<path d="M12 2 3 7v10l9 5 9-5V7z"/><path d="M3 7l9 5 9-5"/><path d="M12 12v10"/>',
 lupa:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/>',
 vidrio:'<rect x="4" y="3" width="16" height="18"/><path d="M8 13l4-4M10 17l6-6"/>'};
const ic=(k,s=18,c='')=>'<svg class="mi '+c+'" width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(I[k]||'')+'</svg>';
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- estilos ---------- */
const css=`
#modelo{position:relative;z-index:7;background:#050607;color:#eaefed;font-family:'Geist',ui-sans-serif,system-ui,sans-serif;border-top:1px solid rgba(214,228,222,.12);overflow:clip}
#modelo *{box-sizing:border-box}
#modelo .mw{max-width:1180px;margin:0 auto;padding:0 32px}
#modelo .blq{padding:96px 0 40px;border-bottom:1px solid rgba(214,228,222,.08)}
#modelo .ey{display:flex;align-items:center;gap:10px;font:500 10.5px 'Geist Mono',ui-monospace,monospace;letter-spacing:.2em;text-transform:uppercase;color:#7a8480}
#modelo .ey b{color:${LIM};font-weight:500}
#modelo h2,#modelo h3{font-family:'Barlow Condensed','Arial Narrow',sans-serif;font-weight:300;text-transform:uppercase;letter-spacing:.01em;line-height:.95;margin:0;text-wrap:balance}
#modelo h2{font-size:clamp(40px,6vw,84px);margin:14px 0 18px}
#modelo h3{font-size:clamp(24px,2.6vw,34px);margin:0 0 12px}
#modelo p{margin:0;color:#a9b3af;font-size:15px;line-height:1.6;max-width:68ch}
#modelo p em,#modelo li em{font-style:normal;color:#eaefed}
#modelo .lead{font-size:18px;color:#cfd6d3;max-width:60ch}
#modelo .dato{font:500 10px 'Geist Mono',ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase;color:#7a8480}
#modelo .g2{display:grid;grid-template-columns:1fr 1fr;gap:28px;margin-top:34px}
#modelo .g3{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:28px}
#modelo .caja{border:1px solid rgba(214,228,222,.12);padding:22px 22px 20px;background:rgba(214,228,222,.02);position:relative}
#modelo .caja::before{content:'';position:absolute;left:-1px;top:-1px;width:24px;height:2px;background:var(--c,${LIM})}
#modelo .caja ul{margin:12px 0 0;padding:0;list-style:none;display:grid;gap:8px}
#modelo .caja li{font-size:14px;line-height:1.45;color:#a9b3af;padding-left:16px;position:relative}
#modelo .caja li::before{content:'';position:absolute;left:0;top:.62em;width:6px;height:1px;background:var(--c,${LIM})}
#modelo .pregunta{margin-top:30px;padding:26px 28px;border-left:2px solid ${LIM};background:rgba(207,255,94,.04)}
#modelo .pregunta p{font-size:19px;line-height:1.5;color:#eaefed;max-width:none}
#modelo .pregunta .dato{display:block;margin-bottom:10px;color:${LIM}}
#modelo .links{display:flex;flex-wrap:wrap;gap:10px;margin-top:26px}
#modelo .btn{display:inline-flex;align-items:center;gap:8px;padding:12px 16px;border:1px solid rgba(214,228,222,.22);color:#eaefed;text-decoration:none;font:500 10.5px 'Geist Mono',ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase;transition:border-color .2s,color .2s,background .2s}
#modelo .btn:hover{border-color:${LIM};color:${LIM}}
#modelo .btn.pri{background:${LIM};color:#050607;border-color:${LIM}}#modelo .btn.pri:hover{background:#e2ff9e;color:#050607}
#modelo .btn:focus-visible,#modelo button:focus-visible,#modelo input:focus-visible{outline:2px solid ${LIM};outline-offset:2px}
/* tabla de agentes */
#modelo .tabla{width:100%;border-collapse:collapse;margin-top:26px;font-size:13.5px}
#modelo .tabla th{text-align:left;font:500 9.5px 'Geist Mono',ui-monospace,monospace;letter-spacing:.16em;text-transform:uppercase;color:#7a8480;padding:0 12px 10px;border-bottom:1px solid rgba(214,228,222,.22)}
#modelo .tabla td{padding:12px;border-bottom:1px solid rgba(214,228,222,.08);color:#a9b3af;vertical-align:top;line-height:1.45}
#modelo .tabla td:first-child{white-space:nowrap}
#modelo .tabla td b{color:#eaefed;font-weight:500}
#modelo .tp{display:inline-block;padding:3px 7px;font:500 9px 'Geist Mono',ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase;border:1px solid}
#modelo .tp.act{color:${LIM};border-color:rgba(207,255,94,.45)}#modelo .tp.pas{color:#a9b3af;border-color:rgba(214,228,222,.25)}
#modelo .scrollx{overflow-x:auto;-webkit-overflow-scrolling:touch}
/* reglas */
#modelo .reglas{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:1px;background:rgba(214,228,222,.1);border:1px solid rgba(214,228,222,.1);margin-top:28px}
#modelo .regla{background:#050607;padding:18px 18px 16px}
#modelo .regla .dato{color:${LIM}}
#modelo .regla h4{margin:8px 0 8px;font:500 15px 'Geist',sans-serif;color:#eaefed}
#modelo .regla code{display:block;font:400 11.5px/1.6 'Geist Mono',ui-monospace,monospace;color:#cfd6d3;white-space:pre-wrap}
#modelo .regla code i{font-style:normal;color:${LIM}}
/* diagramas */
#modelo .lienzo{margin-top:26px;border:1px solid rgba(214,228,222,.12);background:radial-gradient(ellipse at 50% 40%,rgba(207,255,94,.035),transparent 70%)}
#modelo .lienzo svg{display:block;width:100%;height:auto;min-width:760px}
#modelo svg text{font-family:'Geist',sans-serif}
#modelo .lazos{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}
#modelo .lazos button,#modelo .seg button,#modelo .tabs button{all:unset;cursor:pointer;box-sizing:border-box;padding:9px 12px;border:1px solid rgba(214,228,222,.22);font:500 10.5px 'Geist Mono',ui-monospace,monospace;letter-spacing:.1em;text-transform:uppercase;color:#a9b3af;transition:all .2s}
#modelo .lazos button:hover,#modelo .seg button:hover,#modelo .tabs button:hover{color:#eaefed;border-color:rgba(214,228,222,.42)}
#modelo .lazos button[aria-pressed=true]{color:#050607;background:var(--c);border-color:var(--c)}
#modelo .lazo-txt{margin-top:14px;min-height:3.2em;font-size:14.5px;color:#cfd6d3;max-width:80ch}
#modelo .lazo-txt b{color:var(--c,${LIM});font-weight:500}
#modelo #cld .car{transition:opacity .3s,stroke .3s}
#modelo #cld.foco .car{opacity:.12}#modelo #cld.foco .car.on{opacity:1}
#modelo #cld.foco .nd{opacity:.3}#modelo #cld.foco .nd.on{opacity:1}
#modelo #cld .nd{transition:opacity .3s}
#modelo .flujo{stroke-dasharray:4 6;animation:fluye 1.4s linear infinite}
@keyframes fluye{to{stroke-dashoffset:-20}}
@media(prefers-reduced-motion:reduce){#modelo .flujo{animation:none}}
/* simulaciones */
#modelo .tabs{display:flex;gap:0;margin-top:30px;border-bottom:1px solid rgba(214,228,222,.15);overflow-x:auto}
#modelo .tabs button{border:0;border-bottom:2px solid transparent;padding:14px 18px;white-space:nowrap}
#modelo .tabs button[aria-selected=true]{color:#eaefed;border-bottom-color:${LIM}}
#modelo .tabs button b{font-weight:500;color:${LIM};margin-right:8px}
#modelo .sim{display:none;padding-top:30px}#modelo .sim.on{display:block}
#modelo .simq{font-size:20px;line-height:1.45;color:#eaefed;max-width:70ch}
#modelo .simq .dato{display:block;color:${LIM};margin-bottom:8px}
#modelo .tablero{display:grid;grid-template-columns:300px 1fr;gap:28px;margin-top:28px;align-items:start}
#modelo .ctrl{position:sticky;top:20px;border:1px solid rgba(214,228,222,.12);padding:18px;background:rgba(214,228,222,.02)}
#modelo .ctrl h5{margin:0 0 10px;font:500 9.5px 'Geist Mono',ui-monospace,monospace;letter-spacing:.16em;text-transform:uppercase;color:#7a8480}
#modelo .seg{display:grid;gap:6px;margin-bottom:18px}
#modelo .seg button{display:flex;gap:10px;align-items:flex-start;text-transform:none;letter-spacing:0;font:400 12.5px/1.35 'Geist',sans-serif;padding:10px 11px}
#modelo .seg button i{flex:none;font:500 11px 'Geist Mono',monospace;font-style:normal;width:20px;height:20px;display:grid;place-items:center;border:1px solid var(--c);color:var(--c)}
#modelo .seg button[aria-pressed=true]{border-color:var(--c);color:#eaefed;background:color-mix(in srgb,var(--c) 9%,transparent)}
#modelo .seg button[aria-pressed=true] i{background:var(--c);color:#050607}
#modelo .sl{display:grid;grid-template-columns:1fr auto;gap:2px 10px;margin-bottom:13px}
#modelo .sl label{font-size:12.5px;color:#cfd6d3}
#modelo .sl output{font:500 11px 'Geist Mono',monospace;color:${LIM};text-align:right}
#modelo .sl input{grid-column:1/-1;width:100%;accent-color:${LIM};margin:4px 0 0;height:18px}
#modelo .chk{display:flex;align-items:center;gap:9px;font-size:12.5px;color:#cfd6d3;margin-bottom:8px;cursor:pointer}
#modelo .chk input{accent-color:#d4553f;width:15px;height:15px;margin:0}
#modelo .reset{all:unset;cursor:pointer;margin-top:6px;font:500 10px 'Geist Mono',monospace;letter-spacing:.12em;text-transform:uppercase;color:#7a8480;border-bottom:1px solid rgba(214,228,222,.25)}
#modelo .reset:hover{color:#eaefed}
#modelo .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:rgba(214,228,222,.1);border:1px solid rgba(214,228,222,.1)}
#modelo .kpis div{background:#050607;padding:14px 14px 12px;min-width:0}
#modelo .kpis b{display:block;font:300 clamp(24px,2.6vw,34px)/1 'Barlow Condensed',sans-serif;color:#eaefed;font-variant-numeric:tabular-nums}
#modelo .kpis span{display:block;margin-top:6px;font-size:11.5px;line-height:1.35;color:#7a8480}
#modelo .graf{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:18px}
#modelo .gf{border:1px solid rgba(214,228,222,.1);padding:14px 14px 8px;min-width:0}
#modelo .gf h6{margin:0 0 2px;font:500 12.5px 'Geist',sans-serif;color:#eaefed}
#modelo .gf h6 b{font:500 10px 'Geist Mono',monospace;color:${LIM};margin-right:6px}
#modelo .gf small{display:block;font:400 10.5px/1.4 'Geist Mono',monospace;color:#5d6663;margin-bottom:6px}
#modelo .gf svg{display:block;width:100%;height:auto}
#modelo .gf .ley{display:flex;flex-wrap:wrap;gap:10px;margin-top:4px;font:500 9.5px 'Geist Mono',monospace;letter-spacing:.06em;text-transform:uppercase;color:#7a8480}
#modelo .gf .ley i{display:inline-block;width:10px;height:2px;margin-right:5px;vertical-align:middle;background:var(--c)}
#modelo .lectura{margin-top:18px;padding:18px 20px;border:1px solid rgba(207,255,94,.25);background:rgba(207,255,94,.035)}
#modelo .lectura .dato{color:${LIM};display:block;margin-bottom:8px}
#modelo .lectura p{color:#dfe5e2;font-size:14.5px;max-width:none}
#modelo .lectura p+p{margin-top:8px}
#modelo details{margin-top:18px;border:1px solid rgba(214,228,222,.1)}
#modelo summary{cursor:pointer;padding:14px 16px;font:500 10.5px 'Geist Mono',monospace;letter-spacing:.14em;text-transform:uppercase;color:#a9b3af}
#modelo summary:hover{color:#eaefed}
#modelo details .tabla{margin:0 0 6px}
#modelo .rel{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:rgba(214,228,222,.1);border:1px solid rgba(214,228,222,.1);margin-top:18px}
#modelo .rel div{background:#050607;padding:16px}
#modelo .rel h6{margin:0 0 8px;font:500 9.5px 'Geist Mono',monospace;letter-spacing:.14em;text-transform:uppercase;color:${LIM}}
#modelo .rel p{font-size:13px;line-height:1.5}
#modelo .ref{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-top:26px}
#modelo .ref div{border-top:1px solid rgba(214,228,222,.22);padding-top:12px}
#modelo .ref b{display:block;font:500 13.5px 'Geist',sans-serif;color:#eaefed;margin-bottom:6px}
#modelo .ref p{font-size:13px;line-height:1.5}
#modelo .pie{padding:60px 0 90px}
.al-modelo{position:absolute;left:50%;bottom:86px;transform:translateX(-50%);pointer-events:auto;display:flex;flex-direction:column;align-items:center;gap:10px;font:500 10.5px 'Geist Mono',ui-monospace,monospace;letter-spacing:.22em;text-transform:uppercase;color:#a9b3af;text-decoration:none;padding:10px 14px;background:rgba(5,6,7,.7);border:1px solid rgba(214,228,222,.18)}
.al-modelo:hover{color:${LIM};border-color:rgba(207,255,94,.45)}
body.enmodelo header,body.enmodelo .legend,body.enmodelo .goprop,body.enmodelo #volver,body.enmodelo #panel,body.enmodelo #tip,body.enmodelo #lbls,body.enmodelo .hito{opacity:0!important;visibility:hidden!important;pointer-events:none!important}
/* íconos y movimiento */
#modelo .mi{flex:none;vertical-align:middle}
#modelo .gf h6 svg.mi,#modelo .kpis svg.mi{display:inline-block;width:16px;height:16px}#modelo .kpis svg.mi{width:18px;height:18px}
#modelo .ey .mi{color:${LIM}}
#modelo .hico{display:inline-grid;place-items:center;width:52px;height:52px;border:1px solid rgba(207,255,94,.35);color:${LIM};margin-bottom:6px;position:relative}
#modelo .hico::after{content:'';position:absolute;inset:-6px;border:1px solid rgba(207,255,94,.12)}
@media(prefers-reduced-motion:no-preference){#modelo .hico::after{animation:late 2.6s ease-out infinite}}
@keyframes late{0%{transform:scale(.85);opacity:1}100%{transform:scale(1.35);opacity:0}}
#modelo .caja .ci{display:grid;place-items:center;width:34px;height:34px;color:var(--c,${LIM});border:1px solid color-mix(in srgb,var(--c,${LIM}) 40%,transparent);margin-bottom:12px}
#modelo .caja li.i{padding-left:28px}#modelo .caja li.i::before{display:none}#modelo .caja li.i .mi{position:absolute;left:0;top:1px;color:var(--c,${LIM})}
#modelo .tabla td .ag{display:flex;align-items:center;gap:10px}#modelo .tabla td .ag .mi{color:#cfd6d3}
#modelo .tabla tr:has(.tp.act) td .ag .mi{color:${LIM}}
#modelo .regla .mi{color:${LIM};float:right;margin-top:-2px}
#modelo .tabs button .mi{margin-right:8px;color:#7a8480}#modelo .tabs button[aria-selected=true] .mi{color:${LIM}}
#modelo .sl label{display:flex;align-items:center;gap:7px}#modelo .sl label .mi{color:#7a8480}
#modelo .chk .mi{color:#ff8a75}
#modelo .gf h6{display:flex;align-items:center;gap:7px}#modelo .gf h6 .mi{color:${LIM};opacity:.85}
#modelo .kpis div{position:relative}#modelo .kpis .mi{position:absolute;right:12px;top:12px;color:${LIM};opacity:.7}
#modelo .rel h6{display:flex;align-items:center;gap:7px}
#modelo .ref b{display:flex;align-items:center;gap:8px}#modelo .ref b .mi{color:${LIM}}
#modelo .lectura .dato{display:flex;align-items:center;gap:7px}
#modelo .rv{opacity:0;transform:translateY(22px);transition:opacity .8s cubic-bezier(.2,.8,.2,1) var(--d,0s),transform .9s cubic-bezier(.2,.8,.2,1) var(--d,0s)}
#modelo .rv.vis{opacity:1;transform:none}
@media(prefers-reduced-motion:reduce){#modelo .rv{opacity:1;transform:none;transition:none}}
#modelo .gf svg.dib path.mln{stroke-dasharray:3000;stroke-dashoffset:3000;animation:dib 1.5s cubic-bezier(.3,.7,.2,1) forwards}
#modelo .gf svg.dib path.mar2{animation:aparece .9s ease both}
#modelo .gf svg.dib rect.mbr{transform-box:fill-box;transform-origin:bottom;animation:crece .9s cubic-bezier(.2,.8,.2,1) both}
#modelo .gf svg.dib circle{animation:aparece .4s 1.3s both}
@keyframes dib{to{stroke-dashoffset:0}}@keyframes aparece{from{opacity:0}}@keyframes crece{from{transform:scaleY(0)}}
@media(prefers-reduced-motion:reduce){#modelo .gf svg.dib *{animation:none!important;stroke-dashoffset:0!important}}
#modelo #cld .car.on path{stroke-width:2.2;stroke-dasharray:6 5;animation:fluye .9s linear infinite}
/* mini simulación animada (laboratorio) */
#modelo .lab{margin-top:34px;border:1px solid rgba(214,228,222,.12);position:relative;background:#07090a}
#modelo .lab canvas{display:block;width:100%;height:340px}
#modelo .lab .lbar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;padding:12px 14px;border-top:1px solid rgba(214,228,222,.1)}
#modelo .lab .lley{display:flex;flex-wrap:wrap;gap:12px}
#modelo .lab .lley span{display:flex;align-items:center;gap:6px;font:500 9.5px 'Geist Mono',monospace;letter-spacing:.08em;text-transform:uppercase;color:#a9b3af}
#modelo .lab .lley i{width:8px;height:8px;border-radius:50%;background:var(--c)}
#modelo .lab .lseg{display:flex}
#modelo .lab .lseg button{all:unset;cursor:pointer;padding:8px 12px;border:1px solid rgba(214,228,222,.22);font:500 10px 'Geist Mono',monospace;letter-spacing:.12em;text-transform:uppercase;color:#a9b3af}
#modelo .lab .lseg button+button{border-left:0}
#modelo .lab .lseg button[aria-pressed=true]{background:${LIM};color:#050607;border-color:${LIM}}
#modelo .lab .lcnt{position:absolute;left:14px;top:12px;display:grid;gap:4px;font:500 10px 'Geist Mono',monospace;letter-spacing:.08em;text-transform:uppercase;color:#7a8480;pointer-events:none}
#modelo .lab .lcnt b{color:#eaefed;font-weight:500}
/* videos del simulador */
#modelo .vids{display:grid;grid-template-columns:1.6fr 1fr;grid-template-rows:auto auto;gap:18px;margin-top:30px}
#modelo .vids figure{margin:0;border:1px solid rgba(214,228,222,.12);background:#07090a;position:relative}
#modelo .vids figure:first-child{grid-row:span 2}
#modelo .vids video{display:block;width:100%;height:auto;aspect-ratio:16/9;object-fit:cover;background:#0b0d0e}
#modelo .vids figcaption{padding:12px 14px 14px;font-size:13px;line-height:1.5;color:#a9b3af}
#modelo .vids figcaption b{display:flex;align-items:center;gap:7px;font:500 10px 'Geist Mono',monospace;letter-spacing:.14em;text-transform:uppercase;color:${LIM};margin-bottom:6px}
#modelo .vids .rec{position:absolute;left:12px;top:12px;display:flex;align-items:center;gap:6px;padding:4px 8px;background:rgba(5,6,7,.75);font:500 9px 'Geist Mono',monospace;letter-spacing:.14em;color:#eaefed}
#modelo .vids .rec i{width:7px;height:7px;border-radius:50%;background:#d4553f}
@media(prefers-reduced-motion:no-preference){#modelo .vids .rec i{animation:parp 1.2s steps(2) infinite}}
@keyframes parp{50%{opacity:.2}}
#modelo .chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
#modelo .chips span{display:inline-flex;align-items:center;gap:5px;padding:3px 7px;border:1px solid rgba(214,228,222,.18);font:500 9.5px 'Geist Mono',monospace;color:#cfd6d3}
#modelo .chips span em{color:${LIM}}
@media(max-width:900px){#modelo .vids{grid-template-columns:1fr}#modelo .vids figure:first-child{grid-row:auto}#modelo .lab canvas{height:300px}}
@media(max-width:900px){#modelo .tablero{grid-template-columns:1fr}#modelo .ctrl{position:static}#modelo .rel,#modelo .ref{grid-template-columns:1fr 1fr}}
@media(max-width:700px){#modelo .mw{padding:0 16px}#modelo .blq{padding:64px 0 30px}#modelo .g2,#modelo .g3,#modelo .graf{grid-template-columns:1fr}
 #modelo .kpis{grid-template-columns:1fr 1fr}#modelo .rel,#modelo .ref{grid-template-columns:1fr}#modelo .lead{font-size:16px}#modelo .pregunta{padding:18px}#modelo .pregunta p,#modelo .simq{font-size:16.5px}
 #modelo .tabla{font-size:12.5px}#modelo .tabla td:first-child{white-space:normal}.al-modelo{bottom:auto;top:188px;padding:7px 10px;font-size:9.5px;flex-direction:row}}
`;
document.head.appendChild(el('style',{},css));

/* ---------- contenido ---------- */
const AG=[
 ['act','Hogar cultivador','Producir, autoconsumir y vender el excedente','tipología de huerta, m², conocimiento, horas de trabajo','casa'],
 ['act','Promotor (formado en Bavaria)','Abrir y acompañar huertas','huertas acompañadas, carga','promotor'],
 ['act','Tienda o comedor','Abastecerse con regularidad y buen precio','surtido necesario, proveedor actual','tienda'],
 ['act','Bavaria Común · acopio rotativo','Acopiar y repartir','capacidad, inventario','acopio'],
 ['act','Bavaria Común · distrito de hongos','Convertir sustrato en proteína de hongos','sustrato recibido, inventario de proteína','hongo'],
 ['act','Asamblea de Bavaria y Mesa (gobierno rotativo)','Asignar espacios y normas','vocería actual, carga, conocimiento','asamblea'],
 ['act','Institución central (escenario B)','Decidir solicitudes','cola de solicitudes, capacidad de decisión','inst'],
 ['act','Generador de orgánicos (hogar o comercio)','Botar o separar sus residuos','kg por semana, ruta que usa','basura'],
 ['act','Operador de aseo','Recoger y llevar a disposición','ruta de recolección, destino final','camion'],
 ['act','Aves (garza, copetón, tingua)','Buscar hábitat, alimentarse, anidar','posición, parche ocupado, supervivencia','ave'],
 ['act','Vehículos y repartidores','Circular por la red vial','posición, ruta, carga','carro'],
 ['pas','Corabastos','Ninguno propio: fija oferta y precio exógenos (se reduce la dependencia, no se elimina)','precio, oferta','mercado'],
 ['pas','Parcela de huerta','Ninguno: soporte que produce','m², rendimiento','brote'],
 ['pas','Residuos orgánicos y producto en acopio','Ninguno: se mueven por reglas de otros','kg, días en acopio','hoja'],
 ['pas','Humedal y parches de hábitat','Ninguno: cambia su estado por la presión que recibe','calidad, tamaño, presión','agua'],
 ['pas','Amenazas: vidrios y luz nocturna','Ninguno: obstáculo','intensidad por edificio','vidrio'],
 ['pas','Edificios, vías, parques, agua','Soporte y obstáculo','geometría fija','edificio']];

const REG=[
 ['Hogar · PAR01 PAR02','Huerta','producción = m² × rendimiento × clima × calidad\nautoconsumo = producción × <i>PAR02</i>\nresto → acopio <i>hasta</i> su capacidad','brote'],
 ['R1 R2 R3','Apertura de huertas','<i>si</i> hay participantes, conocimiento (STK07),\nsuelo disponible (AUX01) y promotores (STK11)\n<i>entonces</i> abre: (p + q·activos/N)·(N − activos)','crece'],
 ['AUX04 AUX05','Cierre de huertas','<i>si</i> carga por persona > 1\n<i>entonces</i> sube la prob. de retiro\nh = h0·(1 + β·(carga − 1))\nla rotación de vocerías <i>baja</i> la carga','peso'],
 ['B2 · AUX02','Tienda o comedor','<i>compra local si</i> hay disponibilidad\ny el precio relativo frente a Corabastos conviene\nelige por precio, crédito, volumen, horario, confianza','tienda'],
 ['B5 · AUX07 AUX08','Promotor','acompaña hasta c = 1.000 m² (20 huertas)\n<i>si</i> se pasa → cae la calidad de manejo\ny suben los cierres','promotor'],
 ['B3 · FLO16','Humedal','<i>si</i> hay actividad en el borde → sube la presión\n<i>si</i> cesa → se recupera a la tasa kr','agua'],
 ['B4','Acopio','<i>si</i> se llena → sube la merma\ny cae el precio del excedente','acopio'],
 ['SIM-02','Estación de compostaje','recibe mín(fracción × generación; capacidad)\nmadura τ semanas → compost a huertas\nsustrato → distrito de hongos','compost'],
 ['SIM-03','Ave','se mueve al parche más cercano dentro de α\n<i>si</i> el parche tiene vidrio o luz → muere con prob. m\n(trampa ecológica: atractivo pero letal)','ave']];

/* nodos y flechas del modelo causal (x, y en un lienzo de 1200 × 730). Tipo: 0 acumulación (stock), 1 variable, 2 palanca de política */
const ND={
 cola:[290,80,'Espera por decisión',1],con:[630,80,'Conocimiento acumulado',0],hum:[950,95,'Presión sobre el humedal',1],comp:[1120,190,'Compost',1],
 rot:[95,180,'Rotación de vocerías',2],
 adop:[290,280,'Adopciones',1],part:[530,280,'Participantes',0],huer:[790,280,'Huertas activas (m²)',0],prod:[1050,280,'Producción',1],
 carga:[90,450,'Carga por persona',1],ret:[270,450,'Retiro',1],cal:[630,450,'Calidad de manejo',1],mpp:[870,450,'m² por promotor',1],exc:[1090,450,'Excedente al acopio',1],
 acop:[1090,545,'Ocupación del acopio',1],bav:[215,625,'Formación en Bavaria',2],prom:[470,625,'Promotores formados',0],tie:[850,625,'Compra local de tiendas',1],dep:[1090,640,'Dependencia de Corabastos',1],
 cora:[850,705,'Precio de Corabastos',1]};
// [desde, hasta, signo, curvatura, lazos]
const AR=[
 ['part','adop','+',.3,'R1'],['adop','part','+',.3,'R1 R2 R3'],
 ['part','huer','+',0,'R2 B5 B3'],['huer','con','+',.12,'R2'],['con','adop','+',.12,'R2'],
 ['bav','prom','+',0,'R3'],['part','prom','+',.1,'R3'],['prom','adop','+',.1,'R3'],
 ['huer','prod','+',0,'R4'],['prod','exc','+',0,'B4'],['exc','acop','+',.35,'B4'],['acop','exc','−',.35,'B4'],
 ['huer','mpp','+',0,'B5'],['prom','mpp','−',-.08,''],['mpp','cal','−',0,'B5'],['cal','ret','−',0,'B5'],['ret','part','−',.08,'B5 B1'],
 ['carga','ret','+',0,'B1'],['rot','carga','−',0,'B1'],
 ['adop','cola','+',.3,'B6'],['cola','adop','−',.3,'B6'],['rot','cola','−',0,''],
 ['huer','hum','+',.22,'B3'],['hum','huer','−',.22,'B3'],
 ['exc','tie','+',.08,'B2'],['tie','cora','−',.4,'B2'],['cora','tie','+',.4,'B2'],['tie','dep','−',0,''],
 ['prod','comp','+',.3,'R4'],['comp','prod','+',.3,'R4']];
const LAZ={
 R1:['#cfff5e','R1 · Contagio','Cada persona que cultiva convence a otras: más participantes → más adopciones → más participantes (término q·activos/N de la curva de Bass).'],
 R2:['#a3b845','R2 · Conocimiento','Las huertas acumulan saber práctico (STK07) que hace más fácil abrir huertas nuevas.'],
 R3:['#8fe7f2','R3 · Formación','Bavaria forma promotores entre los propios participantes; los promotores abren huertas (p = cupos × alcance ÷ N).'],
 B1:['#d4553f','B1 · Carga','La carga sube con los m² que cuida cada persona y con las vocerías largas; con carga > 1 aumenta el retiro y quedan menos manos. La rotación de vocerías la alivia.'],
 B5:['#ee8a45','B5 · Saturación','Si cada promotor acompaña más de c = 1.000 m², cae la calidad de manejo, baja la producción y suben los cierres.'],
 B6:['#d9bf6e','B6 · Cola de decisión','Más solicitudes alargan la espera para decidir; la espera frena nuevas adopciones. Una institución central se satura; varias asambleas no.'],
 B3:['#5fb8a8','B3 · Humedal','La actividad de las huertas en el borde presiona el humedal; la presión restringe dónde se puede abrir huerta.'],
 B4:['#dba73a','B4 · Acopio','Si el excedente llena el acopio sube la merma y cae el precio: se vende menos de lo que se produce.'],
 B2:['#a77b5a','B2 · Precio de la central','Si las tiendas compran local, Corabastos reacciona bajando el precio y recupera parte de la compra (dependencia que baja sin eliminarse).'],
 R4:['#b4e07a','R4 · Suelo vivo (SIM-02)','La producción deja residuo vegetal; compostado vuelve como fertilidad y sube el rendimiento.']};

function cld(){
 const W=1200,H=730,curva=(a,b,k)=>{const[x1,y1]=a,[x2,y2]=b,mx=(x1+x2)/2,my=(y1+y2)/2,dx=x2-x1,dy=y2-y1;return[mx-dy*k,my+dx*k]};
 const caja=n=>{const[x,y,t,tipo]=ND[n];const w=Math.max(96,t.length*7.1+26);return{x,y,w,h:tipo===0?40:28,t,tipo}};
 // recorta la curva en el borde de la caja
 const borde=(c,px,py)=>{const dx=px-c.x,dy=py-c.y,sx=(c.w/2+6)/Math.abs(dx||1e-6),sy=(c.h/2+6)/Math.abs(dy||1e-6),s=Math.min(sx,sy);return[c.x+dx*s,c.y+dy*s]};
 let s='<svg id="cld" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Diagrama causal del modelo"><defs>';
 s+='<marker id="fl" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 1L10 5L0 9z" fill="context-stroke"/></marker></defs>';
 AR.forEach(([a,b,sg,k,lz],i)=>{const A=caja(a),B=caja(b),[cx,cy]=curva([A.x,A.y],[B.x,B.y],k),p1=borde(A,cx,cy),p2=borde(B,cx,cy);
  const tx=.25*p1[0]+.5*cx+.25*p2[0],ty=.25*p1[1]+.5*cy+.25*p2[1],ex=p2[0]+(cx-p2[0])*.18,ey=p2[1]+(cy-p2[1])*.18,neg=sg!=='+';
  s+='<g class="car" data-l="'+lz+'"><path d="M'+p1[0].toFixed(1)+' '+p1[1].toFixed(1)+'Q'+cx.toFixed(1)+' '+cy.toFixed(1)+' '+p2[0].toFixed(1)+' '+p2[1].toFixed(1)+'" fill="none" stroke="'+(neg?'#d4553f':'#7a8480')+'" stroke-width="1.3" marker-end="url(#fl)"/>'+
   '<circle cx="'+ex.toFixed(1)+'" cy="'+ey.toFixed(1)+'" r="7.5" fill="#050607" stroke="'+(neg?'#d4553f':'#4a524f')+'"/><text x="'+ex.toFixed(1)+'" y="'+(ey+3.8).toFixed(1)+'" text-anchor="middle" font-size="11" font-weight="600" fill="'+(neg?'#ff8a75':'#cfd6d3')+'">'+sg+'</text></g>'});
 Object.keys(ND).forEach(n=>{const c=caja(n),st=c.tipo===0,ex=c.tipo===2;const lz=Object.keys(LAZ).filter(L=>AR.some(a=>(a[0]===n||a[1]===n)&&a[4].split(' ').includes(L))).join(' ');
  s+='<g class="nd" data-n="'+n+'" data-l="'+lz+'"><rect x="'+(c.x-c.w/2)+'" y="'+(c.y-c.h/2)+'" width="'+c.w+'" height="'+c.h+'" fill="'+(st?'rgba(207,255,94,.08)':'#050607')+'" stroke="'+(st?LIM:ex?'#7a8480':'rgba(214,228,222,.3)')+'" '+(ex?'stroke-dasharray="3 3"':'')+' stroke-width="'+(st?1.4:1)+'"/>'+
   '<text x="'+c.x+'" y="'+(c.y+4.5)+'" text-anchor="middle" font-size="'+(st?14:12.5)+'" fill="'+(st?'#eaefed':'#cfd6d3')+'" font-weight="'+(st?500:400)+'">'+esc(c.t)+'</text></g>'});
 // entradas externas (estreses de los escenarios)
 // [x, y del texto, texto, destino, anclaje, x e y de donde sale la línea]
 const ext=[[720,24,'Valorización del suelo','huer','middle',730,30],[1190,365,'Sequía','prod','end',1150,370],[600,709,'Bloqueo del mayorista','cora','middle',690,705],[1190,722,'Crecimiento poblacional','dep','end',1100,710]];
 ext.forEach(([x,y,t,to,an,lx,ly])=>{const B=caja(to),[px,py]=borde(B,lx,ly);s+='<g class="ext"><line x1="'+lx+'" y1="'+ly+'" x2="'+px.toFixed(1)+'" y2="'+py.toFixed(1)+'" stroke="#d4553f" stroke-width="1" class="flujo" opacity=".6"/><text x="'+x+'" y="'+y+'" text-anchor="'+an+'" font-size="10.5" fill="#ff8a75" font-family="Geist Mono,monospace" letter-spacing="1">'+t.toUpperCase()+'</text></g>'});
 return s+'</svg>'}

/* ---------- motor de gráficos (SVG livianos) ---------- */
let ANIM=false;
function linea(box,{series,T,ymax,ymin=0,yf=v=>fmt(v),xf=t=>t,xt,area}){
 const W=360,H=180,L=44,R=12,Tp=12,B=24,iw=W-L-R,ih=H-Tp-B;let mx=ymax;if(mx==null){mx=0;series.forEach(s=>s.y.forEach(v=>{if(v>mx)mx=v}));if(area)for(let i=0;i<T;i++){let a=0;area.forEach(x=>a+=x.y[i]);if(a>mx)mx=a}mx=mx*1.1||1}
 const X=t=>L+t/(T-1)*iw,Y=v=>Tp+ih-(v-ymin)/(mx-ymin)*ih;let s='<svg viewBox="0 0 '+W+' '+H+'" role="img" class="'+(ANIM?'dib':'')+'">';
 for(let k=0;k<=3;k++){const v=ymin+(mx-ymin)*k/3,y=Y(v);s+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+y+'" y2="'+y+'" stroke="rgba(214,228,222,'+(k?'.07':'.22')+')"/><text x="'+(L-6)+'" y="'+(y+3.5)+'" text-anchor="end" font-size="9.5" fill="#5d6663" font-family="Geist Mono,monospace">'+yf(v)+'</text>'}
 (xt||[]).forEach(t=>{s+='<text x="'+X(t)+'" y="'+(H-6)+'" text-anchor="middle" font-size="9.5" fill="#5d6663" font-family="Geist Mono,monospace">'+xf(t)+'</text>'});
 if(area){let base=new Array(T).fill(0);area.forEach(a=>{let d='M'+X(0)+' '+Y(base[0]);const top=a.y.map((v,i)=>base[i]+v);for(let i=0;i<T;i+=2)d+='L'+X(i).toFixed(1)+' '+Y(top[i]).toFixed(1);d+='L'+X(T-1)+' '+Y(top[T-1]);for(let i=T-1;i>=0;i-=2)d+='L'+X(i).toFixed(1)+' '+Y(base[i]).toFixed(1);d+='L'+X(0)+' '+Y(base[0])+'Z';s+='<path class="mar2" d="'+d+'" fill="'+a.c+'" opacity="'+(a.o||.75)+'"/>';base=top})}
 series.forEach(sr=>{let d='';for(let i=0;i<T;i+=(T>300?2:1))d+=(d?'L':'M')+X(i).toFixed(1)+' '+Y(Math.max(ymin,Math.min(mx,sr.y[i]))).toFixed(1);d+='L'+X(T-1).toFixed(1)+' '+Y(Math.max(ymin,Math.min(mx,sr.y[T-1]))).toFixed(1);
  s+='<path '+(sr.dash?'':'class="mln" ')+'d="'+d+'" fill="none" stroke="'+sr.c+'" stroke-width="'+(sr.w||1.4)+'" '+(sr.dash?'stroke-dasharray="'+sr.dash+'"':'')+' opacity="'+(sr.o||1)+'" stroke-linejoin="round"/>';
  if(sr.fin)s+='<circle cx="'+X(T-1)+'" cy="'+Y(Math.min(mx,sr.y[T-1]))+'" r="3" fill="'+sr.c+'"/>'});
 box.innerHTML=s+'</svg>'}
function barras(box,{grupos,ymax=1,yf=v=>fmt(v*100)+'%'}){
 const W=360,H=180,L=44,R=12,Tp=12,B=26,iw=W-L-R,ih=H-Tp-B,gw=iw/grupos.length;let s='<svg viewBox="0 0 '+W+' '+H+'" role="img" class="'+(ANIM?'dib':'')+'">';
 for(let k=0;k<=3;k++){const v=ymax*k/3,y=Tp+ih-v/ymax*ih;s+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+y+'" y2="'+y+'" stroke="rgba(214,228,222,'+(k?'.07':'.22')+')"/><text x="'+(L-6)+'" y="'+(y+3.5)+'" text-anchor="end" font-size="9.5" fill="#5d6663" font-family="Geist Mono,monospace">'+yf(v)+'</text>'}
 grupos.forEach((g,i)=>{const n=g.v.length,bw=Math.min(22,(gw-14)/n);g.v.forEach((b,j)=>{const x=L+i*gw+(gw-n*bw)/2+j*bw,h=Math.max(0,Math.min(1,b.y/ymax))*ih;s+='<rect class="mbr" style="animation-delay:'+(i*.12+j*.05).toFixed(2)+'s" x="'+(x+1).toFixed(1)+'" y="'+(Tp+ih-h).toFixed(1)+'" width="'+(bw-2).toFixed(1)+'" height="'+h.toFixed(1)+'" fill="'+b.c+'" opacity="'+(b.o||1)+'"/>'});
  s+='<text x="'+(L+i*gw+gw/2)+'" y="'+(H-8)+'" text-anchor="middle" font-size="9.5" fill="#7a8480" font-family="Geist Mono,monospace">'+esc(g.n)+'</text>'});
 box.innerHTML=s+'</svg>'}

/* ---------- SIM-01: red de huertas, abastecimiento, conocimiento y decisión ---------- */
const S1D={rend:6,alcance:.5,auto:.3,acopio:4,cupos:20,retardo:12,mpp:1000,rot:12,muc:6,zona:50000,sequia:false,bloqueo:false,crec:false,revoca:false};
function sim1(P,esc){const T=520,o={part:[],prod:[],auto:[],exc:[],mer:[],pers:[],dep:[],cal:[],esp:[],carga:[]};
 const Nb=esc==='A'?600:esc==='B'?2506:5400;let N=Nb*P.alcance/.5,part=esc==='A'?60:30,cola=0,promF=0;const tren=[];const st=esc!=='A';
 for(let t=0;t<T;t++){
  if(st&&P.revoca&&t===260)N*=.7; if(part>N)part=N;
  const m2=part*50,prom=esc==='A'?0:6+promF,cal=esc==='A'?.6:Math.min(1,P.mpp/Math.max(1,m2/prom));
  const blo=st&&P.bloqueo&&t>=300&&t<326,q=.0073*(blo?1.6:1),p=.00058+(esc==='A'?0:(P.cupos/4.33)*P.alcance/Math.max(1,N));
  const quiere=Math.max(0,(p+q*part/N)*(N-part));let aprob,esp=0;
  if(esc==='A')aprob=quiere;
  else if(esc==='B'){cola+=quiere;aprob=Math.min(cola,P.muc);cola-=aprob;esp=cola/P.muc}
  else{const asam=2+part/60,perd=Math.min(.5,1.2/P.rot),mu=asam*3*(1-perd); /* una asamblea por cada ~60 huerteros, 3 decisiones por semana cada una */cola+=quiere;aprob=Math.min(cola,mu);cola-=aprob;esp=cola/mu}
  const voc=esc==='A'?.15:esc==='B'?.25:.08+.4*(P.rot/52),carga=(m2*.1)/(Math.max(1,part)*6)*(1+voc);
  const h=.005*(1+(carga-1))*(1+1.5*(1-cal)),ret=part*Math.max(0,h);
  part=Math.max(0,part+aprob-ret);
  // promotores: una parte de los cupos de formación se vuelve promotor después del retardo de aprendizaje
  if(esc!=='A'){tren.push((P.cupos/4.33)*.04);if(tren.length>P.retardo)promF+=tren.shift()}
  const clima=st&&P.sequia&&t>=150&&t<176?.5:1,prod=m2*P.rend/52*clima*cal,au=prod*P.auto;let me=prod*.1,ex=Math.max(0,prod-au-me);
  const cap=P.acopio*1000*(blo?2:1),ven=Math.min(ex,cap);me+=ex-ven;ex=ven;
  const pers=prod*52/146,zona=P.zona*(st&&P.crec?Math.pow(1.02,t/52):1);
  o.part.push(part);o.prod.push(prod/1000);o.auto.push(au/1000);o.exc.push(ex/1000);o.mer.push(me/1000);o.pers.push(pers);o.dep.push(Math.max(0,1-pers/zona)*100);o.cal.push(cal*100);o.esp.push(esp);o.carga.push(carga)}
 return o}

/* ---------- SIM-02: orgánicos y compostaje ---------- */
const S2D={frac:.1,cap:20000,tau:10,sust:.2,dist:1};
function sim2(P,esc){const T=156,o={desv:[],sale:[],mad:[],ent:[],pers:[],hong:[],ocu:[]};const gen=.33*7*POP_K/1000; // t por semana
 const capT=esc==='B'?12*P.cap/1000:esc==='C'?8*P.cap/1000:0,d=esc==='C'?P.dist+2.5:P.dist,demanda=125300*5/52/1000,proc=[];
 for(let t=0;t<T;t++){const f=P.frac*(1-Math.exp(-t/20)),quiere=f*gen,desv=esc==='A'?0:Math.min(quiere,capT),sust=esc==='C'?desv*P.sust:0;proc.push(desv-sust);
  const mad=t>=P.tau?.4*proc[t-P.tau]:0,ent=Math.min(mad*Math.exp(-d/4),demanda);
  o.desv.push(desv);o.sale.push(gen-desv);o.mad.push(mad);o.ent.push(ent);o.pers.push(desv*1000/(.33*7));o.hong.push(sust*.3*.75*1000);o.ocu.push(capT?quiere/capT*100:0)}
 o.gen=gen;o.demanda=demanda;return o}

/* ---------- SIM-03: hábitat y fauna (metapoblaciones de Levins) ---------- */
const SP=[{n:'Garza real',k:'Garza',a:2500,c0:.22,e0:.03,p0:.5,c:'#eaefed'},{n:'Copetón',k:'Copetón',a:900,c0:.3,e0:.04,p0:.6,c:'#dba73a'},{n:'Tingua de pico rojo',k:'Tingua',a:350,c0:.3,e0:.025,p0:.3,c:'#8fe7f2'}];
const S3D={alc:1,n:20,arb:.5,luz:.5,anti:true,rec:.08};
function sim3(P,esc){const T=120,o={p:SP.map(()=>[]),pres:[],con:[],ries:0,d:0};
 const n=esc==='A'?0:P.n,d=esc==='A'?2600:esc==='B'?2600/Math.sqrt(1+.15*n):2600/Math.sqrt(1+.6*n);
 const anti=esc!=='A'&&P.anti?.3:1,trampa=.15*P.luz+(n/40)*P.luz*(esc==='C'?.6:1)*anti;
 const p=SP.map(s=>s.p0);let pr=.55;const act=.35+(n/40)*(esc==='C'?.4:1)*.6,ka=.04;
 for(let t=0;t<T;t++){SP.forEach((s,i)=>{const aE=s.a*P.alc*(1+.6*P.arb),c=s.c0*Math.exp(-d/aE),e=s.e0*(1+2*trampa);p[i]=Math.max(0,Math.min(1,p[i]+c*p[i]*(1-p[i])-e*p[i]));o.p[i].push(p[i]*100)});
  pr=Math.max(0,Math.min(1,pr+ka*(act+trampa)-P.rec*pr));o.pres.push(pr*100)}
 o.con=SP.map(s=>{const aE=s.a*P.alc*(1+.6*P.arb);return 1-Math.exp(-Math.pow(aE/d,2))});
 o.ries=Math.min(1,(esc==='A'?.3:.8)*(.5*P.luz+.3*P.luz+(esc==='C'?.1:esc==='B'?.25:.15))*anti);o.d=d;return o}

/* ---------- plantilla de cada simulación ---------- */
const SIMS=[
 {id:'s1',cod:'SIM-01',t:'Red de huertas, abastecimiento, conocimiento y decisión',nom:{A:'sin intervención',B:'nodo único',C:'clúster rotativo'},
  q:'¿Cuánto baja la dependencia de Corabastos cuando Bavaria forma promotores, las huertas abastecen a tiendas y comedores, y cambia quién decide cómo se reparten los recursos?',
  esc:{A:'No hay intervención: solo las huertas que ya existen',B:'El predio de Bavaria es el único nodo y una institución central decide',C:'La red se organiza como clúster y las asambleas deciden por rotación'},
  estres:[['sequia','Sequía (semanas 150–175)'],['bloqueo','Bloqueo del mayorista (sem. 300–325)'],['crec','Crecimiento poblacional (+2 %/año)'],['revoca','Revocación de baldíos por valorización (año 5)']],
  sl:[['rend','Rendimiento','kg/m²·año',[1,3,6,12],null],['alcance','Alcance sobre lotes y techos','',0.1,1,.05,v=>fmt(v*100)+' %'],['auto','Autoconsumo (PAR02)','',0,.8,.05,v=>fmt(v*100)+' %'],
   ['acopio','Capacidad de acopio','t/sem',.5,20,.5,v=>fmt(v,1)+' t'],['cupos','Cupos de formación','por mes',0,80,1,v=>fmt(v)],['retardo','Retardo de aprendizaje','sem',2,52,1,v=>fmt(v)+' sem'],
   ['mpp','m² por promotor (c)','',200,3000,50,v=>fmt(v)+' m²'],['rot','Periodo de rotación de vocerías','sem',4,52,1,v=>fmt(v)+' sem'],['muc','Capacidad de decisión central','solic./sem',1,30,1,v=>fmt(v)],
   ['zona','Población de la zona de servicio','',5000,300000,5000,v=>fmt(v)]],
  def:S1D,corre:sim1,
  graf:[['G4','Difusión de huertas','participantes activos · curva de Bass'],['G1','Producción y destino semanal','t/semana · escenario elegido'],['G3','Dependencia de Corabastos en la zona','% de la zona de servicio'],
   ['G5','Saturación del acompañamiento','calidad de manejo = mín(1; c ÷ m² por promotor)'],['G6','Cola y tiempo de decisión','semanas de espera'],['G7','Abandono por carga','carga por participante (1 = horas disponibles)']],
  por:'Ataca el nodo con más conexiones de la red de problemas: la centralización del abastecimiento en Corabastos y la dependencia de alimentos. Además pone a prueba el modelo político: quién decide y cómo se reparte la carga.',
  inc:'Rotación de vocerías, tope de m² por promotor (c), cupos de formación en Bavaria y un acopio con capacidad fija. Son las palancas que en la simulación separan el escenario B del C.',
  rel:{act:'Hogares, tenderos y comedores, promotores, Bavaria Común, la Mesa y la JAC; Corabastos como actor exógeno que fija el precio.',prob:'Dependencia (A) y centralización (F) en el centro; valorización y especulación (C, D) entran como revocación de baldíos; crecimiento (B) como población de la zona.',
   pol:'Escenario B = decisión central (una cola, una capacidad). Escenario C = asambleas que rotan: la capacidad crece con la red y la carga se reparte.',cau:'Lazos R1, R2, R3 (crecen) frente a B1, B4, B5, B6 (frenan) y B2 (reacción de la central).'},
  estado:[['Hogar cultivador','tipología de huerta, m², conocimiento, horas de trabajo'],['Formador de Bavaria','cupos, tiempo disponible'],['Promotor','huertas acompañadas, carga'],['Tienda o comedor','surtido necesario, proveedor actual'],['Equipo de acopio rotativo','capacidad, inventario'],['Asamblea de Bavaria y Mesa','vocería actual, carga, conocimiento'],['Institución central','cola de solicitudes, capacidad de decisión'],['Corabastos','precio, oferta'],['Parcela de huerta','m², rendimiento']]},
 {id:'s2',cod:'SIM-02',t:'Orgánicos y compostaje',nom:{A:'ruta actual',B:'estaciones barriales',C:'Bavaria Común'},
  q:'¿Cuánta materia orgánica vuelve al suelo en vez de salir del barrio?',
  esc:{A:'Los orgánicos siguen la ruta actual y no se compostan en el barrio',B:'Estaciones comunitarias (una por UPZ) y el compost vuelve a las huertas cercanas',C:'Se composta en Bavaria Común y desde allí se reparte; el sustrato va al distrito de hongos'},
  sl:[['frac','Fracción desviada','',0,1,.05,v=>fmt(v*100)+' %'],['cap','Capacidad por estación','kg/sem',2000,60000,1000,v=>fmt(v)+' kg'],['tau','Semanas de maduración (τ)','',4,26,1,v=>fmt(v)+' sem'],
   ['sust','Fracción de sustrato al distrito','',0,.6,.05,v=>fmt(v*100)+' %'],['dist','Distancia estación–huertas','km',.2,6,.1,v=>fmt(v,1)+' km']],
  def:S2D,corre:sim2,
  graf:[['G8','Orgánicos desviados frente a los que salen','t/semana · desviados por escenario'],['G9','Compost producido y devuelto a huertas','t/semana · escenario elegido'],['G10','Personas cuyo residuo se aprovecha','habitantes'],
   ['G11','Hongos frescos','kg/semana'],['G12','Ocupación de la estación','% de la capacidad (100 % = llena)']],
  por:'Residuos (E) es el problema más visible en la calle y el único que puede volver como recurso a las huertas de SIM-01. Cierra el ciclo alimento → residuo → suelo.',
  inc:'Estaciones barriales de compostaje, el compost como insumo de las huertas y el sustrato para hongos en Bavaria. La simulación dice cuánta capacidad hace falta antes de prometer un número.',
  rel:{act:'Hogares y comercios que generan, el operador de aseo (Ciudad Limpia, UAESP), recicladores de oficio, Corabastos como gran generador y la Mesa de Bavaria.',prob:'Residuos sólidos (E) y su vínculo con la centralización (F): Corabastos concentra residuos +48 h.',
   pol:'¿Quién opera la estación? En B la comunidad del barrio; en C Bavaria Común. Cambia quién controla el compost y a quién se reparte.',cau:'R4 (suelo vivo): producción → residuo → compost → fertilidad → producción. Freno: la ocupación de la estación.'},
  estado:[['Generador de orgánicos','kg generados por semana, ruta que usa'],['Operador de aseo','ruta de recolección, destino final'],['Huerta','fertilidad del suelo'],['Distrito de hongos','sustrato recibido, inventario de proteína'],['Estación de compostaje barrial','orgánicos en proceso, capacidad, compost maduro']]},
 {id:'s3',cod:'SIM-03',t:'Hábitat y fauna',nom:{A:'sin huertas',B:'al azar',C:'corredores'},
  q:'¿Dónde y con qué especies las huertas ayudan al hábitat, y dónde crean trampas ecológicas?',
  esc:{A:'No se construyen huertas; el hábitat de las aves y del humedal queda como está',B:'Se construyen huertas sin ningún criterio de ubicación',C:'Las huertas se ubican para formar corredores entre los parches de vegetación'},
  sl:[['alc','Alcance de dispersión de las aves','× α',.4,2,.05,v=>'× '+fmt(v,2)],['n','Huertas en el borde','',0,40,1,v=>fmt(v)],['arb','Densidad de árboles','',0,1,.05,v=>fmt(v*100)+' %'],
   ['luz','Intensidad de luz y vidrio','',0,1,.05,v=>fmt(v*100)+' %'],['rec','Tasa de recuperación del humedal (kr)','/mes',.02,.2,.01,v=>fmt(v,2)]],
  chk:[['anti','Medida antitrampa (vidrio marcado, luz apantallada)']],
  def:S3D,corre:sim3,
  graf:[['G13','Ocupación de parches por especie','% de parches ocupados · escenario elegido'],['G14','Presión sobre el humedal','índice 0–100'],['G15','Conectividad','parches con vecino a menos de α'],['G16','Riesgo de trampa ecológica','calidad atractiva × mortalidad']],
  por:'Las huertas no son buenas por definición: cerca del humedal pueden atraer aves a vidrios y luz. Kennedy tiene los humedales La Vaca, El Burro y Techo, y la propuesta toca su borde.',
  inc:'Criterio de ubicación por corredores (no al azar), medida antitrampa obligatoria en los edificios de la propuesta y un límite de huertas en el borde del humedal.',
  rel:{act:'Secretaría de Ambiente, Acueducto (administra los humedales), JAC y huerteros del borde, y las aves como actor no humano.',prob:'Crecimiento poblacional (B) y valorización (C) presionan el borde; los residuos (E) atraen fauna sinantrópica.',
   pol:'¿Quién decide dónde va una huerta? Sin criterio (B) decide cada lote; con corredores (C) decide la asamblea con un mapa común.',cau:'B3 (humedal): actividad en el borde → presión → menos suelo disponible para huertas.'},
  estado:[['Aves','posición, parche ocupado, supervivencia'],['Parche de hábitat (huerta, borde, núcleo, árboles)','calidad, tamaño, presión'],['Planta','presencia por parche'],['Amenaza (vidrios, luz nocturna)','intensidad por edificio'],['Fauna sinantrópica','abundancia, atraída por desperdicios']]}];

const SLI={rend:'brote',alcance:'edificio',auto:'casa',acopio:'acopio',cupos:'promotor',retardo:'reloj',mpp:'persona',rot:'asamblea',muc:'inst',zona:'persona',frac:'basura',cap:'compost',tau:'reloj',sust:'hongo',dist:'via',alc:'ave',n:'brote',arb:'hoja',luz:'luz',rec:'agua',anti:'vidrio',sequia:'sol',bloqueo:'candado',crec:'crece',revoca:'precio'};
const GI={G1:'brote',G3:'mercado',G4:'persona',G5:'promotor',G6:'reloj',G7:'peso',G8:'basura',G9:'compost',G10:'persona',G11:'hongo',G12:'acopio',G13:'ave',G14:'agua',G15:'red',G16:'luz'};
const TABI={s1:'brote',s2:'compost',s3:'ave'};
/* indicadores: [ícono, valor, decimales, sufijo, texto]; cuentan hacia arriba cuando la gráfica se dibuja */
function kpis(K,arr){K.innerHTML=arr.map(([i,v,d,s,t])=>'<div>'+ic(i,18)+'<b data-v="'+v+'" data-d="'+d+'" data-s="'+esc(s)+'">'+fmt(v,d)+s+'</b><span>'+t+'</span></div>').join('');
 if(!ANIM||RM)return;const bs=[...K.querySelectorAll('b')],t0=performance.now();const paso=now=>{const k=Math.min(1,(now-t0)/1100),e=1-Math.pow(1-k,3);bs.forEach(b=>{b.textContent=fmt(+b.dataset.v*e,+b.dataset.d)+b.dataset.s});if(k<1)requestAnimationFrame(paso)};requestAnimationFrame(paso)}
function htmlSim(S,i){
 let h='<div class="sim'+(i?'':' on')+'" id="'+S.id+'" role="tabpanel"><p class="simq"><span class="dato">'+ic('pregunta',14)+' Why model? · '+S.cod+'</span>'+esc(S.q)+'</p><div class="tablero"><div class="ctrl"><h5>Escenarios</h5><div class="seg">';
 ['A','B','C'].forEach(k=>{h+='<button type="button" data-e="'+k+'" style="--c:'+ESC_C[k]+'" aria-pressed="'+(k==='C')+'"><i>'+k+'</i><span>'+esc(S.esc[k])+'</span></button>'});
 h+='</div>';
 if(S.estres){h+='<h5>Estreses sobre B y C</h5>';S.estres.forEach(([k,t])=>{h+='<label class="chk"><input type="checkbox" data-k="'+k+'">'+ic(SLI[k],15)+esc(t)+'</label>'});h+='<div style="height:12px"></div>'}
 h+='<h5>Sliders</h5>';
 S.sl.forEach(([k,t,u,a,b,st,f])=>{if(Array.isArray(a)){h+='<div class="sl"><label for="'+S.id+k+'">'+ic(SLI[k],15)+esc(t)+'</label><output data-o="'+k+'"></output><input id="'+S.id+k+'" type="range" data-k="'+k+'" data-v="'+a.join(',')+'" min="0" max="'+(a.length-1)+'" step="1"></div>';return}
  h+='<div class="sl"><label for="'+S.id+k+'">'+ic(SLI[k],15)+esc(t)+'</label><output data-o="'+k+'"></output><input id="'+S.id+k+'" type="range" data-k="'+k+'" min="'+a+'" max="'+b+'" step="'+st+'"></div>'});
 (S.chk||[]).forEach(([k,t])=>{h+='<label class="chk"><input type="checkbox" data-k="'+k+'">'+ic(SLI[k],15)+esc(t)+'</label>'});
 h+='<button type="button" class="reset">Valores iniciales</button></div><div><div class="kpis"></div><div class="graf">';
 S.graf.forEach(([g,t,s],j)=>{h+='<div class="gf"><h6>'+ic(GI[g],16)+'<b>'+g+'</b>'+esc(t)+'</h6><small>'+esc(s)+'</small><div data-g="'+j+'"></div><div class="ley" data-l="'+j+'"></div></div>'});
 h+='</div><div class="lectura" aria-live="polite"><span class="dato">'+ic('lupa',14)+'Lectura de la corrida</span><div></div></div></div></div>';
 h+='<div class="rel"><div><h6>'+ic('diana',15)+'Por qué la elegimos</h6><p>'+S.por+'</p></div><div><h6>'+ic('capas',15)+'Qué entra a la propuesta final</h6><p>'+S.inc+'</p></div><div><h6>'+ic('asamblea',15)+'Red de actores</h6><p>'+S.rel.act+'</p></div><div><h6>'+ic('red',15)+'Red de problemas</h6><p>'+S.rel.prob+'</p></div></div>';
 h+='<div class="rel" style="grid-template-columns:1fr 1fr;margin-top:-1px"><div><h6>'+ic('politica',15)+'Modelo político</h6><p>'+S.rel.pol+'</p></div><div><h6>'+ic('flechas',15)+'Modelo dinámico causal</h6><p>'+S.rel.cau+'</p></div></div>';
 h+='<details><summary>Agentes y estado de '+S.cod+'</summary><div class="scrollx"><table class="tabla"><thead><tr><th>Agente</th><th>Estado</th></tr></thead><tbody>'+S.estado.map(([a,e])=>'<tr><td><b>'+esc(a)+'</b></td><td>'+esc(e)+'</td></tr>').join('')+'</tbody></table></div></details></div>';
 return h}

const ley=arr=>arr.map(([t,c,d])=>'<span><i style="--c:'+c+(d?';background:repeating-linear-gradient(90deg,'+c+' 0 3px,transparent 3px 5px)':'')+'"></i>'+esc(t)+'</span>').join('');
function pintar(S,box,P,e,anim){ANIM=!!anim&&!RM;
 const ESCL=['A','B','C'].map(x=>[x+' '+S.nom[x],ESC_C[x]]);
 const R={A:S.corre(P,'A'),B:S.corre(P,'B'),C:S.corre(P,'C')},r=R[e],G=j=>box.querySelector('[data-g="'+j+'"]'),Lg=(j,a)=>{box.querySelector('[data-l="'+j+'"]').innerHTML=ley(a)};
 const tres=(k,extra={})=>['A','B','C'].map(x=>Object.assign({y:R[x][k],c:ESC_C[x],w:x===e?2.4:1.1,o:x===e?1:.55,fin:x===e},extra));
 const K=box.querySelector('.kpis'),Lc=box.querySelector('.lectura div');
 if(S.id==='s1'){const T=520,xt=[0,104,208,312,416,519],xf=t=>'año '+Math.round(t/52);
  linea(G(0),{series:tres('part'),T,xt,xf});Lg(0,ESCL);
  linea(G(1),{series:[],area:[{y:r.auto,c:'#a3b845'},{y:r.exc,c:LIM},{y:r.mer,c:'#d4553f',o:.6}],T,xt,xf,yf:v=>fmt(v,1)});Lg(1,[['autoconsumo','#a3b845'],['excedente vendido',LIM],['merma','#d4553f']]);
  linea(G(2),{series:tres('dep'),T,xt,xf,ymax:100,yf:v=>fmt(v)+'%'});Lg(2,ESCL);
  linea(G(3),{series:tres('cal'),T,xt,xf,ymax:105,yf:v=>fmt(v)+'%'});Lg(3,ESCL);
  linea(G(4),{series:tres('esp').slice(1),T,xt,xf,yf:v=>fmt(v,1)});Lg(4,ESCL.slice(1));
  linea(G(5),{series:tres('carga').concat([{y:new Array(T).fill(1),c:'#d4553f',dash:'3 4',w:1}]),T,xt,xf,ymin:.6,ymax:1.5,yf:v=>fmt(v,2)});Lg(5,ESCL.concat([['umbral 1',''+'#d4553f',1]]));
  const f=x=>x[x.length-1],pers=f(r.pers);
  kpis(K,[['persona',f(r.part),0,'','huerteros activos al año 10 ('+e+')'],['brote',pers,0,'','personas alimentadas en frutas y verduras (G2)'],['casa',pers/POP_K*100,2,' %','de la población de Kennedy'],['mercado',f(r.dep),0,' %','dependencia de Corabastos en la zona · cae al 50 % en '+fmt(2*pers)+' hab.']]);
  const minCal=Math.min(...r.cal),maxEsp=Math.max(...R.B.esp),t50=R.C.part.findIndex(v=>v>=.5*Math.max(...R.C.part));
  let L='<p>A 10 años, el escenario <em>C</em> llega a <em>'+fmt(f(R.C.part))+'</em> huerteros, el <em>B</em> a <em>'+fmt(f(R.B.part))+'</em> y sin intervención quedan <em>'+fmt(f(R.A.part))+'</em>. La dependencia de la zona baja a <em>'+fmt(f(R.C.dep))+' %</em> en C frente a <em>'+fmt(f(R.B.dep))+' %</em> en B.</p>';
  L+='<p>'+(maxEsp>4?'En B la institución central se satura: la espera por una decisión llega a <em>'+fmt(maxEsp,1)+' semanas</em> y frena la curva (lazo B6). ':'La capacidad de decisión central alcanza para esta demanda. ')+(minCal<90?'El acompañamiento se satura en '+e+': la calidad de manejo cae a <em>'+fmt(minCal)+' %</em> porque faltan promotores (B5). ':'')+(P.revoca?'La revocación de baldíos del año 5 corta el techo de huertas un 30 %. ':'')+(P.sequia?'La sequía se ve como un hueco en la producción del año 3. ':'')+'</p>';
  L+='<p>Lo importante no es el número final sino qué palanca lo mueve: con estos valores, <em>cambiar quién decide</em> (C frente a B) multiplica por <em>'+fmt(f(R.C.part)/Math.max(1,f(R.B.part)),1)+'</em> los huerteros activos. La dependencia baja, pero no desaparece: el modelo no busca eliminar a Corabastos.</p>';
  Lc.innerHTML=L}
 if(S.id==='s2'){const T=156,xt=[0,52,104,155],xf=t=>'año '+Math.round(t/52);
  linea(G(0),{series:tres('desv'),T,xt,xf,yf:v=>fmt(v)});Lg(0,ESCL);
  linea(G(1),{series:[{y:r.mad,c:'#a77b5a',w:2,fin:1},{y:r.ent,c:LIM,w:2,fin:1},{y:new Array(T).fill(r.demanda),c:'#7a8480',dash:'3 4',w:1}],T,xt,xf,yf:v=>fmt(v)});Lg(1,[['compost madurado','#a77b5a'],['entregado a huertas',LIM],['lo que piden las huertas','#7a8480',1]]);
  linea(G(2),{series:tres('pers'),T,xt,xf,yf:v=>v>=1000?fmt(v/1000)+' mil':fmt(v)});Lg(2,ESCL);
  linea(G(3),{series:tres('hong'),T,xt,xf,yf:v=>fmt(v)});Lg(3,ESCL);
  linea(G(4),{series:tres('ocu').slice(1).concat([{y:new Array(T).fill(100),c:'#d4553f',dash:'3 4',w:1}]),T,xt,xf,yf:v=>fmt(v)+'%'});Lg(4,ESCL.slice(1).concat([['llena','#d4553f',1]]));
  const f=x=>x[x.length-1];
  kpis(K,[['basura',f(r.desv)/r.gen*100,1,' %','de los orgánicos de Kennedy se desvía ('+e+')'],['compost',f(r.ent),1,' t','compost por semana que llega a huertas'],['persona',f(r.pers),0,'','personas cuyo residuo se aprovecha'],['hongo',f(r.hong),0,' kg','hongos frescos por semana']]);
  const sob=f(r.mad)/Math.max(.01,r.demanda);
  let L='<p>Kennedy genera unas <em>'+fmt(r.gen)+' t</em> de orgánicos por semana. Con estas capacidades, B desvía <em>'+fmt(f(R.B.desv)/r.gen*100,1)+' %</em> y C <em>'+fmt(f(R.C.desv)/r.gen*100,1)+' %</em>: '+(f(R.B.ocu)>100||f(R.C.ocu)>100?'las estaciones se llenan (G12 pasa el 100 %) y el resto sigue saliendo del barrio.':'las estaciones no se llenan.')+'</p>';
  if(e!=='A')L+='<p>'+(sob>1.2?'El compost madurado es <em>'+fmt(sob,1)+' veces</em> lo que piden las huertas de SIM-01: <em>sobra compost</em>, y hace falta otro destino (parques, viveros, venta) o más huertas.':'Casi todo el compost cabe en las huertas cercanas.')+' '+(e==='C'?'Desde Bavaria la distancia media sube y se pierde parte en el transporte; a cambio aparecen los hongos.':'Las estaciones barriales quedan cerca de las huertas: se pierde poco en el camino, pero no hay distrito de hongos.')+'</p>';
  L+='<p>Ajusta <em>la fracción desviada</em> y <em>la capacidad</em>: el cuello de botella cambia de lugar, de la separación en la casa a la estación.</p>';
  Lc.innerHTML=L}
 if(S.id==='s3'){const T=120,xt=[0,24,48,72,96,119],xf=t=>'año '+Math.round(t/12);
  linea(G(0),{series:SP.map((s,i)=>({y:r.p[i],c:s.c,w:2,fin:1})).concat(SP.map((s,i)=>({y:R.A.p[i],c:s.c,w:1,dash:'2 4',o:.5}))),T,xt,xf,ymax:100,yf:v=>fmt(v)+'%'});Lg(0,SP.map(s=>[s.k,s.c]).concat([['punteado: A','#7a8480',1]]));
  linea(G(1),{series:tres('pres'),T,xt,xf,ymax:100,yf:v=>fmt(v)});Lg(1,ESCL);
  barras(G(2),{grupos:SP.map((s,i)=>({n:s.k,v:['A','B','C'].map(x=>({y:R[x].con[i],c:ESC_C[x],o:x===e?1:.45}))}))});Lg(2,ESCL);
  barras(G(3),{grupos:['A','B','C'].map(x=>({n:x,v:[{y:R[x].ries,c:ESC_C[x],o:x===e?1:.45}]}))});Lg(3,ESCL);
  const f=x=>x[x.length-1],vivas=SP.filter((s,i)=>f(r.p[i])>5);
  kpis(K,[['ave',vivas.length,0,' / 3','especies que persisten a 10 años ('+e+')'],['agua',f(r.pres),0,'','presión sobre el humedal (0–100)'],['via',r.d,0,' m','distancia media entre parches'],['luz',r.ries*100,0,' %','riesgo de trampa ecológica']]);
  const ti=2,tC=f(R.C.p[ti]),tB=f(R.B.p[ti]),tA=f(R.A.p[ti]);
  let L='<p>La <em>tingua de pico rojo</em> casi no vuela entre parches (α ≈ 350 m): sin huertas queda en <em>'+fmt(tA)+' %</em>, con huertas al azar en <em>'+fmt(tB)+' %</em> y con corredores en <em>'+fmt(tC)+' %</em>. La <em>garza</em> cruza la ciudad y casi no depende de la ubicación.</p>';
  L+='<p>'+(R.B.ries>R.A.ries?'Las huertas al azar <em>suben el riesgo de trampa</em> ('+fmt(R.B.ries*100)+' % frente a '+fmt(R.A.ries*100)+' % hoy): atraen aves a vidrios y luz. ':'')+(P.anti?'La medida antitrampa lo reduce a la tercera parte.':'Sin medida antitrampa el riesgo se mantiene alto: actívala para ver la diferencia.')+' La presión sobre el humedal en C termina en <em>'+fmt(f(R.C.pres))+'</em> frente a <em>'+fmt(f(R.B.pres))+'</em> en B.</p>';
  Lc.innerHTML=L}ANIM=false}

function montarSim(S,box){
 const P=Object.assign({},S.def);let e='C';
 const sync=()=>{box.querySelectorAll('input[type=range]').forEach(inp=>{const k=inp.dataset.k,o=box.querySelector('[data-o="'+k+'"]'),def=S.sl.find(x=>x[0]===k);
   if(inp.dataset.v){const V=inp.dataset.v.split(',').map(Number);inp.value=Math.max(0,V.indexOf(P[k]));o.textContent=fmt(P[k])+' '+def[2]}else{inp.value=P[k];o.textContent=def[6](P[k])}});
  box.querySelectorAll('input[type=checkbox]').forEach(c=>{c.checked=!!P[c.dataset.k]})};
 let raf=0;const run=a=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>pintar(S,box,P,e,a))};box._run=run;
 box.addEventListener('input',ev=>{const inp=ev.target,k=inp.dataset.k;if(!k)return;
  if(inp.type==='checkbox')P[k]=inp.checked;else if(inp.dataset.v)P[k]=inp.dataset.v.split(',').map(Number)[+inp.value];else P[k]=+inp.value;
  if(inp.type==='range'){const o=box.querySelector('[data-o="'+k+'"]'),def=S.sl.find(x=>x[0]===k);o.textContent=inp.dataset.v?fmt(P[k])+' '+def[2]:def[6](P[k])}run()});
 box.querySelectorAll('.seg button').forEach(b=>b.addEventListener('click',()=>{e=b.dataset.e;box.querySelectorAll('.seg button').forEach(x=>x.setAttribute('aria-pressed',x===b));run(true)}));
 box.querySelector('.reset').addEventListener('click',()=>{Object.assign(P,S.def);sync();run(true)});
 sync();pintar(S,box,P,e)}

/* ---------- página ---------- */
function montar(){
 const st=document.getElementById('story');if(!st||document.getElementById('modelo'))return!!st;
 const M=el('div',{id:'modelo','aria-label':'El modelo y las simulaciones'});
 const li=(i,t)=>'<li class="i">'+ic(i,16)+t+'</li>',cab=(i,n,t)=>'<span class="hico">'+ic(i,26)+'</span><div class="ey"><b>'+n+'</b> · '+t+'</div>';
 let h='';
 // 0 · por qué modelar + laboratorio animado
 h+='<section class="blq"><div class="mw">'+cab('cubo','04','Del problema al modelo')+'<h2>Por qué<br>simular Kennedy</h2>'+
  '<p class="lead">Los seis problemas no ocurren solos: se alimentan entre sí. Ese tipo de problema no se resuelve con un diagnóstico; hay que <em>construir un modelo, correrlo, equivocarse y corregirlo</em>. El diagnóstico fue la primera parte; aquí empieza la otra.</p>'+
  '<div class="pregunta"><span class="dato">'+ic('pregunta',14)+' Why model? · Epstein</span><p>No modelamos para predecir el futuro de Kennedy. Modelamos para <em>explicar</em> por qué la dependencia de Corabastos se sostiene, <em>explorar escenarios</em> que no se pueden ensayar en la calle, <em>encontrar las palancas</em> que más mueven el sistema y <em>descubrir preguntas nuevas</em>. Cada modelo es una abstracción incompleta: lo vamos ampliando con cada error.</p></div>'+
  '<div class="lab"><canvas aria-label="Animación de agentes: hogares, acopio de Bavaria, tiendas, camiones de Corabastos y aves"></canvas><div class="lcnt"></div><div class="lbar"><div class="lley">'+
  [['#7a8480','hogar'],[LIM,'hogar que cultiva'],['#8fe7f2','promotor'],['#eaefed','tienda'],['#ee8a45','camión de Corabastos'],['#a3b845','cosecha al acopio'],['#5fb8a8','ave']].map(([c,t])=>'<span><i style="--c:'+c+'"></i>'+t+'</span>').join('')+
  '</div><div class="lseg" role="group" aria-label="Escenario de la animación"><button type="button" data-m="hoy" aria-pressed="true">Kennedy hoy</button><button type="button" data-m="prop" aria-pressed="false">Con la propuesta</button></div></div></div>'+
  '<div class="links"><a class="btn pri" href="https://anasoficasca-code.github.io/simulador/" target="_blank" rel="noopener">'+ic('play',14)+' Abrir el simulador 3D ↗</a><a class="btn" href="https://o62juantr-bit.github.io/sim-kennedy/visor_modelos_vensim.html" target="_blank" rel="noopener">'+ic('flechas',14)+' Modelos en Vensim ↗</a><a class="btn" href="#sims">'+ic('crece',14)+' Ir a las simulaciones ↓</a></div></div></section>';
 // I · II entorno y agentes
 h+='<section class="blq"><div class="mw">'+cab('capas','I · II','Entorno y agentes')+'<h2>Qué es entorno<br>y qué es agente</h2>'+
  '<p class="lead">El criterio que usamos: <em>es agente lo que tiene estado propio, regla propia y afecta a otros</em>. Es entorno lo que solo sirve de soporte o de restricción.</p>'+
  '<div class="g2"><div class="caja" style="--c:#7a8480"><span class="ci">'+ic('edificio',20)+'</span><span class="dato">Entorno · contexto fijo</span><h3 style="margin-top:10px">El territorio</h3><ul>'+
   li('edificio','El territorio de Kennedy: relieve, vías, agua, parques y 244.147 edificios (el modelo 3D del simulador).')+li('via','Las calles y corredores de reparto por donde se mueven vehículos y repartidores.')+li('mercado','Corabastos como nodo del que se depende: su precio y su oferta entran desde afuera.')+li('agua','Los humedales La Vaca, El Burro y Techo, y los parches de vegetación.')+'</ul></div>'+
  '<div class="caja"><span class="ci">'+ic('persona',20)+'</span><span class="dato">Agentes · unidad mínima</span><h3 style="margin-top:10px">Quien decide</h3><ul>'+
   li('casa','<em>El hogar</em> es la unidad mínima: decide si cultiva, cuánto consume y qué vende.')+li('tienda','Tiendas y comedores eligen proveedor; los promotores abren y acompañan huertas.')+li('asamblea','Bavaria Común acopia y forma; la asamblea asigna espacios y normas.')+li('ave','Las aves eligen parche; los vehículos eligen ruta.')+'</ul></div></div>'+
  '<div class="g2" style="margin-top:20px"><div class="caja" style="--c:#dba73a"><span class="ci">'+ic('agua',20)+'</span><span class="dato">La frontera</span><p style="margin-top:10px">El entorno también puede ser agente. <em>El humedal</em> no tiene objetivo, pero su estado (presión) cambia con lo que hacen los demás y restringe dónde se abren huertas: lo modelamos como <em>agente pasivo</em>. <em>Corabastos</em> también: tiene precio y oferta, pero no lo hacemos decidir, porque la propuesta busca reducir la dependencia sin eliminarla.</p></div>'+
  '<div class="caja" style="--c:#dba73a"><span class="ci">'+ic('regla',20)+'</span><span class="dato">Por qué no al revés</span><p style="margin-top:10px">Un edificio no cambia su conducta según lo que pasa: es soporte y obstáculo (para las aves, un vidrio). Un hogar sí: si la carga de trabajo sube, abandona la huerta. Esa diferencia, <em>reaccionar con una regla propia</em>, es la que separa agente de entorno.</p></div></div></div></section>';
 // III · IV · V sistema multiagente
 h+='<section class="blq"><div class="mw">'+cab('asamblea','III · IV · V','Sistema multiagente')+'<h2>Muchos agentes,<br>reglas distintas</h2>'+
  '<p class="lead">El modelo es <em>multiagente</em> porque conviven agentes con objetivos y reglas diferentes: un hogar busca producir, una tienda busca precio, una asamblea reparte, un ave busca hábitat. Lo interesante sale de sus interacciones, no de ninguno por separado.</p>'+
  '<div class="scrollx"><table class="tabla"><thead><tr><th>Tipo</th><th>Agente</th><th>Objetivo</th><th>Estado</th></tr></thead><tbody>'+
  AG.map(([t,a,o,s,i])=>'<tr><td><span class="tp '+t+'">'+(t==='act'?'Activo':'Pasivo')+'</span></td><td><span class="ag">'+ic(i,20)+'<b>'+esc(a)+'</b></span></td><td>'+esc(o)+'</td><td>'+esc(s)+'</td></tr>').join('')+'</tbody></table></div>'+
  '<div class="g3"><div class="caja"><span class="ci">'+ic('ave',20)+'</span><span class="dato">Activos · objetivos simples</span><p style="margin-top:10px">Como los lobos y las ovejas de NetLogo: cada uno persigue algo sencillo (producir, abastecerse, decidir, sobrevivir) y lo complejo aparece al juntarse.</p></div>'+
  '<div class="caja" style="--c:#7a8480"><span class="ci">'+ic('brote',20)+'</span><span class="dato">Pasivos · sin objetivo</span><p style="margin-top:10px">Como la comida o el obstáculo: parcelas, residuos, producto en acopio, humedal, vidrios. Cambian de estado, pero no deciden.</p></div>'+
  '<div class="caja" style="--c:#8fe7f2"><span class="ci">'+ic('cubo',20)+'</span><span class="dato">En el simulador 3D</span><p style="margin-top:10px">Ya corren como agentes los vehículos (tráfico por la red vial de OSM) y las aves (garza, tingua, copetón). Edificios, vías, parques y agua son el entorno.</p></div></div></div></section>';
 // en vivo: videos grabados del simulador 3D
 const vid=(f,tit,txt,chips,i)=>'<figure><span class="rec"><i></i>SIMULADOR 3D · EN VIVO</span><video muted loop playsinline preload="none" poster="media/'+f+'.jpg" aria-label="'+esc(tit)+'"><source src="media/'+f+'.mp4" type="video/mp4"></video><figcaption><b>'+ic(i,14)+esc(tit)+'</b>'+txt+(chips?'<div class="chips">'+chips.map(c=>'<span>'+c+'</span>').join('')+'</div>':'')+'</figcaption></figure>';
 h+='<section class="blq"><div class="mw">'+cab('play','En vivo','Los agentes en el simulador')+'<h2>Así corren<br>los agentes</h2>'+
  '<p class="lead">Tomas grabadas del <em>simulador 3D</em> (malla fotorrealista de Google sobre Kennedy). Los vehículos circulan por la red vial, las aves vuelan entre los parches del humedal y el panel de agentes cuenta lo que pasa en la calle.</p>'+
  '<div class="vids">'+
  vid('sim_agentes','Kennedy hoy · capa de agentes','Sobre el humedal El Burro: cada arco es un ave moviéndose entre parches de vegetación. A la derecha, el panel de agentes cuenta vehículos y fauna en tiempo real.',[ic('carro',12)+'carros <em>≈ 1.790</em>',ic('camion',12)+'camiones <em>≈ 210</em>',ic('ave',12)+'1.006 aves en El Burro'],'ave')+
  vid('sim_humedal','Vista baja del humedal','Las aves (agentes activos) buscan hábitat; el agua, los árboles y los edificios son el entorno que las sostiene o las frena.',null,'agua')+
  vid('sim_propuesta','Con la propuesta','Al cambiar de escenario el panel recalcula: menos camiones hacia Corabastos y aparecen las furgonetas de reparto de la red de mercados.',[ic('carro',12)+'carros <em>≈ 1.250–1.300</em>',ic('camion',12)+'camiones <em>≈ 125–135</em>',ic('tienda',12)+'furgonetas <em>≈ 26–34</em>','−37 % cerca de Corabastos'],'tienda')+
  '</div></div></section>';
 // VI reglas
 h+='<section class="blq"><div class="mw">'+cab('regla','VI','Comportamientos')+'<h2>Reglas<br>de agente</h2><p class="lead">Como en el juego de la vida: cada agente mira su estado y el de sus vecinos y aplica una regla <em>si … entonces</em>. Los códigos (PAR, AUX, STK, FLO) son las variables del modelo en Vensim.</p><div class="reglas">'+
  REG.map(([c,t,r,i])=>'<div class="regla">'+ic(i,22)+'<span class="dato">'+c+'</span><h4>'+t+'</h4><code>'+r+'</code></div>').join('')+'</div></div></section>';
 // VII interacciones
 h+='<section class="blq"><div class="mw">'+cab('flechas','VII','Interacciones')+'<h2>Agente con agente,<br>agente con entorno</h2>'+
  '<div class="lienzo scrollx">'+interacciones()+'</div>'+
  '<div class="g2"><div class="caja"><span class="ci">'+ic('red',20)+'</span><span class="dato">Agente – agente</span><ul>'+li('acopio','hogar → acopio → tienda')+li('promotor','Bavaria → promotor → hogar')+li('mercado','tienda ↔ Corabastos (elige proveedor)')+li('casa','hogar ↔ hogar (contagio y saber)')+li('asamblea','asamblea → hogar (asigna espacio)')+'</ul></div>'+
  '<div class="caja" style="--c:#8fe7f2"><span class="ci">'+ic('agua',20)+'</span><span class="dato">Agente – entorno</span><ul>'+li('brote','una huerta ocupa una parcela')+li('agua','la actividad del borde presiona el humedal')+li('compost','el compost vuelve al suelo')+li('carro','vehículos y repartidores se mueven por las calles')+li('ave','las aves ocupan parches de vegetación')+'</ul></div></div></div></section>';
 // VIII + 3 diagrama causal
 h+='<section class="blq"><div class="mw">'+cab('red','VIII · 3','Modelo dinámico causal')+'<h2>Los lazos<br>que mueven el sistema</h2>'+
  '<p class="lead">Las cajas verdes son acumulaciones (stocks); las flechas dicen si una variable sube <em>(+)</em> o baja <em>(−)</em> a la otra. En rojo punteado, los estreses que llegan desde afuera. Elige un lazo para verlo correr.</p>'+
  '<div class="lazos">'+Object.keys(LAZ).map(k=>'<button type="button" data-l="'+k+'" style="--c:'+LAZ[k][0]+'" aria-pressed="false">'+ic(k[0]==='R'?'crece':'peso',13)+' '+k+'</button>').join('')+'</div><p class="lazo-txt">Los lazos <em>R</em> refuerzan (el sistema crece); los <em>B</em> equilibran (el sistema se frena).</p>'+
  '<div class="lienzo scrollx">'+cld()+'</div></div></section>';
 // 4 simulaciones
 h+='<section class="blq" id="sims"><div class="mw">'+cab('crece','4','Simulaciones')+'<h2>Tres simulaciones,<br>corriendo aquí</h2>'+
  '<p class="lead">Cada simulación compara los escenarios A, B y C con las ecuaciones de los gráficos G1–G16. Mueve los sliders: las líneas gruesas son el escenario elegido, las delgadas los otros dos. Los valores iniciales marcados (S) son supuestos para calibrar con la Mesa.</p>'+
  '<div class="tabs" role="tablist">'+SIMS.map((S,i)=>'<button type="button" role="tab" aria-selected="'+(!i)+'" aria-controls="'+S.id+'" data-t="'+S.id+'">'+ic(TABI[S.id],16)+'<b>'+S.cod+'</b>'+esc(S.t)+'</button>').join('')+'</div>'+
  SIMS.map(htmlSim).join('')+'</div></section>';
 // referentes y cierre
 h+='<section class="blq"><div class="mw">'+cab('lupa','Referentes','Qué tomamos')+'<h2>De dónde<br>viene el modelo</h2><div class="ref">'+
  '<div><b>'+ic('ave',18)+'NetLogo</b><p>Agentes con reglas simples sobre celdas (lobos y ovejas, bandadas): la base de los agentes activos y pasivos.</p></div>'+
  '<div><b>'+ic('edificio',18)+'SLEUTH</b><p>Crecimiento urbano por celdas calibrado con la historia: la idea de la presión urbana sobre el borde del humedal.</p></div>'+
  '<div><b>'+ic('capas',18)+'Mundos plausibles</b><p>Escenarios antes y después de la intervención, comparados con las mismas variables.</p></div>'+
  '<div><b>'+ic('agua',18)+'Eco-arquitectura</b><p>ABM sobre ráster con sliders, los vertimientos de Corabastos y un escenario base que colapsa para comparar.</p></div></div></div></section>';
 h+='<section class="pie"><div class="mw"><p class="lead">Este modelo va a estar equivocado en algo. Lo útil es saber <em>en qué</em>: cada corrida deja una pregunta para la siguiente versión.</p><div class="links"><a class="btn pri" href="https://anasoficasca-code.github.io/simulador/" target="_blank" rel="noopener">'+ic('play',14)+' Correrlo en el simulador 3D ↗</a><a class="btn" href="propuesta.html">'+ic('capas',14)+' Ver la propuesta</a><a class="btn" href="#top" data-arriba>Volver arriba ↑</a></div></div></section>';
 M.innerHTML=h;st.insertAdjacentElement('afterend',M);
 // pestañas: al cambiar, la simulación se vuelve a dibujar con animación
 M.querySelectorAll('.tabs button').forEach(b=>b.addEventListener('click',()=>{M.querySelectorAll('.tabs button').forEach(x=>x.setAttribute('aria-selected',x===b));M.querySelectorAll('.sim').forEach(s=>s.classList.toggle('on',s.id===b.dataset.t));const s=M.querySelector('#'+b.dataset.t);if(s._run)s._run(true)}));
 SIMS.forEach(S=>montarSim(S,M.querySelector('#'+S.id)));
 // lazos del diagrama causal
 const C=M.querySelector('#cld'),tx=M.querySelector('.lazo-txt');
 M.querySelectorAll('.lazos button').forEach(b=>b.addEventListener('click',()=>{const k=b.dataset.l,on=b.getAttribute('aria-pressed')!=='true';
  M.querySelectorAll('.lazos button').forEach(x=>x.setAttribute('aria-pressed',on&&x===b));C.classList.toggle('foco',on);
  C.querySelectorAll('.car,.nd').forEach(g=>{const hit=on&&g.dataset.l.split(' ').includes(k);g.classList.toggle('on',hit);if(g.classList.contains('car'))g.querySelector('path').style.stroke=hit?LAZ[k][0]:''});
  tx.style.setProperty('--c',on?LAZ[k][0]:LIM);tx.innerHTML=on?'<b>'+LAZ[k][1]+'.</b> '+LAZ[k][2]:'Los lazos <em>R</em> refuerzan (el sistema crece); los <em>B</em> equilibran (el sistema se frena).'}));
 M.querySelector('[data-arriba]').addEventListener('click',ev=>{ev.preventDefault();scrollTo({top:0,behavior:'smooth'})});
 // aparición al bajar: cada bloque entra escalonado
 const SEL='.hico,.ey,h2,.lead,.pregunta,.lab,.links,.caja,.tabla tbody tr,.vids figure,.regla,.lienzo,.lazos,.tabs,.ref>div';
 M.querySelectorAll('.blq,.pie').forEach(b=>{let n=0;b.querySelectorAll(SEL).forEach(x=>{if(x.closest('.sim'))return;x.classList.add('rv');x.style.setProperty('--d',Math.min(.9,(n++)*.06)+'s')})});
 const rio=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add('vis');rio.unobserve(en.target)}}),{rootMargin:'0px 0px -8% 0px'});M.querySelectorAll('.rv').forEach(x=>rio.observe(x));
 // las gráficas se dibujan la primera vez que se ven
 const gio=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){const s=M.querySelector('.sim.on');if(s&&s._run)s._run(true);gio.disconnect()}}),{threshold:.15});gio.observe(M.querySelector('#sims .tablero')||M.querySelector('#sims'));
 // videos: solo corren cuando están en pantalla
 const vio=new IntersectionObserver(es=>es.forEach(en=>{const v=en.target;if(en.isIntersecting&&!RM){v.play().catch(()=>{})}else v.pause()}),{threshold:.25});M.querySelectorAll('video').forEach(v=>vio.observe(v));
 laboratorio(M.querySelector('.lab'));
 // aviso al final de la red para bajar al modelo
 const fin=st.querySelector('.fin');if(fin){const a=el('a',{class:'al-modelo',href:'#modelo'},'El modelo y las simulaciones<span aria-hidden="true">↓</span>');fin.appendChild(a);
  a.addEventListener('click',ev=>{ev.preventDefault();M.scrollIntoView({behavior:'smooth'})})}
 // al entrar al modelo se esconden los controles flotantes de la red
 const io=new IntersectionObserver(es=>es.forEach(en=>document.body.classList.toggle('enmodelo',en.isIntersecting)),{rootMargin:'0px 0px -40% 0px'});io.observe(M);
 // en la red, la rueda del ratón baja la página (Ctrl + rueda acerca); en celular, deslizar en vertical baja la página
 const cv=document.querySelector('#c');if(cv){window.addEventListener('wheel',ev=>{if(ev.target===cv&&!ev.ctrlKey)ev.stopPropagation()},{capture:true,passive:true});cv.style.touchAction='pan-y'}
 return true}

/* ---------- laboratorio: agentes animados (esquema, no datos) ----------
   Hoy: los camiones salen de Corabastos a cada tienda y las aves se quedan en el humedal.
   Con la propuesta: los hogares que cultivan llevan cosecha al acopio de Bavaria, el acopio surte a las tiendas, los promotores
   salen a acompañar huertas, llegan menos camiones (−37 %) y las aves usan las huertas como pasaderas. */
function laboratorio(box){
 if(!box)return;const cv=box.querySelector('canvas'),cx=cv.getContext('2d'),cnt=box.querySelector('.lcnt');let W=0,H=0,dpr=1,modo='hoy',vis=false,raf=0,t0=performance.now(),last=t0;
 let rs=11;const rnd=()=>{rs=(rs*1664525+1013904223)>>>0;return rs/4294967296};
 const casas=[],tiendas=[],viaj=[],aves=[];let cora,acop,hum;
 const armar=()=>{const r=cv.getBoundingClientRect();dpr=Math.min(2,devicePixelRatio||1);W=r.width;H=r.height;cv.width=W*dpr;cv.height=H*dpr;cx.setTransform(dpr,0,0,dpr,0,0);
  rs=11;casas.length=0;tiendas.length=0;cora={x:W*.92,y:H*.52};acop={x:W*.5,y:H*.55};hum={x:W*.2,y:H*.3,rx:W*.11,ry:H*.15};
  const libre=(x,y)=>Math.hypot(x-acop.x,y-acop.y)>50&&Math.hypot((x-hum.x)/hum.rx,(y-hum.y)/hum.ry)>1.25&&x<W*.82;
  let n=0;while(casas.length<(W<600?34:58)&&n++<2000){const x=W*(.05+rnd()*.78),y=H*(.1+rnd()*.82);if(libre(x,y))casas.push({x,y,cul:rnd()<.55})}
  n=0;while(tiendas.length<(W<600?7:11)&&n++<2000){const x=W*(.12+rnd()*.66),y=H*(.12+rnd()*.78);if(libre(x,y)&&casas.every(c=>Math.hypot(c.x-x,c.y-y)>14))tiendas.push({x,y})}
  aves.length=0;for(let i=0;i<(W<600?14:22);i++)aves.push({x:hum.x+(rnd()-.5)*hum.rx,y:hum.y+(rnd()-.5)*hum.ry,a:rnd()*6.28,o:hum,v:20+rnd()*20,tt:rnd()*6})};
 const sale=(a,b,c,r,dur)=>viaj.push({x0:a.x,y0:a.y,x1:b.x,y1:b.y,t:0,dur,c,r,cv:(rnd()-.5)*.35});
 const cuenta={cam:0,cos:0,pro:0};let acc={cam:0,cos:0,pro:0,tie:0};
 const paso=(dt)=>{const P=modo==='prop';
  acc.cam+=dt*(P?3.2*.63:3.2);while(acc.cam>1){acc.cam--;sale(cora,tiendas[(rnd()*tiendas.length)|0],'#ee8a45',2.6,2.6+rnd());cuenta.cam++}
  if(P){acc.cos+=dt*4;while(acc.cos>1){acc.cos--;const cs=casas.filter(c=>c.cul);sale(cs[(rnd()*cs.length)|0],acop,'#a3b845',1.8,1.8+rnd()*.8);cuenta.cos++}
   acc.tie+=dt*2.4;while(acc.tie>1){acc.tie--;sale(acop,tiendas[(rnd()*tiendas.length)|0],LIM,2.2,1.6+rnd()*.6)}
   acc.pro+=dt*.9;while(acc.pro>1){acc.pro--;const cs=casas.filter(c=>c.cul),d=cs[(rnd()*cs.length)|0];sale(acop,d,'#8fe7f2',2.2,2.4);cuenta.pro++}}
  for(let i=viaj.length-1;i>=0;i--){const v=viaj[i];v.t+=dt/v.dur;if(v.t>=1)viaj.splice(i,1)}
  aves.forEach(a=>{a.tt-=dt;if(a.tt<0){a.tt=3+rnd()*5;const cs=casas.filter(c=>c.cul);a.o=P&&rnd()<.55?cs[(rnd()*cs.length)|0]:hum}
   const ox=a.o.x,oy=a.o.y,dx=ox-a.x,dy=oy-a.y,d=Math.hypot(dx,dy);a.a+=(rnd()-.5)*2.4*dt;const ga=Math.atan2(dy,dx);if(d>18)a.a+=Math.sin(ga-a.a)*dt*2.2;
   a.x+=Math.cos(a.a)*a.v*dt;a.y+=Math.sin(a.a)*a.v*dt})};
 const dib=(now)=>{const P=modo==='prop';cx.fillStyle='rgba(7,9,10,.34)';cx.fillRect(0,0,W,H);
  // humedal
  cx.save();cx.beginPath();cx.ellipse(hum.x,hum.y,hum.rx,hum.ry,-.3,0,6.283);cx.fillStyle='rgba(63,140,138,.16)';cx.fill();cx.strokeStyle='rgba(95,184,168,.35)';cx.stroke();cx.restore();
  cx.font='500 9px Geist Mono, monospace';cx.fillStyle='#5fb8a8';cx.fillText('HUMEDAL',hum.x-22,hum.y+hum.ry+14);
  // hogares y tiendas
  casas.forEach(c=>{const on=P&&c.cul;cx.fillStyle=on?LIM:'#4a524f';cx.fillRect(c.x-2.5,c.y-2.5,5,5);if(on){cx.strokeStyle='rgba(207,255,94,.25)';cx.strokeRect(c.x-5,c.y-5,10,10)}});
  tiendas.forEach(s=>{cx.strokeStyle='#eaefed';cx.lineWidth=1.2;cx.beginPath();cx.moveTo(s.x-5,s.y+4);cx.lineTo(s.x-5,s.y-2);cx.lineTo(s.x,s.y-6);cx.lineTo(s.x+5,s.y-2);cx.lineTo(s.x+5,s.y+4);cx.closePath();cx.stroke()});
  // Corabastos y acopio
  const pul=.5+.5*Math.sin(now/400);
  cx.fillStyle='#ee8a45';cx.fillRect(cora.x-13,cora.y-13,26,26);cx.strokeStyle='rgba(238,138,69,'+(.25+.25*pul)+')';cx.strokeRect(cora.x-19-pul*4,cora.y-19-pul*4,38+pul*8,38+pul*8);
  cx.fillStyle='#ee8a45';cx.fillText('CORABASTOS',Math.min(cora.x-30,W-78),cora.y+32);
  cx.globalAlpha=P?1:.35;cx.beginPath();for(let k=0;k<6;k++){const an=k/6*6.283+.52;cx.lineTo(acop.x+14*Math.cos(an),acop.y+14*Math.sin(an))}cx.closePath();cx.fillStyle=P?LIM:'#2b302e';cx.fill();
  if(P){cx.strokeStyle='rgba(207,255,94,'+(.2+.3*pul)+')';cx.beginPath();cx.arc(acop.x,acop.y,22+pul*6,0,6.283);cx.stroke()}
  cx.fillStyle=P?LIM:'#4a524f';cx.fillText('BAVARIA · ACOPIO',acop.x-42,acop.y+30);cx.globalAlpha=1;
  // viajeros
  viaj.forEach(v=>{const e=v.t<.5?2*v.t*v.t:1-Math.pow(-2*v.t+2,2)/2,mx=(v.x0+v.x1)/2-(v.y1-v.y0)*v.cv,my=(v.y0+v.y1)/2+(v.x1-v.x0)*v.cv,q=1-e,x=q*q*v.x0+2*q*e*mx+e*e*v.x1,y=q*q*v.y0+2*q*e*my+e*e*v.y1;
   cx.fillStyle=v.c;cx.beginPath();cx.arc(x,y,v.r,0,6.283);cx.fill()});
  // aves (pequeñas uves que aletean)
  cx.strokeStyle='#5fb8a8';cx.lineWidth=1.2;aves.forEach(a=>{const f=Math.sin(now/90+a.v)*2.2;cx.beginPath();cx.moveTo(a.x-4,a.y-f);cx.lineTo(a.x,a.y);cx.lineTo(a.x+4,a.y-f);cx.stroke()})};
 const loop=now=>{raf=0;if(!vis)return;const dt=Math.min(.05,(now-last)/1000);last=now;paso(dt);dib(now);
  if(((now/500)|0)!==((now-dt*1000)/500|0))cnt.innerHTML=(modo==='prop'?'<span>Con la propuesta</span>':'<span>Kennedy hoy</span>')+'<span>camiones de Corabastos <b>'+(modo==='prop'?'−37 %':'100 %')+'</b></span>'+(modo==='prop'?'<span>cosechas al acopio <b>'+cuenta.cos+'</b></span><span>visitas de promotores <b>'+cuenta.pro+'</b></span>':'<span>huertas en red <b>0</b></span>');
  raf=requestAnimationFrame(loop)};
 const arranca=()=>{if(!raf&&vis){last=performance.now();raf=requestAnimationFrame(loop)}};
 box.querySelectorAll('.lseg button').forEach(b=>b.addEventListener('click',()=>{modo=b.dataset.m;cuenta.cos=cuenta.pro=0;box.querySelectorAll('.lseg button').forEach(x=>x.setAttribute('aria-pressed',x===b));if(RM){paso(.016);dib(performance.now())}}));
 new IntersectionObserver(es=>es.forEach(en=>{vis=en.isIntersecting;if(vis){if(!W)armar();if(RM){for(let i=0;i<120;i++)paso(.05);dib(performance.now())}else arranca()}}),{threshold:.05}).observe(cv);
 let rz=0;addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(()=>{if(vis)armar()},200)})}

function interacciones(){
 const N=[['hog',190,150,'Hogar cultivador','act','casa'],['aco',470,150,'Acopio (Bavaria)','act','acopio'],['tie',750,150,'Tienda o comedor','act','tienda'],['cora',990,150,'Corabastos','pas','mercado'],
  ['bav',190,40,'Bavaria Común','act','inst'],['pro',470,40,'Promotor','act','promotor'],['asa',750,40,'Asamblea rotativa','act','asamblea'],
  ['par',190,280,'Parcela','pas','brote'],['hum',470,280,'Humedal','pas','agua'],['com',750,280,'Compost / suelo','pas','compost'],['ave',990,280,'Aves','act','ave'],['calle',990,40,'Calles · vehículos','pas','carro']];
 const P={};N.forEach(n=>P[n[0]]=n);
 const E=[['hog','aco',1],['aco','tie',1],['tie','cora',2],['bav','pro',1],['pro','hog',1],['asa','hog',1],['hog','par',3],['par','hum',3],['com','par',3],['ave','hum',3],['tie','calle',3],['hog','com',3]];
 let s='<svg viewBox="0 0 1100 330" style="min-width:760px" role="img" aria-label="Interacciones entre agentes y con el entorno"><defs><marker id="fi" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 1L10 5L0 9z" fill="context-stroke"/></marker></defs>';
 E.forEach(([a,b,k],j)=>{const A=P[a],B=P[b];let x1=A[1],y1=A[2],x2=B[1],y2=B[2];const dx=x2-x1,dy=y2-y1,l=Math.hypot(dx,dy),ox=dx/l,oy=dy/l,ra=Math.abs(ox)>.5?92:20;x1+=ox*ra;y1+=oy*ra;x2-=ox*ra;y2-=oy*ra;
  const col=k===3?'#8fe7f2':LIM,id='ie'+j;s+='<path id="'+id+'" d="M'+x1+' '+y1+'L'+x2+' '+y2+'" stroke="'+col+'" stroke-width="1.2" fill="none" marker-end="url(#fi)" '+(k===2?'marker-start="url(#fi)"':'')+' opacity=".55"/>';
  // un agente (punto) que recorre la relación
  if(!RM)for(let q=0;q<2;q++)s+='<circle r="3.2" fill="'+col+'"><animateMotion dur="'+(2.4+j%3*.5)+'s" begin="'+(q*1.3+j*.17).toFixed(2)+'s" repeatCount="indefinite" '+(k===2&&q?'keyPoints="1;0" keyTimes="0;1" calcMode="linear"':'')+'><mpath href="#'+id+'"/></animateMotion></circle>'});
 N.forEach(([k,x,y,t,tp,i])=>{const w=176;s+='<rect x="'+(x-w/2)+'" y="'+(y-18)+'" width="'+w+'" height="36" fill="'+(tp==='act'?'rgba(207,255,94,.07)':'#050607')+'" stroke="'+(tp==='act'?'rgba(207,255,94,.6)':'rgba(214,228,222,.3)')+'"/>'+
  '<g transform="translate('+(x-w/2+10)+' '+(y-9)+') scale(.75)" fill="none" stroke="'+(tp==='act'?LIM:'#a9b3af')+'" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+I[i]+'</g>'+
  '<text x="'+(x+12)+'" y="'+(y+4.5)+'" text-anchor="middle" font-size="13" fill="#eaefed">'+esc(t)+'</text>'});
 s+='<text x="20" y="322" font-size="10" fill="#7a8480" font-family="Geist Mono,monospace" letter-spacing="1">VERDE: AGENTE–AGENTE · CIAN: AGENTE–ENTORNO · RELLENO: ACTIVO · SIN RELLENO: PASIVO · LOS PUNTOS SON AGENTES EN MOVIMIENTO</text>';
 return s+'</svg>'}

if(!montar()){const t=setInterval(()=>{if(montar())clearInterval(t)},150)}
})();
