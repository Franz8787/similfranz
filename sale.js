/* similFranz · schede dei progetti e sale di simulazione isometriche.
   Tutto si genera da window.SIMILFRANZ_PROGETTI (progetti.js). */
(function () {
  "use strict";
  var P = window.SIMILFRANZ_PROGETTI || [];
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function soon(p) { return p.stato !== "disponibile"; }
  function statusHTML(p) { return '<span class="status' + (soon(p) ? " soon" : "") + '">' + (soon(p) ? "In arrivo" : "Disponibile") + "</span>"; }
  function doiHTML(p) { return p.doi ? '<p class="doi">DOI <a href="https://doi.org/' + esc(p.doi) + '">' + esc(p.doi) + "</a></p>" : ""; }
  function enterHTML(p) { return '<a class="btn primary enter" href="' + esc(p.pagina) + '">Entra nel progetto →</a>' + (soon(p) ? '<p class="note">La pagina si accende con la pubblicazione.</p>' : ""); }

  /* ---------- schede dell'ecosistema ---------- */
  var cards = document.getElementById("cards");
  if (cards) {
    P.forEach(function (p) {
      var a = el("article", "card reveal");
      a.style.setProperty("--acc", p.accento || "#46f2a0");
      a.innerHTML =
        '<figure><img src="' + esc(p.immagine) + '" loading="lazy" alt="' + esc(p.alt || p.nome) + '"></figure>' +
        '<div class="body">' + statusHTML(p) + "<h3>" + esc(p.nome) + "</h3>" +
        '<p class="device">' + esc(p.dispositivo) + "</p><p>" + esc(p.descrizione) + "</p>" + doiHTML(p) +
        '<div class="links">' + enterHTML(p) + "</div></div>";
      cards.appendChild(a);
    });
  }
  var count = document.getElementById("count-word");
  if (count) count.textContent = ["Uno", "Due", "Tre", "Quattro", "Cinque", "Sei", "Sette", "Otto"][P.length - 1] || String(P.length);

  /* ---------- fallback delle sale: schede normali ---------- */
  var fb = document.getElementById("sale-fallback-list");
  if (fb) {
    P.forEach(function (p) {
      var s = p.sala || {};
      var d = el("article", "room-card");
      d.style.setProperty("--acc", p.accento || "#46f2a0");
      d.innerHTML = "<h3>Sala «" + esc(p.nome.replace(/^similFranz\s*/, "")) + "»</h3><p>" + esc(s.scena || p.descrizione) + "</p>" +
        (s.azioni ? '<p class="note">Dalla regia: ' + s.azioni.map(function (x) { return esc(x.etichetta); }).join(" · ") + "</p>" : "") +
        '<div class="links">' + enterHTML(p) + "</div>";
      fb.appendChild(d);
    });
    var rw = P.filter(function (p) { return p.regia_web; }).map(function (p) { return "<li><b>" + esc(p.nome.replace(/^similFranz\s*/, "")) + "</b> " + esc(p.regia_web) + "</li>"; }).join("");
    var rc = el("article", "room-card");
    rc.style.setProperty("--acc", "#8fb6d8");
    rc.innerHTML = "<h3>Sala regia</h3><p>Ogni dispositivo dell'ecosistema ha la sua <b>regia web</b>, servita dal dispositivo stesso. La apri dal browser di un computer collegato alla stessa rete Wi-Fi® dei dispositivi: indirizzo e PIN li leggi sul dispositivo. Niente da installare.</p>" +
      "<p>Così da un solo PC, dietro il vetro, conduci i dispositivi della sala: parametri, stati e scenari, sonde, registro e debriefing.</p>" +
      (rw ? '<ul class="regia-list">' + rw + "</ul>" : "") + '<p class="note">Ogni regia web guida il proprio dispositivo: le apri in schede diverse dello stesso browser. La portata dipende dalla rete del posto: prova il collegamento prima del corso.</p>' +
      '<div class="links"><a class="btn primary enter" href="#ecosistema">Scopri l\'ecosistema</a></div>';
    fb.appendChild(rc);
  }

  /* emersione delle schede (anche quelle appena generate) */
  var revs = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    revs.forEach(function (e) { e.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revs.forEach(function (e) { io.observe(e); });
  }

  /* le schede sono generate adesso: riallinea l'ancora dell'indirizzo */
  if (location.hash && location.hash.length > 1) {
    var tgt = document.getElementById(location.hash.slice(1));
    if (tgt) setTimeout(function () { tgt.scrollIntoView({ block: tgt.id === "sale" ? "center" : "start", behavior: "instant" }); }, 30);
  }

  /* ---------- sale 3D ---------- */
  var box = document.getElementById("sale");
  var canvas = document.getElementById("sale-canvas");
  function fallback() { if (box) box.classList.add("is-fallback"); }
  if (!box || !canvas || typeof THREE === "undefined" || !P.length) { fallback(); return; }
  var gl = null;
  try { gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl"); } catch (e) {}
  if (!gl) { fallback(); return; }
  var renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: canvas, context: gl, antialias: true, powerPreference: "low-power" }); }
  catch (e) { fallback(); return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x05090f, 1);
  renderer.outputEncoding = THREE.sRGBEncoding;
  box.classList.add("is-3d");

  var scene = new THREE.Scene();
  var camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200);
  scene.add(new THREE.HemisphereLight(0x8fb6d8, 0x0a0f16, 0.55));
  var sun = new THREE.DirectionalLight(0xbcd2ff, 0.5); sun.position.set(-6, 12, 8); scene.add(sun);

  /* ---------- elettrocardiogramma per gli schermi ---------- */
  function g(x, mu, s) { var d = (x - mu) / s; return Math.exp(-0.5 * d * d); }
  function beat(tb) { return 0.12 * g(tb, 0.16, 0.03) - 0.1 * g(tb, 0.35, 0.012) + 1.0 * g(tb, 0.38, 0.014) - 0.25 * g(tb, 0.41, 0.014) + 0.3 * g(tb, 0.62, 0.05); }
  function ecgv(t, hr, vf) {
    if (vf) return 0.45 * (0.6 * Math.sin(2 * Math.PI * 4.9 * t + 1.4 * Math.sin(4.4 * t)) + 0.35 * Math.sin(2 * Math.PI * 3.3 * t + 0.5) + 0.2 * Math.sin(2 * Math.PI * 7.1 * t));
    var p = 60 / hr, tb = t % p; return beat(tb * Math.min(1, p / 0.8));
  }
  function pleth(t, hr) { var p = 60 / hr, x = (t % p) / p; return Math.exp(-Math.pow((x - 0.2) / 0.1, 2)) * 0.9 + Math.exp(-Math.pow((x - 0.5) / 0.12, 2)) * 0.35; }

  var VAL = {
    base: { hr: 78, spo2: 97, pa: "124/76" },
    tachicardia: { hr: 136, spo2: 95, pa: "132/84" },
    ipotensione: { hr: 118, spo2: 93, pa: "78/42", alarm: "PA BASSA" },
    fv: { hr: 0, spo2: 0, pa: "--/--", vf: true, alarm: "ALLARME · FV" },
    rosc: { hr: 96, spo2: 92, pa: "102/64" },
    nosonda: { hr: 0, spo2: 0, nos: true },
    desat: { hr: 112, spo2: 86, alarm: "SpO₂ BASSA" },
    recupero: { hr: 90, spo2: 95 }
  };
  var STATO_TXT = { base: "parametri stabili", tachicardia: "tachicardia", ipotensione: "ipotensione", fv: "fibrillazione ventricolare: compressioni toraciche", rosc: "ROSC: compressioni sospese, si rivaluta", nosonda: "sonda non applicata", desat: "desaturazione", recupero: "la saturazione risale" };

  function drawMonitor(ctx, W, H, st, t) {
    var v = VAL[st] || VAL.base;
    ctx.fillStyle = "#020405"; ctx.fillRect(0, 0, W, H);
    var gw = W * 0.66;
    function trace(color, y0, amp, fn) {
      ctx.strokeStyle = color; ctx.lineWidth = 2.2; ctx.beginPath();
      for (var x = 0; x <= gw - 10; x += 2) { var tt = t - (gw - 10 - x) / 110; var y = y0 - amp * fn(tt); x ? ctx.lineTo(8 + x, y) : ctx.moveTo(8 + x, y); }
      ctx.stroke();
    }
    trace("#46f2a0", H * 0.33, H * 0.17, function (tt) { return ecgv(tt, v.hr || 60, v.vf); });
    if (!v.vf) trace("#5fd4ff", H * 0.62, H * 0.12, function (tt) { return pleth(tt, v.hr); });
    else { ctx.strokeStyle = "#5fd4ff"; ctx.beginPath(); ctx.moveTo(8, H * 0.6); ctx.lineTo(gw - 2, H * 0.6); ctx.stroke(); }
    ctx.fillStyle = "#123"; ctx.fillRect(gw + 4, 6, 1.5, H - 12);
    ctx.textAlign = "right"; ctx.font = "700 " + Math.round(H * 0.22) + "px sans-serif";
    ctx.fillStyle = "#46f2a0"; ctx.fillText(v.vf ? "FV" : String(v.hr), W - 10, H * 0.3);
    ctx.fillStyle = "#5fd4ff"; ctx.font = "700 " + Math.round(H * 0.17) + "px sans-serif"; ctx.fillText(v.spo2 ? String(v.spo2) : "--", W - 10, H * 0.56);
    ctx.fillStyle = "#ff7a8a"; ctx.font = "700 " + Math.round(H * 0.12) + "px sans-serif"; ctx.fillText(v.pa || "", W - 10, H * 0.78);
    ctx.textAlign = "left"; ctx.font = "600 " + Math.round(H * 0.07) + "px sans-serif"; ctx.fillStyle = "#ffbe5c";
    ctx.fillText("SIMULAZIONE", 10, H - 10);
    if (v.alarm && (Math.floor(t * 2) % 2 === 0 || reduce)) { ctx.fillStyle = "#ff4d5e"; ctx.fillRect(8, 6, gw * 0.7, H * 0.1); ctx.fillStyle = "#fff"; ctx.font = "700 " + Math.round(H * 0.075) + "px sans-serif"; ctx.fillText(v.alarm, 14, 6 + H * 0.078); }
  }
  function drawSpo2(ctx, W, H, st, t) {
    var v = VAL[st] || VAL.base;
    ctx.fillStyle = "#020405"; ctx.fillRect(0, 0, W, H);
    ctx.textAlign = "center";
    ctx.fillStyle = "#5fd4ff"; ctx.font = "700 " + Math.round(W * 0.42) + "px sans-serif"; ctx.fillText(v.nos ? "--" : String(v.spo2), W / 2, H * 0.36);
    ctx.font = "600 " + Math.round(W * 0.1) + "px sans-serif"; ctx.fillText("SpO₂ %", W / 2, H * 0.12);
    ctx.fillStyle = "#46f2a0"; ctx.font = "700 " + Math.round(W * 0.26) + "px sans-serif"; ctx.fillText(v.nos ? "--" : String(v.hr), W / 2, H * 0.62);
    if (!v.nos) {
      ctx.strokeStyle = "#5fd4ff"; ctx.lineWidth = 3; ctx.beginPath();
      for (var x = 0; x <= W - 20; x += 3) { var y = H * 0.86 - H * 0.12 * pleth(t - (W - 20 - x) / 90, v.hr); x ? ctx.lineTo(10 + x, y) : ctx.moveTo(10 + x, y); }
      ctx.stroke();
    }
    if (v.alarm && (Math.floor(t * 2) % 2 === 0 || reduce)) { ctx.fillStyle = "#ff4d5e"; ctx.fillRect(0, 0, W, H * 0.045); ctx.fillRect(0, H * 0.955, W, H * 0.045); }
  }
  function drawRegia(ctx, W, H, acc, flash) {
    ctx.fillStyle = "#16283a"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = acc; ctx.globalAlpha = 0.9; ctx.fillRect(W * 0.06, H * 0.08, W * 0.5, H * 0.12);
    ctx.globalAlpha = 0.6;
    for (var i = 0; i < 3; i++) ctx.fillRect(W * 0.06, H * (0.3 + i * 0.18), W * 0.88, H * 0.12);
    ctx.globalAlpha = 1;
    if (flash > 0) { ctx.fillStyle = "rgba(255,255,255," + (0.6 * flash).toFixed(2) + ")"; ctx.fillRect(0, 0, W, H); }
  }


  /* ---------- materiali di base ---------- */
  function std(c, o) { var m = new THREE.MeshStandardMaterial({ color: c, roughness: 0.85, metalness: 0 }); if (o) for (var k in o) m[k] = o[k]; return m; }
  var M = {
    floor: std(0x1a2632), wall: std(0x223140), trim: std(0x2e4050), bedFrame: std(0x6b7785), mattress: std(0xb8c6d3),
    pillow: std(0xdfe7ee), cart: std(0x3a4654), cartTop: std(0x55626f), mannequin: std(0xd9967c, { roughness: 0.7 }), placeholder: std(0x7d8a96),
    corridor: std(0x16202b), metal: std(0x8a96a3, { roughness: 0.5 }), desk: std(0x2c3a48), chair: std(0x3b4b5c), table: std(0x4a5868),
    step: std(0x55636f),
    glass: new THREE.MeshStandardMaterial({ color: 0x9fd0ff, transparent: true, opacity: 0.13, roughness: 0.1, depthWrite: false }),
    bag: new THREE.MeshStandardMaterial({ color: 0xdff3ff, transparent: true, opacity: 0.55, roughness: 0.3 })
  };
  var lite = window.innerWidth < 700; // telefono: meno figure

  /* ---------- il centro di simulazione: sale dei progetti su un corridoio comune ---------- */
  var ROOM = 5, CW = 2.6, GAP = 0.2, W_REGIA = 4.2, W_DEBRIEF = 5, PRE = 3.4;
  var rooms = [], fixed = [], walkers = [];
  var root = new THREE.Group(); scene.add(root);

  function screenMat(w, h) {
    var c = document.createElement("canvas"); c.width = w; c.height = h;
    var tex = new THREE.CanvasTexture(c); tex.encoding = THREE.sRGBEncoding; tex.minFilter = THREE.LinearFilter; tex.generateMipmaps = false;
    var m = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, side: THREE.DoubleSide });
    return { canvas: c, ctx: c.getContext("2d"), tex: tex, mat: m };
  }
  function boxMesh(w, h, d, m) { return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); }
  function personPlaceholder(color) {
    var gp = new THREE.Group();
    var body = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, 1.25, 10), std(color)); body.position.y = 0.62; gp.add(body);
    var head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 10), std(0xcfb9a6)); head.position.y = 1.45; gp.add(head);
    return gp;
  }
  // parete di vetro con porta e targhetta luminosa (lato corridoio)
  function glassWall(G, width, z, doorX, acc, list) {
    var dw = 1.1, a0 = -width / 2, a1 = doorX - dw / 2, b0 = doorX + dw / 2, b1 = width / 2;
    [[a0, a1], [b0, b1]].forEach(function (seg) {
      var len = seg[1] - seg[0]; if (len <= 0.05) return;
      var g1 = boxMesh(len, 1.3, 0.04, M.glass); g1.position.set((seg[0] + seg[1]) / 2, 0.65, z); G.add(g1);
      var top = boxMesh(len, 0.04, 0.06, M.trim); top.position.set((seg[0] + seg[1]) / 2, 1.3, z); G.add(top);
    });
    [a1, b0].forEach(function (x) { var post = boxMesh(0.07, 1.3, 0.08, M.trim); post.position.set(x, 0.65, z); G.add(post); });
    var plateMat = new THREE.MeshBasicMaterial({ color: acc.clone(), toneMapped: false });
    var plate = boxMesh(0.8, 0.16, 0.05, plateMat); plate.position.set(doorX, 1.45, z); G.add(plate);
    if (list) list.push({ mat: plateMat, base: acc.clone() });
    return plate;
  }
  function chair(G, x, z, rotY, mat) {
    var c = new THREE.Group(); c.position.set(x, 0, z); c.rotation.y = rotY || 0;
    var seat = boxMesh(0.44, 0.06, 0.42, mat || M.chair); seat.position.y = 0.46; c.add(seat);
    var back = boxMesh(0.44, 0.45, 0.05, mat || M.chair); back.position.set(0, 0.7, -0.19); c.add(back);
    [[-0.19, -0.18], [0.19, -0.18], [-0.19, 0.18], [0.19, 0.18]].forEach(function (q) { var l = boxMesh(0.04, 0.44, 0.04, M.metal); l.position.set(q[0], 0.22, q[1]); c.add(l); });
    G.add(c); return c;
  }
  function ivPole(G, x, z) {
    var p = new THREE.Group(); p.position.set(x, 0, z);
    var base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.04, 10), M.metal); base.position.y = 0.04; p.add(base);
    var pole = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.8, 6), M.metal); pole.position.y = 0.95; p.add(pole);
    var hook = boxMesh(0.4, 0.02, 0.02, M.metal); hook.position.y = 1.82; p.add(hook);
    var bag = boxMesh(0.14, 0.24, 0.05, M.bag); bag.position.set(0.15, 1.66, 0); p.add(bag);
    G.add(p); return p;
  }
  function wallScreen(G, w, h, cw, ch) {
    var sm = screenMat(cw, ch);
    var frame = boxMesh(w + 0.08, h + 0.08, 0.05, std(0x0c1117)); G.add(frame);
    var pl = new THREE.Mesh(new THREE.PlaneGeometry(w, h), sm.mat); pl.position.z = 0.03; frame.add(pl);
    return { frame: frame, sm: sm };
  }

  /* disposizione: dietro il corridoio le sale dei progetti; davanti regia, debriefing e, se sono tante, le altre sale */
  function plan() {
    var back = [], front = [];
    var n = P.length, nb = n <= 4 ? n : Math.ceil(n / 2);
    for (var i = 0; i < n; i++) (i < nb ? back : front).push({ type: "room", i: i, w: ROOM });
    front.unshift({ type: "regia", w: W_REGIA });
    front.push({ type: "debrief", w: W_DEBRIEF });
    function place(row, z) {
      var tot = row.reduce(function (s, it) { return s + it.w; }, 0) + GAP * (row.length - 1), x = -tot / 2;
      row.forEach(function (it) { it.x = x + it.w / 2; it.z = z; x += it.w + GAP; });
      return tot;
    }
    var zb = -(CW / 2 + ROOM / 2), zf = CW / 2 + ROOM / 2;
    var tb = place(back, zb), tf = place(front, zf);
    var half = Math.max(tb, tf) / 2;
    return { back: back, front: front, x0: -half - PRE, x1: half + 0.3, zb: zb, zf: zf };
  }
  var PLAN = plan();

  function buildRoom(p, i, slot) {
    var s = p.sala || {}, front = slot.z > 0;
    var acc = new THREE.Color(p.accento || "#46f2a0");
    var r = { p: p, s: s, i: i, acc: acc, front: front, group: new THREE.Group(), state: s.stato_iniziale || (s.schermo === "spo2" ? "nosonda" : "base"), step: -1, flash: 0, pulse: 0, t0: 0, plates: [] };
    var G = r.group;
    G.position.set(slot.x, 0, slot.z);
    var floor = boxMesh(ROOM, 0.12, ROOM, M.floor.clone()); floor.position.y = -0.06; G.add(floor); r.floor = floor;
    var w2 = boxMesh(0.12, 1.3, ROOM, M.wall); w2.position.set(-ROOM / 2, 0.65, 0); G.add(w2);
    var edgeMat = new THREE.MeshBasicMaterial({ color: acc, transparent: true, opacity: 0.35 });
    var e2 = boxMesh(0.03, 0.03, ROOM, edgeMat); e2.position.set(-ROOM / 2 + 0.06, 1.31, 0); G.add(e2);
    var e4 = boxMesh(0.04, 0.02, ROOM, edgeMat); e4.position.set(ROOM / 2, 0.005, 0); G.add(e4);
    if (!front) {
      var w1 = boxMesh(ROOM, 1.3, 0.12, M.wall); w1.position.set(0, 0.65, -ROOM / 2); G.add(w1);
      var e1 = boxMesh(ROOM, 0.03, 0.03, edgeMat); e1.position.set(0, 1.31, -ROOM / 2 + 0.06); G.add(e1);
      glassWall(G, ROOM, ROOM / 2, 1.2, acc, r.plates);
    } else {
      var e3 = boxMesh(ROOM, 0.02, 0.04, edgeMat); e3.position.set(0, 0.005, ROOM / 2); G.add(e3);
      glassWall(G, ROOM, -ROOM / 2, 0.6, acc, r.plates);
    }
    r.edgeMat = edgeMat;
    // letto
    var bed = new THREE.Group(); bed.position.set(-0.2, 0, -0.35);
    var frame = boxMesh(2.1, 0.08, 0.95, M.bedFrame); frame.position.y = 0.5; bed.add(frame);
    [[-0.95, -0.4], [0.95, -0.4], [-0.95, 0.4], [0.95, 0.4]].forEach(function (q) { var l = boxMesh(0.06, 0.5, 0.06, M.bedFrame); l.position.set(q[0], 0.25, q[1]); bed.add(l); });
    var matt = boxMesh(2.0, 0.14, 0.88, M.mattress); matt.position.y = 0.61; bed.add(matt);
    var pil = boxMesh(0.36, 0.08, 0.6, M.pillow); pil.position.set(-0.78, 0.72, 0); bed.add(pil);
    G.add(bed); r.bed = bed;
    ivPole(G, -1.55, -1.05);
    // pedana per le compressioni (compare solo quando serve)
    var step = boxMesh(0.7, 1, 0.5, M.step); step.visible = false; G.add(step); r.stepBox = step;
    // manichino
    r.mannequinSlot = new THREE.Group(); r.mannequinSlot.position.set(0.72, 0.7, -0.35); G.add(r.mannequinSlot);
    var mp = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.6, 10), M.mannequin);
    mp.rotation.z = Math.PI / 2; mp.position.set(-0.8, 0.08, 0); r.mannequinSlot.add(mp); r.mannequinPh = mp;
    // dispositivo
    var dev = new THREE.Group(); r.dev = dev; G.add(dev);
    var sm = s.schermo === "spo2" ? screenMat(160, 240) : screenMat(320, 200);
    r.screen = sm;
    if (s.posto === "dito") {
      dev.position.set(0.42, 0.69, 0.0); dev.rotation.set(0, -0.5, 0); dev.userData.scale = 4.2;
      var cable = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.42, 6), std(0xe8e8e8)); cable.rotation.z = Math.PI / 2; cable.rotation.y = 0.6;
      cable.position.set(0.62, 0.7, -0.12); G.add(cable);
    } else {
      var cart = new THREE.Group(); cart.position.set(-1.15, 0, -1.65);
      var cb = boxMesh(0.8, 0.9, 0.55, M.cart); cb.position.y = 0.45; cart.add(cb);
      var ct = boxMesh(0.86, 0.04, 0.6, M.cartTop); ct.position.y = 0.92; cart.add(ct);
      G.add(cart);
      dev.position.set(-1.15, 0.94, -1.62); dev.rotation.y = 0.35; dev.userData.scale = 3.0;
    }
    var ph = new THREE.Group();
    if (s.schermo === "spo2") {
      var b = boxMesh(0.07, 0.015, 0.13, std(0xe8ecef)); b.position.y = 0.008; ph.add(b);
      var sc = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.075), sm.mat); sc.rotation.x = -Math.PI / 2; sc.position.y = 0.017; ph.add(sc);
    } else {
      var body = boxMesh(0.25, 0.17, 0.09, std(0xcfd3d8)); body.position.y = 0.085; ph.add(body);
      var h = boxMesh(0.16, 0.02, 0.03, std(0x2b2e33)); h.position.y = 0.19; ph.add(h);
      var sc2 = new THREE.Mesh(new THREE.PlaneGeometry(0.19, 0.12), sm.mat); sc2.position.set(0, 0.085, 0.046); ph.add(sc2);
    }
    ph.scale.setScalar(dev.userData.scale); dev.add(ph); r.devPh = ph;
    // persone: p1 al fianco del letto, p2 verso la testa, l'istruttore in disparte
    r.slots = [
      { role: "p1", pos: [s.posto === "dito" ? -0.75 : 0.15, 0, 0.55], rotY: Math.PI, color: 0x2f8f9d },
      { role: "p2", pos: [-1.65, 0, 0.35], rotY: Math.PI / 2 + 0.5, color: 0x3d6fb6 },
      { role: "istr", pos: [1.6, 0, -1.25], rotY: -1.13, color: 0x34383f }
    ];
    r.slots.forEach(function (sl) {
      var gp = new THREE.Group(); gp.position.set(sl.pos[0], 0, sl.pos[2]); gp.rotation.y = sl.rotY;
      var ph2 = personPlaceholder(sl.color); gp.add(ph2);
      G.add(gp); sl.group = gp; sl.ph = ph2; sl.base = sl.pos.slice(); sl.cur = { x: sl.pos[0], z: sl.pos[2], y: 0, rot: sl.rotY };
    });
    // regia in mano all'istruttore
    var reg = { telefono: [0.09, 0.17], pocket: [0.08, 0.15], ipad: [0.2, 0.15], tablet: [0.24, 0.16] }[s.regia] || [0.2, 0.14];
    var rs = screenMat(128, 96);
    var slab = new THREE.Group();
    var sb = boxMesh(reg[0] * 2.2, 0.02, reg[1] * 2.2, std(0x111316)); slab.add(sb);
    var sp = new THREE.Mesh(new THREE.PlaneGeometry(reg[0] * 2.0, reg[1] * 2.0), rs.mat); sp.rotation.x = -Math.PI / 2; sp.position.y = 0.012; slab.add(sp);
    r.regia = slab; r.regiaScreen = rs; r.regiaHalfW = reg[0] * 1.1;
    var istr = r.slots[2].group; slab.position.set(0, 1.05, 0.34); slab.rotation.x = 0.55; istr.add(slab);
    // collegamento regia → dispositivo
    var NL = 16, linkGeo = new THREE.BufferGeometry();
    linkGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(NL * 3), 3));
    var linkMat = new THREE.PointsMaterial({ color: acc.clone(), size: 6, sizeAttenuation: false, transparent: true, opacity: 0.9, depthWrite: false });
    var link = new THREE.Points(linkGeo, linkMat); link.frustumCulled = false; G.add(link); r.link = link; r.linkMat = linkMat;
    var lamp = new THREE.PointLight(0xfff2e0, 0.5, 7, 2); lamp.position.set(0, 2.8, 0); G.add(lamp); r.lamp = lamp;
    var hit = boxMesh(ROOM, 2, ROOM, new THREE.MeshBasicMaterial({ visible: false })); hit.position.y = 1; hit.userData.room = r; G.add(hit); r.hit = hit;
    var ih = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.9, 8), new THREE.MeshBasicMaterial({ visible: false })); ih.position.y = 0.95;
    ih.userData.instructor = r; r.slots[2].group.add(ih); r.instrHit = ih;
    var dh = boxMesh(0.8, 0.8, 0.8, new THREE.MeshBasicMaterial({ visible: false })); dh.userData.device = r; dh.position.y = 0.3; dev.add(dh); r.devHit = dh;
    root.add(G);
    return r;
  }

  /* sala regia: vetro sul corridoio, banco con schermi accesi */
  function buildRegia(slot) {
    var G = new THREE.Group(); G.position.set(slot.x, 0, slot.z);
    var f = { kind: "regia", group: G, w: slot.w, plates: [], screens: [] };
    var acc = new THREE.Color(0x8fb6d8);
    var floor = boxMesh(slot.w, 0.12, ROOM, M.floor); floor.position.y = -0.06; G.add(floor);
    var w2 = boxMesh(0.12, 1.3, ROOM, M.wall); w2.position.set(-slot.w / 2, 0.65, 0); G.add(w2);
    glassWall(G, slot.w, -ROOM / 2, slot.w / 2 - 0.8, acc, f.plates);
    var desk = boxMesh(3.0, 0.08, 0.7, M.desk); desk.position.set(-0.3, 0.75, -1.5); G.add(desk);
    var dl = boxMesh(3.0, 0.7, 0.05, M.desk); dl.position.set(-0.3, 0.38, -1.83); G.add(dl);
    // tre schermi: una regia web per dispositivo, con il colore d'accento del progetto
    [-1.3, -0.3, 0.7].forEach(function (x, k) {
      var ws = wallScreen(G, 0.62, 0.4, 256, 160); ws.frame.position.set(x, 1.05, -1.62); ws.frame.rotation.x = -0.08;
      ws.kind = "mini"; ws.p = P.length ? P[k % P.length] : null; f.screens.push(ws);
    });
    var kb = boxMesh(0.42, 0.025, 0.15, std(0x10161d)); kb.position.set(-0.8, 0.8, -1.3); G.add(kb); f.keyboard = kb;
    chair(G, -0.8, -0.85, Math.PI); chair(G, 0.3, -0.85, Math.PI);
    f.seats = [{ x: -0.8, z: -0.75, rotY: Math.PI }];
    f.edgeMat = new THREE.MeshBasicMaterial({ color: acc, transparent: true, opacity: 0.35 });
    var e4 = boxMesh(0.04, 0.02, ROOM, f.edgeMat); e4.position.set(slot.w / 2, 0.005, 0); G.add(e4);
    var e3 = boxMesh(slot.w, 0.02, 0.04, f.edgeMat); e3.position.set(0, 0.005, ROOM / 2); G.add(e3);
    f.floor = floor; floor.material = M.floor.clone();
    f.lamp = new THREE.PointLight(0xdfeaff, 0.4, 6, 2); f.lamp.position.set(0, 2.6, -0.4); G.add(f.lamp);
    f.hit = boxMesh(slot.w, 2, ROOM, new THREE.MeshBasicMaterial({ visible: false })); f.hit.position.y = 1; f.hit.userData.regia = f; G.add(f.hit);
    f.pc = new THREE.Vector3(-0.3, 1.2, -1.6);
    root.add(G); return f;
  }
  /* sala debriefing: tavolo, sedie, schermo con la timeline */
  function buildDebrief(slot) {
    var G = new THREE.Group(); G.position.set(slot.x, 0, slot.z);
    var f = { kind: "debrief", group: G, w: slot.w, plates: [], screens: [] };
    var acc = new THREE.Color(0xc9a6ff);
    var floor = boxMesh(slot.w, 0.12, ROOM, M.floor); floor.position.y = -0.06; G.add(floor);
    var w2 = boxMesh(0.12, 1.3, ROOM, M.wall); w2.position.set(-slot.w / 2, 0.65, 0); G.add(w2);
    glassWall(G, slot.w, -ROOM / 2, slot.w / 2 - 0.9, acc, f.plates);
    var top = boxMesh(2.4, 0.06, 1.1, M.table); top.position.set(0.3, 0.74, 0.2); G.add(top);
    [[-0.8, -0.35], [1.4, -0.35], [-0.8, 0.75], [1.4, 0.75]].forEach(function (q) { var l = boxMesh(0.06, 0.72, 0.06, M.metal); l.position.set(q[0], 0.36, q[1]); G.add(l); });
    var seats = [[-0.5, -0.55, 0], [0.3, -0.55, 0], [1.1, -0.55, 0], [-0.5, 0.95, Math.PI], [0.3, 0.95, Math.PI], [1.1, 0.95, Math.PI]];
    seats.forEach(function (q) { chair(G, q[0], q[1], q[2]); });
    f.seats = [{ x: 0.3, z: -0.42, rotY: 0 }, { x: -0.5, z: 0.82, rotY: Math.PI }, { x: 1.1, z: 0.82, rotY: Math.PI }];
    var ws = wallScreen(G, 1.5, 0.85, 384, 216); ws.frame.position.set(-slot.w / 2 + 0.1, 1.15, 0.2); ws.frame.rotation.y = Math.PI / 2;
    ws.kind = "timeline"; f.screens.push(ws);
    root.add(G); return f;
  }

  /* corridoio e angolo della familiarizzazione */
  var corridor = new THREE.Group(); root.add(corridor);
  (function () {
    var len = PLAN.x1 - PLAN.x0, cx = (PLAN.x0 + PLAN.x1) / 2;
    var fl = boxMesh(len, 0.1, CW, M.corridor); fl.position.set(cx, -0.07, 0); corridor.add(fl);
    corridor.userData.strip = new THREE.MeshBasicMaterial({ color: 0x2b6f7a, toneMapped: false });
    var strip = boxMesh(len - 0.6, 0.012, 0.05, corridor.userData.strip); strip.position.set(cx, 0.0, 0); corridor.add(strip);
    var endW = boxMesh(0.12, 1.3, CW + ROOM, M.wall); endW.position.set(PLAN.x0, 0.65, PLAN.zb / 2 + CW / 4 - 0.0); corridor.add(endW);
    // familiarizzazione: sedie in semicerchio davanti a un piccolo schermo
    var px = PLAN.x0 + PRE / 2 + 0.1;
    var floorP = boxMesh(PRE, 0.11, ROOM, M.floor); floorP.position.set(px, -0.065, PLAN.zb); corridor.add(floorP);
    var wb = boxMesh(PRE, 1.3, 0.12, M.wall); wb.position.set(px, 0.65, PLAN.zb - ROOM / 2); corridor.add(wb);
    var ws = wallScreen(corridor, 1.2, 0.7, 320, 180); ws.frame.position.set(px, 1.1, PLAN.zb - ROOM / 2 + 0.1);
    ws.kind = "prebrief"; corridor.userData.screen = ws;
    [-1, -0.35, 0.35, 1].forEach(function (dx, k) { chair(corridor, px + dx, PLAN.zb + 0.2 + Math.abs(dx) * -0.35, Math.PI + dx * 0.25); });
    corridor.userData.preX = px;
  })();

  PLAN.back.concat(PLAN.front).forEach(function (it) {
    if (it.type === "room") rooms[it.i] = buildRoom(P[it.i], it.i, it);
    else if (it.type === "regia") fixed.push(buildRegia(it));
    else fixed.push(buildDebrief(it));
  });
  function layout() { /* la pianta è fissa: si adatta la camera */ }
  var REG = fixed.filter(function (f) { return f.kind === "regia"; })[0];
  REG.kind = "regia"; REG.label = "Sala regia";
  // scie dal PC della regia verso i dispositivi delle sale: la rete Wi-Fi comune
  REG.trails = rooms.map(function (r) {
    var gq = new THREE.BufferGeometry(); gq.setAttribute("position", new THREE.BufferAttribute(new Float32Array(20 * 3), 3));
    var m = new THREE.PointsMaterial({ color: r.acc.clone(), size: 6, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false });
    var pts = new THREE.Points(gq, m); pts.frustumCulled = false; root.add(pts);
    return { r: r, pts: pts, mat: m, phase: Math.random() };
  });
  function updateTrails(dt) {
    var on = selected === REG, pc = REG.group.localToWorld(REG.pc.clone());
    REG.trails.forEach(function (tr, j) {
      tr.mat.opacity += ((on ? 0.95 : 0) - tr.mat.opacity) * (reduce ? 1 : Math.min(1, dt * 4));
      tr.pts.visible = tr.mat.opacity > 0.02;
      if (!tr.pts.visible) return;
      var b = tr.r.dev.getWorldPosition(new THREE.Vector3()); b.y += tr.r.s.posto === "dito" ? 0.1 : 0.45;
      var pos = tr.pts.geometry.attributes.position, n = pos.count;
      tr.phase = (tr.phase + (reduce ? 0 : 0.22 * dt)) % 1;
      var lift = 1.2 + pc.distanceTo(b) * 0.12;
      for (var i = 0; i < n; i++) {
        var k = (i / n + tr.phase) % 1;
        pos.setXYZ(i, pc.x + (b.x - pc.x) * k, pc.y + (b.y - pc.y) * k + Math.sin(k * Math.PI) * lift, pc.z + (b.z - pc.z) * k);
      }
      pos.needsUpdate = true;
    });
  }
  // l'operatore della regia tocca la tastiera
  function poseOperator(t) {
    var o = REG.operator; if (!o || !o.rig) return;
    o.group.updateMatrixWorld(true);
    var fwd = new THREE.Vector3(Math.sin(o.group.rotation.y), 0, Math.cos(o.group.rotation.y));
    var kb = REG.keyboard.getWorldPosition(new THREE.Vector3()), right = new THREE.Vector3(-fwd.z, 0, fwd.x);
    lean(o.rig, fwd, 10, 22);
    var down = new THREE.Vector3(0, -1, 0);
    aim(o.rig["UpperArm.R"], down.clone().multiplyScalar(0.8).add(fwd.clone().multiplyScalar(0.5)));
    aim(o.rig["UpperArm.L"], down.clone().multiplyScalar(0.8).add(fwd.clone().multiplyScalar(0.5)));
    var tapR = reduce ? 0 : Math.max(0, Math.sin(t * 9)) * 0.03, tapL = reduce ? 0 : Math.max(0, Math.sin(t * 9 + 2.2)) * 0.03;
    var hr = kb.clone().add(right.clone().multiplyScalar(0.1)); hr.y += 0.02 + tapR;
    var hl = kb.clone().add(right.clone().multiplyScalar(-0.1)); hl.y += 0.02 + tapL;
    aimAt(o.rig["LowerArm.R"], hr); aimAt(o.rig["LowerArm.L"], hl);
    aim(o.rig["Palm.R"], fwd.clone().add(down.clone().multiplyScalar(0.4))); aim(o.rig["Palm.L"], fwd.clone().add(down.clone().multiplyScalar(0.4)));
  }

  /* ---------- schermi delle sale fisse ---------- */
  function drawTimeline(ctx, W, H, t) {
    ctx.fillStyle = "#06101a"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#cfd8e3"; ctx.font = "700 18px sans-serif"; ctx.textAlign = "left"; ctx.fillText("Debriefing · cronologia", 16, 30);
    var y0 = H * 0.62, x0 = 20, x1 = W - 20;
    ctx.strokeStyle = "#3b5166"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
    var ev = [[0.08, "#46f2a0", "inizio"], [0.32, "#ffbe5c", "FV"], [0.38, "#5fd4ff", "RCP"], [0.52, "#ff7a8a", "scarica"], [0.74, "#46f2a0", "ROSC"]];
    ctx.font = "600 13px sans-serif";
    ev.forEach(function (e) { var x = x0 + (x1 - x0) * e[0]; ctx.fillStyle = e[1]; ctx.beginPath(); ctx.arc(x, y0, 7, 0, 6.3); ctx.fill(); ctx.fillText(e[2], x - 14, y0 - 16); });
    var cx = x0 + (x1 - x0) * ((t * 0.04) % 1);
    ctx.strokeStyle = "rgba(255,255,255,.7)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, y0 - 34); ctx.lineTo(cx, y0 + 26); ctx.stroke();
  }
  function drawPrebrief(ctx, W, H) {
    ctx.fillStyle = "#081420"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#46f2a0"; ctx.font = "700 24px sans-serif"; ctx.textAlign = "left"; ctx.fillText("Familiarizzazione", 18, 40);
    ctx.fillStyle = "#cfd8e3"; ctx.font = "500 16px sans-serif";
    ["obiettivi di apprendimento", "il dispositivo: come funziona", "il patto di finzione"].forEach(function (s, k) { ctx.fillText("· " + s, 22, 80 + k * 30); });
  }

  /* ---------- caricamento dei modelli ---------- */
  var loader = THREE.GLTFLoader ? new THREE.GLTFLoader() : null;
  var cache = {};
  function load(url) {
    if (!cache[url]) cache[url] = new Promise(function (res, rej) { loader.load(url, res, undefined, rej); });
    return cache[url];
  }
  var mixers = [];
  var FACE = ["Eyes", "Eyebrows"];
  function findNode(obj, name) { var key = name.replace(/[^A-Za-z]/g, ""), f = null; obj.traverse(function (o) { if (!f && o.name.replace(/[^A-Za-z]/g, "") === key) f = o; }); return f; }
  function findBone(obj, name) { var key = name.replace(/[^A-Za-z]/g, ""), f = null; obj.traverse(function (o) { if (!f && o.isBone && o.name.replace(/[^A-Za-z]/g, "") === key) f = o; }); return f; }
  function prepPerson(gltf, look) {
    var m = THREE.SkeletonUtils ? THREE.SkeletonUtils.clone(gltf.scene) : gltf.scene.clone(true);
    var skin = null;
    m.traverse(function (o) {
      if (o.isMesh) {
        o.frustumCulled = false;
        var mats = (Array.isArray(o.material) ? o.material : [o.material]).map(function (mt) { var c = mt.clone(); if (/Skin/i.test(mt.name)) skin = c.color; return c; });
        mats.forEach(function (c) {
          if (look === "manichino") { c.color.set(0xd9967c); c.roughness = 0.7; c.metalness = 0; }
          else if (/Shirt|Jacket/i.test(c.name)) c.color.set(look.top);
          else if (/Pants/i.test(c.name)) c.color.set(look.bottom);
          else if (/Shoe|Sock/i.test(c.name)) c.color.set(0x1c2026);
          if (c.emissive) c.emissive.set(0x000000);
        });
        o.material = Array.isArray(o.material) ? mats : mats[0];
      }
    });
    m.traverse(function (o) {
      if (o.isMesh) (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (c) {
        if (FACE.some(function (f) { return c.name.indexOf(f) === 0; })) c.color.copy(look === "manichino" ? new THREE.Color(0xd9967c) : (skin || c.color));
      });
    });
    m.updateMatrixWorld(true);
    var hb = findBone(m, "Head"), fb = findBone(m, "Foot.L") || findBone(m, "LowerLeg.L");
    var hgt = 1;
    if (hb && fb) { var hv = hb.getWorldPosition(new THREE.Vector3()), fv = fb.getWorldPosition(new THREE.Vector3()); hgt = hv.distanceTo(fv) * 1.12; }
    m.scale.multiplyScalar(1.7 / (hgt || 1));
    m.updateMatrixWorld(true);
    if (fb) { var f2 = fb.getWorldPosition(new THREE.Vector3()); m.position.y -= f2.y - 0.06; }
    return m;
  }
  // ossa usate per le posture (con il «figlio» che indica la direzione dell'osso)
  var CHAIN = { Abdomen: "Torso", Torso: "Neck", Neck: "Head", Head: "Head_end",
    "UpperArm.R": "LowerArm.R", "LowerArm.R": "Palm.R", "Palm.R": "MiddleHand.R",
    "UpperArm.L": "LowerArm.L", "LowerArm.L": "Palm.L", "Palm.L": "MiddleHand.L" };
  function rigOf(m) {
    var rig = {};
    Object.keys(CHAIN).forEach(function (k) { rig[k] = { b: findBone(m, k), c: findNode(m, CHAIN[k]) }; });
    return rig;
  }
  var LOOKS = {
    p1: { top: 0x2f8f9d, bottom: 0x2a6f7a },
    p2: { top: 0x4a78c2, bottom: 0x35558a },
    istr: { top: 0x2b2f36, bottom: 0x1f2329 },
    w1: { top: 0x6b5ca5, bottom: 0x3a3550 },
    w2: { top: 0x2f8f9d, bottom: 0x2a6f7a },
    d: { top: 0x4a78c2, bottom: 0x35558a }
  };
  var FILES = { p1: "modelli/donna2.glb", p2: "modelli/uomo.glb", istr: "modelli/donna.glb", manichino: "modelli/uomo.glb" };
  function clipOf(gltf, re) { return gltf.animations.filter(function (a) { return re.test(a.name); })[0]; }

  function attachPeople() {
    if (!loader) return Promise.resolve();
    return Promise.all([load(FILES.p1), load(FILES.p2), load(FILES.istr)]).then(function (gs) {
      var byFile = {}; byFile[FILES.p1] = gs[0]; byFile[FILES.p2] = gs[1]; byFile[FILES.istr] = gs[2];
      rooms.forEach(function (r, ri) {
        r.slots.forEach(function (sl, si) {
          var gltf = byFile[FILES[sl.role]];
          var m = prepPerson(gltf, LOOKS[sl.role]);
          sl.group.remove(sl.ph); sl.group.add(m); sl.model = m;
          var mx = new THREE.AnimationMixer(m);
          var clip = clipOf(gltf, /Idle/) || gltf.animations[0];
          if (clip) { var a = mx.clipAction(clip); a.play(); a.time = (ri * 0.9 + si * 0.37) % (clip.duration || 1); }
          mx.update(0.001);
          sl.mixer = mx; mixers.push(mx);
          sl.rig = rigOf(m);
        });
        var mm = prepPerson(byFile[FILES.manichino], "manichino");
        var inner = new THREE.Group(); inner.rotation.x = -Math.PI / 2; inner.add(mm);
        var outer = new THREE.Group(); outer.rotation.y = Math.PI / 2; outer.add(inner);
        outer.position.set(0, -0.02, 0);
        r.mannequinSlot.remove(r.mannequinPh); r.mannequinSlot.add(outer);
        var mmx = new THREE.AnimationMixer(mm);
        var c2 = clipOf(byFile[FILES.manichino], /Standing|Idle/);
        if (c2) { mmx.clipAction(c2).play(); mmx.update(0.001); }
        r.mannequin = mm; r.mannequinTorso = findBone(mm, "Torso");
        r.mBones = { torso: findBone(mm, "Torso"), neck: findBone(mm, "Neck"), head: findBone(mm, "Head"), abd: findBone(mm, "Abdomen") };
      });
      // vita nel centro: chi siede in regia e al debriefing, chi cammina nel corridoio
      var seated = clipOf(gs[1], /Sitting/);
      fixed.forEach(function (f) {
        var max = lite ? 1 : f.seats.length;
        f.seats.slice(0, max).forEach(function (st, k) {
          var file = [gs[0], gs[1], gs[2]][k % 3], look = [LOOKS.w2, LOOKS.d, LOOKS.w1][k % 3];
          var m = prepPerson(file, look);
          var gp = new THREE.Group(); gp.position.set(st.x, 0, st.z); gp.rotation.y = st.rotY; gp.add(m); f.group.add(gp);
          var mx = new THREE.AnimationMixer(m), c = clipOf(file, /Sitting/) || seated;
          if (c) { var a = mx.clipAction(c); a.play(); a.time = c.duration * 0.62; a.timeScale = 0; }
          mx.update(0.001); mixers.push(mx);
          if (f.kind === "regia" && k === 0) f.operator = { group: gp, model: m, rig: rigOf(m) };
        });
      });
      var nW = lite ? 1 : 2;
      for (var k = 0; k < nW; k++) {
        var file = k ? gs[0] : gs[1], m = prepPerson(file, k ? LOOKS.w2 : LOOKS.w1);
        var gp = new THREE.Group(); gp.add(m); corridor.add(gp);
        var mx = new THREE.AnimationMixer(m), c = clipOf(file, /Walk/);
        if (c) mx.clipAction(c).play();
        mx.update(0.001); mixers.push(mx);
        walkers.push({ g: gp, lane: k ? 0.45 : -0.45, phase: k ? 0.55 : 0.05, speed: k ? 0.95 : 1.1 });
      }
    }).catch(function (e) { if (window.console) console.warn("modelli persone:", e); });
  }
  function attachDevices() {
    if (!loader) return Promise.resolve();
    return Promise.all(rooms.map(function (r) {
      if (!r.s.modello) return null;
      return load(r.s.modello).then(function (gltf) {
        var m = gltf.scene.clone(true);
        m.traverse(function (o) {
          if (o.isMesh) {
            if (/screen/i.test(o.name) || (o.material && /screen/i.test(o.material.name))) {
              // i modelli glTF hanno le coordinate della texture con la V rovesciata: stessa tela, ma senza flipY, altrimenti lo schermo esce capovolto
              if (!r.screen.matGlb) {
                var tg = new THREE.CanvasTexture(r.screen.canvas); tg.encoding = THREE.sRGBEncoding; tg.minFilter = THREE.LinearFilter; tg.generateMipmaps = false; tg.flipY = false;
                r.screen.texGlb = tg; r.screen.matGlb = new THREE.MeshBasicMaterial({ map: tg, toneMapped: false, side: THREE.DoubleSide });
              }
              o.material = r.screen.matGlb;
            }
            else { o.material = o.material.clone(); o.material.roughness = 0.6; o.material.metalness = 0; }
          }
        });
        m.scale.setScalar(r.dev.userData.scale);
        r.dev.remove(r.devPh); r.dev.add(m); r.devModel = m;
      }).catch(function () {});
    }));
  }

  /* ---------- posture: ossa orientate verso un punto (cinematica inversa semplice) ---------- */
  var _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _qp = new THREE.Quaternion(), _a = new THREE.Vector3(), _b = new THREE.Vector3(), _d = new THREE.Vector3();
  function aim(j, dir) {
    if (!j || !j.b || !j.c) return;
    j.b.updateMatrixWorld(true);
    j.b.getWorldPosition(_a); j.c.getWorldPosition(_b);
    _d.subVectors(_b, _a); if (_d.lengthSq() < 1e-10) return; _d.normalize();
    _q.setFromUnitVectors(_d, dir.clone().normalize());
    j.b.getWorldQuaternion(_q2); _q2.premultiply(_q);
    j.b.parent.getWorldQuaternion(_qp); _qp.invert();
    j.b.quaternion.copy(_qp.multiply(_q2));
    j.b.updateMatrixWorld(true);
  }
  function aimAt(j, target) { if (!j || !j.b) return; j.b.getWorldPosition(_a); aim(j, new THREE.Vector3().subVectors(target, _a)); }
  function wp(o) { return o.getWorldPosition(new THREE.Vector3()); }
  function lean(rig, fwd, deg, headDeg) {
    var up = new THREE.Vector3(0, 1, 0);
    function d(a) { a = a * Math.PI / 180; return up.clone().multiplyScalar(Math.cos(a)).add(fwd.clone().multiplyScalar(Math.sin(a))); }
    aim(rig.Abdomen, d(deg * 0.55)); aim(rig.Torso, d(deg)); aim(rig.Neck, d(deg + 5)); aim(rig.Head, d(headDeg != null ? headDeg : deg + 12));
  }
  function arm(rig, side, target, palmDir) {
    aimAt(rig["UpperArm." + side], target); aimAt(rig["LowerArm." + side], target);
    if (palmDir) aim(rig["Palm." + side], palmDir); else aimAt(rig["Palm." + side], target);
  }
  function armLen(rig) {
    var u = rig["UpperArm.R"], l = rig["LowerArm.R"], p = rig["Palm.R"];
    if (!u.b || !l.b || !p.b || !p.c) return 0.6;
    return wp(u.b).distanceTo(wp(l.b)) + wp(l.b).distanceTo(wp(p.b)) + wp(p.b).distanceTo(wp(p.c)) * 0.6;
  }
  function facing(sl) { return new THREE.Vector3(Math.sin(sl.group.rotation.y), 0, Math.cos(sl.group.rotation.y)); }
  function local(r, v) { return r.group.worldToLocal(v.clone()); }

  // punti del manichino (mondo)
  function chestPoint(r) {
    if (!r.mBones || !r.mBones.torso || !r.mBones.neck) return r.group.localToWorld(new THREE.Vector3(0.1, 0.86, -0.35));
    r.mannequin.updateMatrixWorld(true);
    // metà inferiore dello sterno: poco sopra l'osso «Torso», in superficie
    var a = wp(r.mBones.torso), b = wp(r.mBones.neck);
    var ab = r.mBones.abd ? wp(r.mBones.abd) : a; var c = b.clone().lerp(ab, 0.42); c.y = r.group.position.y + 0.92; return c;
  }
  function headPoint(r) {
    if (!r.mBones || !r.mBones.head) return r.group.localToWorld(new THREE.Vector3(-0.95, 0.85, -0.35));
    var h = wp(r.mBones.head); h.y += 0.12; return h;
  }
  function screenPoint(r) { var p = wp(r.dev); p.y += r.s.posto === "dito" ? 0.06 : 0.45; return p; }

  // dove deve stare ciascuno, per stato (coordinate della sala)
  function slotGoal(r, k) {
    var st = r.state, sl = r.slots[k], bz = r.bed.position.z, bx = r.bed.position.x;
    if (k === 0) {
      if (st === "fv" || st === "rosc") {
        var c = local(r, chestPoint(r));
        // ROSC: compressioni sospese, un passo indietro, in piedi a rivalutare
        return { x: c.x, z: bz + 0.44 + (st === "fv" ? 0.34 : 0.62), rot: Math.PI, pose: st === "fv" ? "cpr" : "look" };
      }
      if (r.s.posto === "dito" && (st === "base" || st === "recupero")) return { x: 0.42, z: bz + 0.44 + 0.42, rot: Math.PI, pose: st === "base" ? "probe" : "idle" };
      if (st === "tachicardia" || st === "ipotensione" || st === "desat") return { x: sl.base[0], z: sl.base[2], rot: null, pose: "point" };
      return { x: sl.base[0], z: sl.base[2], rot: sl.rotY, pose: "idle" };
    }
    if (k === 1) {
      if (st === "fv" || st === "rosc" || st === "desat" || st === "recupero") {
        var h = local(r, headPoint(r));
        return { x: h.x - 0.62, z: bz, rot: Math.PI / 2, pose: "airway" };
      }
      if (st === "tachicardia" || st === "ipotensione") return { x: sl.base[0], z: sl.base[2], rot: null, pose: "look" };
      return { x: sl.base[0], z: sl.base[2], rot: sl.rotY, pose: "idle" };
    }
    return { x: sl.base[0], z: sl.base[2], rot: sl.rotY, pose: "hold" };
  }
  function yawTo(sl, r, target) { var p = wp(sl.group), d = target.clone().sub(p); return Math.atan2(d.x, d.z); }
  function angLerp(a, b, k) { var d = ((b - a + Math.PI * 3) % (Math.PI * 2)) - Math.PI; return a + d * k; }

  function poseRoom(r, t, dt) {
    var mv = reduce ? 1 : Math.min(1, dt * 3);
    r.stepBox.visible = false;
    r.slots.forEach(function (sl, k) {
      if (!sl.model || !sl.rig) return;
      var g = slotGoal(r, k), rig = sl.rig;
      var rot = g.rot != null ? g.rot : yawTo(sl, r, screenPoint(r));
      // si sposta in fretta (circa 1,6 m/s) verso il suo posto
      var ddx = g.x - sl.cur.x, ddz = g.z - sl.cur.z, dist = Math.sqrt(ddx * ddx + ddz * ddz), stepLen = reduce ? dist : Math.min(dist, 1.6 * dt);
      if (dist > 1e-4) { sl.cur.x += ddx / dist * stepLen; sl.cur.z += ddz / dist * stepLen; }
      sl.cur.rot = angLerp(sl.cur.rot, rot, reduce ? 1 : Math.min(1, dt * 6));
      var arrived = dist - stepLen < 0.02;
      sl.group.position.set(sl.cur.x, 0, sl.cur.z); sl.group.rotation.y = sl.cur.rot;
      sl.model.rotation.x = 0;
      sl.group.updateMatrixWorld(true);
      var fwd = facing(sl);
      if (g.pose === "cpr" && arrived) {
        // compressioni: braccia tese e verticali, mani al centro del torace, spalle sopra le mani; il movimento parte dalle anche
        var c = chestPoint(r), len = armLen(rig);
        var TILT = 0.26; // sulla pedana il corpo si inclina dalle caviglie: le anche arrivano sopra il bordo del letto
        if (!sl.cpr) {
          // cerca la flessione delle anche che porta le spalle sopra il torace con i piedi fuori dal letto
          var edge = r.group.localToWorld(new THREE.Vector3(0, 0, r.bed.position.z + 0.475 + 0.1)).z, best = null;
          for (var deg = 30; deg <= 64; deg += 2) {
            sl.mixer.update(0); sl.model.rotation.x = TILT; sl.group.updateMatrixWorld(true);
            lean(rig, fwd, deg, deg + 25);
            var shR = wp(rig["UpperArm.R"].b), shL = wp(rig["UpperArm.L"].b), mid = shR.add(shL).multiplyScalar(0.5);
            var dx = c.x - mid.x, dz = c.z - mid.z, feetZ = wp(sl.group).z + dz;
            best = { dx: dx, dz: dz, y: Math.max(0, c.y + len - mid.y), deg: deg };
            if (feetZ >= edge) break;
          }
          sl.cpr = best;
          sl.mixer.update(0);
        }
        sl.model.rotation.x = TILT;
        sl.group.position.set(sl.cur.x + sl.cpr.dx, sl.cpr.y, sl.cur.z + sl.cpr.dz);
        sl.group.updateMatrixWorld(true);
        var ph = reduce ? 0.5 : 0.5 - 0.5 * Math.cos(2 * Math.PI * 1.83 * t); // 110/min, compressione e rilascio di pari durata
        lean(rig, fwd, sl.cpr.deg + 3 * ph, sl.cpr.deg + 25);
        var hand = c.clone(); hand.y -= 0.05 * ph;
        var across = new THREE.Vector3(fwd.z, -0.25, -fwd.x);
        arm(rig, "R", hand, across); arm(rig, "L", hand.clone().add(new THREE.Vector3(0, 0.03, 0)), across);
        r.stepBox.visible = sl.cpr.y > 0.03;
        if (r.stepBox.visible) { r.stepBox.scale.y = sl.cpr.y; r.stepBox.position.set(sl.cur.x + sl.cpr.dx, sl.cpr.y / 2, sl.cur.z + sl.cpr.dz + 0.05); }
        r.compress = ph;
        return;
      }
      if (g.pose !== "cpr") sl.cpr = null;
      if (g.pose === "probe" && arrived) {
        var dv = screenPoint(r); dv.y += 0.02;
        lean(rig, fwd, 32, 55); arm(rig, "R", dv); return;
      }
      if (g.pose === "point") {
        var sp = screenPoint(r);
        lean(rig, fwd, 4, 0); arm(rig, "R", sp); return;
      }
      if (g.pose === "look") { lean(rig, fwd, 6, 4); return; }
      if (g.pose === "airway" && arrived) {
        // «side» punta alla DESTRA della figura (avanti × alto): mano destra a destra del viso, sinistra a sinistra, mai incrociate
        var hp = headPoint(r), side = new THREE.Vector3(-fwd.z, 0, fwd.x).multiplyScalar(0.13);
        lean(rig, fwd, 26, 50); arm(rig, "R", hp.clone().add(side)); arm(rig, "L", hp.clone().sub(side)); return;
      }
      if (g.pose === "hold") {
        // l'istruttore tiene la regia davanti a sé; quando dà il cue abbassa lo sguardo e tocca lo schermo
        var sw = wp(r.regia), rightV = new THREE.Vector3(-fwd.z, 0, fwd.x);
        var cue = r.flash > 0;
        lean(rig, fwd, 3, cue ? 38 : 22);
        var down = new THREE.Vector3(0, -1, 0), elbowDir = down.clone().multiplyScalar(0.92).add(fwd.clone().multiplyScalar(0.3));
        aim(rig["UpperArm.R"], elbowDir); aim(rig["UpperArm.L"], elbowDir);
        var hl = sw.clone().add(rightV.clone().multiplyScalar(-r.regiaHalfW));
        var hr = cue ? sw.clone().add(new THREE.Vector3(0, 0.03 + 0.02 * Math.sin(t * 18), 0)) : sw.clone().add(rightV.clone().multiplyScalar(r.regiaHalfW));
        aimAt(rig["LowerArm.L"], hl); aimAt(rig["LowerArm.R"], hr);
        aim(rig["Palm.L"], fwd); aim(rig["Palm.R"], cue ? fwd.clone().add(down) : fwd);
      }
    });
    if (r.mannequinTorso) {
      if (r.state === "fv" && r.compress != null) { var cp = r.compress; r.mannequinTorso.scale.set(1, 1 - 0.04 * cp, 1 - 0.07 * cp); }
      else if (!reduce) { var br = Math.sin(t * 2 * Math.PI / 4) * 0.5 + 0.5; r.mannequinTorso.scale.set(1, 1 + 0.035 * br, 1 + 0.06 * br); }
    }
    if (r.state !== "fv") r.compress = null;
  }

  /* ---------- camera isometrica ---------- */
  var cam = { tx: 0, ty: 0.6, tz: 0, half: 8, az: Math.PI / 4 };
  var camGoal = { tx: 0, ty: 0.6, tz: 0, half: 8, az: Math.PI / 4 };
  var selected = null, scrollAz = 0;
  function overviewGoal() {
    var pts = [];
    [[PLAN.x0, PLAN.zb - ROOM / 2], [PLAN.x1, PLAN.zb - ROOM / 2], [PLAN.x0, PLAN.zf + ROOM / 2], [PLAN.x1, PLAN.zf + ROOM / 2]].forEach(function (q) {
      [0, 1.6].forEach(function (y) { pts.push(new THREE.Vector3(q[0], y, q[1])); });
    });
    var W = canvas.clientWidth || 800, H = canvas.clientHeight || 600, asp = W / H;
    var az = Math.PI / 4 + scrollAz, dir = camDir(az), up = new THREE.Vector3(0, 1, 0);
    var right = new THREE.Vector3().crossVectors(up, dir).normalize(), camUp = new THREE.Vector3().crossVectors(dir, right).normalize();
    var minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
    pts.forEach(function (v) { var x = v.dot(right), y = v.dot(camUp); minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); });
    var cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
    var c = right.clone().multiplyScalar(cx).add(camUp.clone().multiplyScalar(cy));
    var half = Math.max((maxY - minY) / 2, (maxX - minX) / 2 / asp) * 1.06;
    return { tx: c.x, ty: c.y, tz: c.z, half: half, az: az };
  }
  function roomGoal(r) {
    var W = canvas.clientWidth || 800, H = canvas.clientHeight || 600, asp = W / H;
    var side = W >= 860;
    var half = Math.max(2.9, 3.2 / Math.min(1, asp * 0.9));
    if (side) half = 3.25;
    var p = r.group.position;
    var g = { tx: p.x + 0.1, ty: 0.7, tz: p.z + 0.1, half: half, az: Math.PI / 4 + 0.12 };
    if (side) {
      var dir = camDir(g.az), right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), dir).normalize();
      var shift = half * asp * 0.38;
      g.tx += right.x * shift; g.tz += right.z * shift;
    }
    return g;
  }
  var EL = 0.6155;
  function camDir(az) { var el = EL; return new THREE.Vector3(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az)); }
  function applyCam() {
    var W = canvas.clientWidth || 800, H = canvas.clientHeight || 600, asp = W / H;
    camera.left = -cam.half * asp; camera.right = cam.half * asp; camera.top = cam.half; camera.bottom = -cam.half;
    var d = camDir(cam.az).multiplyScalar(40);
    camera.position.set(cam.tx + d.x, cam.ty + d.y, cam.tz + d.z);
    camera.lookAt(cam.tx, cam.ty, cam.tz);
    camera.updateProjectionMatrix();
  }

  /* ---------- interfaccia HTML ---------- */
  var labels = document.getElementById("sale-labels");
  var panel = document.getElementById("sale-panel");
  var tip = document.getElementById("sale-tip");
  var backBtn = document.getElementById("sale-back");
  rooms.forEach(function (r) {
    var b = el("button", "room-btn");
    b.type = "button";
    b.style.setProperty("--acc", r.p.accento || "#46f2a0");
    b.innerHTML = '<span class="dot"></span>Sala «' + esc(r.p.nome.replace(/^similFranz\s*/, "")) + "»" + (soon(r.p) ? ' <small>in arrivo</small>' : "");
    b.setAttribute("aria-label", "Entra nella sala " + r.p.nome);
    b.addEventListener("click", function () { enter(r); });
    labels.appendChild(b); r.btn = b;
  });
  (function () {
    var b = el("button", "room-btn regia-btn");
    b.type = "button"; b.style.setProperty("--acc", "#8fb6d8");
    b.innerHTML = '<span class="dot"></span>Sala regia <small>regia web</small>';
    b.setAttribute("aria-label", "Entra nella sala regia: le regie web dei dispositivi");
    b.addEventListener("click", function () { enter(REG); });
    labels.appendChild(b); REG.btn = b;
  })();
  // didascalie del metodo (non cliccabili)
  var CAPS = [
    { kind: "prebrief", t: "1 · Familiarizzazione", s: "conosci il dispositivo, poi lo scenario" },
    { kind: "debrief", t: "3 · Debriefing", s: "dalla timeline alla riflessione" }
  ];
  CAPS.forEach(function (c) {
    var e = el("p", "room-cap", "<b>" + esc(c.t) + "</b><span>" + esc(c.s) + "</span>");
    labels.appendChild(e); c.el = e;
    c.f = fixed.filter(function (f) { return f.kind === c.kind; })[0];
  });
  backBtn.addEventListener("click", function () { leave(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && selected) leave(); });

  function regiaHTML() {
    var rows = P.filter(function (p) { return p.regia_web; }).map(function (p) {
      return '<li style="--acc:' + esc(p.accento || "#46f2a0") + '"><b>' + esc(p.nome.replace(/^similFranz\s*/, "")) + "</b> " + esc(p.regia_web) + "</li>";
    }).join("");
    return '<p class="act-h">Dietro il vetro</p><h3>Sala regia</h3>' +
      "<p>Ogni dispositivo dell'ecosistema ha la sua <b>regia web</b>, servita dal dispositivo stesso: la apri dal browser di un computer sulla stessa rete Wi-Fi®, con l'indirizzo e il PIN che leggi sul dispositivo. Niente da installare. Se il Wi-Fi arriva bene fino alla sala, la conduci anche da dietro il vetro: parametri, stati e scenari, sonde, registro e debriefing.</p>" +
      (rows ? '<ul class="regia-list">' + rows + "</ul>" : "") +
      '<div class="links"><a class="btn primary enter" href="#ecosistema">Scopri l\'ecosistema</a></div>' +
      '<p class="note">Ogni regia web guida il proprio dispositivo: le apri in schede diverse dello stesso browser. La portata dipende dalla rete del posto: prova il collegamento prima del corso.</p>';
  }
  function renderPanel(r) {
    if (r === REG) { panel.style.setProperty("--acc", "#8fb6d8"); panel.innerHTML = regiaHTML(); return; }
    var p = r.p, s = r.s;
    panel.style.setProperty("--acc", p.accento || "#46f2a0");
    panel.innerHTML =
      statusHTML(p) + "<h3>" + esc(p.nome) + "</h3>" +
      '<p class="device">' + esc(p.dispositivo) + "</p>" +
      "<p>" + esc(p.descrizione) + "</p>" +
      '<div class="act"><p class="act-h">Sei tu l\'istruttore: scegli il prossimo cue</p><div class="act-row"></div>' +
      '<p class="now" aria-live="polite">Sul dispositivo: <b>' + esc(STATO_TXT[r.state] || r.state) + "</b></p></div>" +
      doiHTML(p) + '<div class="links">' + enterHTML(p) + "</div>";
    var row = panel.querySelector(".act-row");
    (s.azioni || []).forEach(function (a, k) {
      var b = el("button", "act-btn"); b.type = "button"; b.textContent = a.etichetta;
      b.addEventListener("click", function () { act(r, k); });
      row.appendChild(b);
    });
  }
  function updateNow(r) {
    var n = panel.querySelector(".now b"); if (n) n.textContent = STATO_TXT[r.state] || r.state;
    panel.querySelectorAll(".act-btn").forEach(function (b, k) { b.classList.toggle("on", k === r.step); });
  }
  function enter(r) {
    if (selected === r) return;
    selected = r;
    box.classList.add("inside");
    renderPanel(r);
    camGoal = roomGoal(r);
    if (reduce) cam = Object.assign({}, camGoal);
    r.t0 = clock;
    clearTimeout(r.auto);
    if (r !== REG && r.step < 0) r.auto = setTimeout(function () { if (selected === r) act(r, 0); }, reduce ? 0 : 1400);
    backBtn.focus({ preventScroll: true });
    kick();
  }
  function leave() {
    if (!selected) return;
    var r = selected; selected = null;
    box.classList.remove("inside");
    camGoal = overviewGoal();
    if (reduce) cam = Object.assign({}, camGoal);
    if (r.btn) r.btn.focus({ preventScroll: true });
    kick();
  }
  function act(r, k) {
    var a = (r.s.azioni || [])[k]; if (!a) return;
    r.step = k; r.flash = 1; r.pulse = 1;
    clearTimeout(r.pend);
    r.pend = setTimeout(function () { r.state = a.stato; updateNow(r); kick(); }, reduce ? 0 : 650);
    updateNow(r);
    kick();
  }

  /* ---------- puntatore ---------- */
  var ray = new THREE.Raycaster(), mouse = new THREE.Vector2(), hover = null;
  function pick(ev) {
    var rc = canvas.getBoundingClientRect();
    mouse.x = ((ev.clientX - rc.left) / rc.width) * 2 - 1; mouse.y = -((ev.clientY - rc.top) / rc.height) * 2 + 1;
    ray.setFromCamera(mouse, camera);
    var targets = [];
    rooms.forEach(function (r) { targets.push(r.instrHit, r.devHit, r.hit); });
    targets.push(REG.hit);
    var hits = ray.intersectObjects(targets, false);
    return hits.length ? hits[0].object : null;
  }
  canvas.addEventListener("pointermove", function (ev) {
    var o = pick(ev), h = null, txt = "";
    if (o) {
      if (o.userData.device) { h = o.userData.device; txt = h.p.nome; }
      else if (o.userData.instructor) { h = o.userData.instructor; txt = selected === h ? "Istruttore: tocca per il prossimo cue" : "Sala «" + h.p.nome.replace(/^similFranz\s*/, "") + "»"; }
      else if (o.userData.room && !selected) { h = o.userData.room; txt = "Entra nella sala «" + h.p.nome.replace(/^similFranz\s*/, "") + "»"; }
      else if (o.userData.regia && !selected) { h = REG; txt = "Entra nella sala regia"; }
    }
    hover = h;
    canvas.style.cursor = h ? "pointer" : "default";
    if (h && txt) {
      var rc = canvas.getBoundingClientRect();
      tip.textContent = txt; tip.hidden = false;
      tip.style.left = Math.min(rc.width - 20, ev.clientX - rc.left + 14) + "px"; tip.style.top = (ev.clientY - rc.top + 14) + "px";
    } else tip.hidden = true;
    kick();
  });
  canvas.addEventListener("pointerleave", function () { hover = null; tip.hidden = true; kick(); });
  canvas.addEventListener("click", function (ev) {
    var o = pick(ev); if (!o) return;
    if (o.userData.instructor && selected === o.userData.instructor) { var r = selected; act(r, (r.step + 1) % (r.s.azioni || [1]).length); return; }
    var r2 = o.userData.device || o.userData.instructor || o.userData.room || o.userData.regia;
    if (r2 && selected !== r2) enter(r2);
  });

  /* ---------- etichette: bottoni delle sale e didascalie, mai sovrapposte ---------- */
  var tmpV = new THREE.Vector3();
  function placeLabels() {
    var W = canvas.clientWidth, H = canvas.clientHeight;
    if (W < 860) { rooms.forEach(function (r) { r.btn.style.transform = ""; }); REG.btn.style.transform = ""; CAPS.forEach(function (c) { c.el.style.transform = ""; }); return; }
    var boxes = [];
    rooms.forEach(function (r) {
      // sale dietro il corridoio: davanti alla porta; sale davanti: sul bordo verso chi guarda
      if (r.front) tmpV.set(-0.3, 0, ROOM / 2).add(r.group.position);
      else tmpV.set(0, 0, ROOM / 2 + 0.5).add(r.group.position);
      tmpV.project(camera);
      var w = r.btn.offsetWidth || 200, h = r.btn.offsetHeight || 34;
      boxes.push({ e: r.btn, w: w, h: h, x: (tmpV.x + 1) / 2 * W, y: (1 - tmpV.y) / 2 * H + (r.front ? 6 + h / 2 : 0) });
    });
    (function () {
      tmpV.set(0, 0, ROOM / 2).add(REG.group.position); tmpV.project(camera);
      var w = REG.btn.offsetWidth || 160, h = REG.btn.offsetHeight || 34;
      boxes.push({ e: REG.btn, w: w, h: h, x: (tmpV.x + 1) / 2 * W, y: (1 - tmpV.y) / 2 * H + 6 + h / 2 });
    })();
    CAPS.forEach(function (c) {
      if (c.kind === "prebrief") tmpV.set(corridor.userData.preX, 0, PLAN.zb + ROOM / 2 + 0.3);
      else if (c.f) tmpV.set(0, 0, ROOM / 2).add(c.f.group.position);
      else return;
      tmpV.project(camera);
      var w = c.el.offsetWidth || 160, h = c.el.offsetHeight || 40;
      boxes.push({ e: c.el, w: w, h: h, x: (tmpV.x + 1) / 2 * W, y: (1 - tmpV.y) / 2 * H + (c.kind === "prebrief" ? 0 : 6 + h / 2) });
    });
    for (var k = 0; k < 30; k++) {
      var moved = false;
      for (var a = 0; a < boxes.length; a++) for (var b = a + 1; b < boxes.length; b++) {
        var A = boxes[a], B = boxes[b];
        var ox = (A.w + B.w) / 2 + 10 - Math.abs(A.x - B.x), oy = (A.h + B.h) / 2 + 8 - Math.abs(A.y - B.y);
        if (ox > 0 && oy > 0) {
          var up = A.y <= B.y ? A : B, dn = up === A ? B : A;
          up.y -= oy / 2; dn.y += oy / 2; moved = true;
        }
      }
      if (!moved) break;
    }
    boxes.forEach(function (q) {
      q.x = Math.max(q.w / 2 + 6, Math.min(W - q.w / 2 - 6, q.x));
      q.y = Math.max(q.h / 2 + 6, Math.min(H - q.h / 2 - 6, q.y));
      q.e.style.transform = "translate(" + Math.round(q.x) + "px," + Math.round(q.y) + "px) translate(-50%, -50%)";
    });
  }

  /* ---------- animazione ---------- */
  var lastDt = 0.016, clock = 0, raf = 0, prev = 0, visible = false, screenTick = 0, needs = true;
  var tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3();
  function updateLink(r) {
    var a = r.regia.getWorldPosition(tmpA), b = r.dev.getWorldPosition(tmpB);
    b.y += r.s.posto === "dito" ? 0.1 : 0.45;
    r.group.worldToLocal(a); r.group.worldToLocal(b);
    var pos = r.link.geometry.attributes.position, n = pos.count;
    r.linkPhase = (r.linkPhase || 0) + (reduce ? 0 : (0.25 + r.pulse * 1.2) * lastDt);
    for (var i = 0; i < n; i++) {
      var k = (i / n + r.linkPhase) % 1;
      pos.setXYZ(i, a.x + (b.x - a.x) * k, a.y + (b.y - a.y) * k + Math.sin(k * Math.PI) * 0.9, a.z + (b.z - a.z) * k);
    }
    pos.needsUpdate = true;
  }
  function updateWalkers(t) {
    var x0 = PLAN.x0 + PRE + 0.6, x1 = PLAN.x1 - 0.8, len = x1 - x0;
    walkers.forEach(function (w) {
      var s = (w.phase + (reduce ? 0 : t * w.speed / (2 * len))) % 1, fwdDir = s < 0.5;
      var u = fwdDir ? s * 2 : 2 - s * 2;
      w.g.position.set(x0 + u * len, 0, w.lane);
      w.g.rotation.y = fwdDir ? Math.PI / 2 : -Math.PI / 2;
    });
  }
  function frame(now) {
    raf = 0;
    var dt = prev ? Math.min(0.05, (now - prev) / 1000) : 0.016; prev = now; lastDt = dt;
    if (!reduce) clock += dt;
    var k = reduce ? 1 : 1 - Math.pow(0.0015, dt);
    ["tx", "ty", "tz", "half", "az"].forEach(function (key) { cam[key] += (camGoal[key] - cam[key]) * k; });
    applyCam();
    var moving = Math.abs(cam.half - camGoal.half) > 0.002 || Math.abs(cam.tx - camGoal.tx) > 0.002 || Math.abs(cam.tz - camGoal.tz) > 0.002;
    mixers.forEach(function (m) { m.update(reduce ? 0 : dt); });
    updateWalkers(clock);
    poseOperator(clock);
    updateTrails(dt);
    var rsel = selected === REG, rhov = hover === REG;
    var rt = selected ? (rsel ? 1.7 : 0.12) : (rhov ? 1.0 : 0.45);
    REG.lamp.intensity += (rt - REG.lamp.intensity) * (reduce ? 1 : Math.min(1, dt * 5));
    REG.edgeMat.opacity = selected ? (rsel ? 0.9 : 0.1) : (rhov ? 0.85 : 0.35);
    REG.floor.material.color.setHex(selected && !rsel ? 0x0e161e : 0x1a2632);
    screenTick++;
    var draw = needs || reduce || screenTick % 2 === 0;
    rooms.forEach(function (r, i) {
      var sel = selected === r, hov = hover === r;
      var breathe = reduce ? 1 : 1 + 0.12 * Math.sin(clock * 0.9 + i * 1.7); // le luci delle sale pulsano piano
      var target = (selected ? (sel ? 1.6 : 0.12) : (hov ? 1.1 : 0.6)) * breathe;
      r.lamp.intensity += (target - r.lamp.intensity) * (reduce ? 1 : Math.min(1, dt * 5));
      r.edgeMat.opacity = selected ? (sel ? 0.9 : 0.12) : (hov ? 0.85 : 0.4);
      r.floor.material.color.setHex(selected && !sel ? 0x0e161e : 0x1a2632);
      r.plates.forEach(function (pl) { pl.mat.color.copy(pl.base).multiplyScalar(0.75 + 0.25 * breathe); });
      r.flash = Math.max(0, r.flash - dt * 1.2); r.pulse = Math.max(0, r.pulse - dt * 0.8);
      poseRoom(r, clock, dt);
      updateLink(r);
      r.linkMat.opacity = selected && !sel ? 0.2 : 0.95;
      if (draw) {
        if (r.s.schermo === "spo2") drawSpo2(r.screen.ctx, 160, 240, r.state, clock);
        else drawMonitor(r.screen.ctx, 320, 200, r.state, clock);
        r.screen.tex.needsUpdate = true; if (r.screen.texGlb) r.screen.texGlb.needsUpdate = true;
        drawRegia(r.regiaScreen.ctx, 128, 96, r.p.accento || "#46f2a0", r.flash);
        r.regiaScreen.tex.needsUpdate = true;
      }
    });
    if (draw && (needs || screenTick % 6 === 0)) {
      fixed.forEach(function (f) {
        f.screens.forEach(function (ws, j) {
          var c = ws.sm.ctx, cw = ws.sm.canvas.width, chh = ws.sm.canvas.height;
          if (ws.kind === "timeline") drawTimeline(c, cw, chh, clock);
          else if (ws.kind === "monitor") drawMonitor(c, cw, chh, "base", clock);
          else if (ws.kind === "mini") drawRegia(c, cw, chh, ws.p ? (ws.p.accento || "#46f2a0") : "#8fb6d8", 0);
          else drawRegia(c, cw, chh, j ? "#5fd4ff" : "#46f2a0", 0);
          ws.sm.tex.needsUpdate = true;
        });
      });
      var pre = corridor.userData.screen;
      if (!pre.drawn) { drawPrebrief(pre.sm.ctx, 320, 180); pre.sm.tex.needsUpdate = true; pre.drawn = true; }
      var sb = reduce ? 1 : 0.8 + 0.2 * Math.sin(clock * 0.6);
      corridor.userData.strip.color.setRGB(0.17 * sb, 0.44 * sb, 0.48 * sb);
    }
    renderer.render(scene, camera);
    placeLabels();
    needs = false;
    if (!reduce && visible && !document.hidden) raf = requestAnimationFrame(frame);
    else if (reduce && moving) raf = requestAnimationFrame(frame);
  }
  function kick() { needs = true; if (!raf) raf = requestAnimationFrame(frame); }

  function resize() {
    var W = canvas.clientWidth, H = canvas.clientHeight;
    renderer.setSize(W, H, false);
    if (W < 700) renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
    layout();
    camGoal = selected ? roomGoal(selected) : overviewGoal();
    cam = Object.assign({}, camGoal);
    kick();
  }
  window.addEventListener("resize", resize);
  window.addEventListener("scroll", function () {
    if (reduce || selected) return;
    var rc = box.getBoundingClientRect(), vh = window.innerHeight;
    var prog = Math.max(-1, Math.min(1, (vh / 2 - (rc.top + rc.height / 2)) / vh));
    scrollAz = prog * 0.22;
    camGoal = overviewGoal();
    kick();
  }, { passive: true });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) kick(); }, { rootMargin: "100px" }).observe(box);
  } else visible = true;
  document.addEventListener("visibilitychange", function () { if (!document.hidden) kick(); });
  canvas.addEventListener("webglcontextlost", function (e) { e.preventDefault(); fallback(); box.classList.remove("is-3d"); });

  resize();
  var loading = document.getElementById("sale-loading");
  Promise.all([attachDevices(), attachPeople()]).then(function () {
    if (loading) loading.hidden = true;
    box.classList.add("loaded");
    kick();
  });
  var q = /[?&]sala=([\w-]+)/.exec(location.search);
  if (q) {
    var rq = q[1] === "regia" ? REG : rooms.filter(function (r) { return r.p.id === q[1]; })[0];
    if (rq) setTimeout(function () { box.scrollIntoView({ block: "center", behavior: "instant" }); enter(rq); }, 50);
  }
  window.__sale = { rooms: rooms, fixed: fixed, enter: enter, leave: leave, act: act,
    view: function (g, el) { if (el != null) EL = el; camGoal = Object.assign({}, cam, g); cam = Object.assign({}, camGoal); kick(); } };
})();
