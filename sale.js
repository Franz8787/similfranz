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

  /* ---------- schede della famiglia ---------- */
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
  var STATO_TXT = { base: "parametri stabili", tachicardia: "tachicardia", ipotensione: "ipotensione", fv: "fibrillazione ventricolare: si parte con le compressioni", rosc: "ROSC: il cuore riparte", nosonda: "sonda non applicata", desat: "desaturazione", recupero: "la saturazione risale" };

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
    pillow: std(0xdfe7ee), cart: std(0x3a4654), cartTop: std(0x55626f), mannequin: std(0xe8dfd2, { roughness: 0.7 }), placeholder: std(0x7d8a96)
  };

  /* ---------- disposizione delle sale ---------- */
  var ROOM = 5, GAP = 1.4;
  var rooms = [];
  var root = new THREE.Group(); scene.add(root);

  function screenMat(w, h) {
    var c = document.createElement("canvas"); c.width = w; c.height = h;
    var tex = new THREE.CanvasTexture(c); tex.encoding = THREE.sRGBEncoding; tex.minFilter = THREE.LinearFilter; tex.generateMipmaps = false;
    var m = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, side: THREE.DoubleSide });
    return { canvas: c, ctx: c.getContext("2d"), tex: tex, mat: m };
  }
  function boxMesh(w, h, d, m) { var b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); return b; }

  function personPlaceholder(color) {
    var gp = new THREE.Group();
    var body = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, 1.25, 10), std(color)); body.position.y = 0.62; gp.add(body);
    var head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 10), std(0xcfb9a6)); head.position.y = 1.45; gp.add(head);
    return gp;
  }

  function buildRoom(p, i) {
    var s = p.sala || {};
    var acc = new THREE.Color(p.accento || "#46f2a0");
    var r = { p: p, s: s, i: i, acc: acc, group: new THREE.Group(), state: s.stato_iniziale || (s.schermo === "spo2" ? "nosonda" : "base"), step: -1, people: [], flash: 0, pulse: 0, t0: 0 };
    var G = r.group;
    // pavimento, pareti basse, bordo luminoso
    var floor = boxMesh(ROOM, 0.12, ROOM, M.floor.clone()); floor.position.y = -0.06; G.add(floor); r.floor = floor;
    var w1 = boxMesh(ROOM, 1.3, 0.12, M.wall); w1.position.set(0, 0.65, -ROOM / 2); G.add(w1);
    var w2 = boxMesh(0.12, 1.3, ROOM, M.wall); w2.position.set(-ROOM / 2, 0.65, 0); G.add(w2);
    var edgeMat = new THREE.MeshBasicMaterial({ color: acc, transparent: true, opacity: 0.35 });
    var e1 = boxMesh(ROOM, 0.03, 0.03, edgeMat); e1.position.set(0, 1.31, -ROOM / 2 + 0.06); G.add(e1);
    var e2 = boxMesh(0.03, 0.03, ROOM, edgeMat); e2.position.set(-ROOM / 2 + 0.06, 1.31, 0); G.add(e2);
    var e3 = boxMesh(ROOM, 0.02, 0.04, edgeMat); e3.position.set(0, 0.005, ROOM / 2); G.add(e3);
    var e4 = boxMesh(0.04, 0.02, ROOM, edgeMat); e4.position.set(ROOM / 2, 0.005, 0); G.add(e4);
    r.edgeMat = edgeMat;
    // letto
    var bed = new THREE.Group(); bed.position.set(-0.2, 0, -0.35);
    var frame = boxMesh(2.1, 0.08, 0.95, M.bedFrame); frame.position.y = 0.5; bed.add(frame);
    [[-0.95, -0.4], [0.95, -0.4], [-0.95, 0.4], [0.95, 0.4]].forEach(function (q) { var l = boxMesh(0.06, 0.5, 0.06, M.bedFrame); l.position.set(q[0], 0.25, q[1]); bed.add(l); });
    var matt = boxMesh(2.0, 0.14, 0.88, M.mattress); matt.position.y = 0.61; bed.add(matt);
    var pil = boxMesh(0.36, 0.08, 0.6, M.pillow); pil.position.set(-0.78, 0.72, 0); bed.add(pil);
    G.add(bed); r.bed = bed;
    // manichino (segnaposto finché non arriva il modello)
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
    // segnaposto del dispositivo (resta per i progetti senza modello)
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
    // persone
    r.slots = [
      { role: "p1", pos: [s.posto === "dito" ? -0.75 : 0.15, 0, 0.55], rotY: Math.PI, color: 0x2f8f9d },
      { role: "p2", pos: [-1.65, 0, 0.35], rotY: Math.PI / 2 + 0.5, color: 0x3d6fb6 },
      { role: "istr", pos: [1.6, 0, -1.25], rotY: -1.13, color: 0x34383f }
    ];
    r.slots.forEach(function (sl) {
      var gp = new THREE.Group(); gp.position.set(sl.pos[0], 0, sl.pos[2]); gp.rotation.y = sl.rotY;
      var ph2 = personPlaceholder(sl.color); gp.add(ph2);
      G.add(gp); sl.group = gp; sl.ph = ph2; sl.base = sl.pos.slice();
    });
    // regia in mano all'istruttore
    var reg = { telefono: [0.09, 0.17], pocket: [0.08, 0.15], ipad: [0.2, 0.15], tablet: [0.24, 0.16] }[s.regia] || [0.2, 0.14];
    var rs = screenMat(128, 96);
    var slab = new THREE.Group();
    var sb = boxMesh(reg[0] * 2.2, 0.02, reg[1] * 2.2, std(0x111316)); slab.add(sb);
    var sp = new THREE.Mesh(new THREE.PlaneGeometry(reg[0] * 2.0, reg[1] * 2.0), rs.mat); sp.rotation.x = -Math.PI / 2; sp.position.y = 0.012; slab.add(sp);
    r.regia = slab; r.regiaScreen = rs;
    var istr = r.slots[2].group; slab.position.set(0, 1.02, 0.32); slab.rotation.x = 0.55; istr.add(slab);
    // collegamento regia → dispositivo: punti di luce che viaggiano, senza rete
    var NL = 16, linkGeo = new THREE.BufferGeometry();
    linkGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(NL * 3), 3));
    var linkMat = new THREE.PointsMaterial({ color: acc.clone(), size: 6, sizeAttenuation: false, transparent: true, opacity: 0.9, depthWrite: false });
    var link = new THREE.Points(linkGeo, linkMat); link.frustumCulled = false; G.add(link); r.link = link; r.linkMat = linkMat;
    // luce della sala
    var lamp = new THREE.PointLight(0xfff2e0, 0.5, 7, 2); lamp.position.set(0, 2.8, 0); G.add(lamp); r.lamp = lamp;
    // bersaglio per il puntatore
    var hit = boxMesh(ROOM, 2, ROOM, new THREE.MeshBasicMaterial({ visible: false })); hit.position.y = 1; hit.userData.room = r; G.add(hit); r.hit = hit;
    var ih = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.9, 8), new THREE.MeshBasicMaterial({ visible: false })); ih.position.y = 0.95;
    ih.userData.instructor = r; r.slots[2].group.add(ih); r.instrHit = ih;
    var dh = boxMesh(0.8, 0.8, 0.8, new THREE.MeshBasicMaterial({ visible: false })); dh.userData.device = r; dh.position.y = 0.3; dev.add(dh); r.devHit = dh;
    root.add(G);
    return r;
  }
  P.forEach(function (p, i) { rooms.push(buildRoom(p, i)); });

  var multiRow = false;
  function layout() {
    var W = canvas.clientWidth || 800, H = canvas.clientHeight || 600;
    // fino a 3 sale una fila; da 4 in su una griglia il più possibile quadrata (4 = 2×2, 5-6 = 3×2, 7-9 = 3×3…)
    var cols = W / H < 0.9 ? 1 : (rooms.length <= 3 ? rooms.length : Math.ceil(Math.sqrt(rooms.length)));
    var rows = Math.ceil(rooms.length / cols), step = ROOM + GAP;
    multiRow = cols > 1 && rows > 1;
    rooms.forEach(function (r, i) {
      if (cols === 1) {
        // telefono: sale impilate in verticale sullo schermo (diagonale del mondo isometrico)
        var d = (i - (rooms.length - 1) / 2) * 5.5;
        r.group.position.set(d, 0, d);
        return;
      }
      var c = i % cols, row = Math.floor(i / cols);
      r.group.position.set((c - (cols - 1) / 2) * step, 0, (row - (rows - 1) / 2) * step);
    });
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
  function prepPerson(gltf, look) {
    var m = THREE.SkeletonUtils ? THREE.SkeletonUtils.clone(gltf.scene) : gltf.scene.clone(true);
    var skin = null;
    m.traverse(function (o) {
      if (o.isMesh) {
        o.frustumCulled = false;
        var mats = Array.isArray(o.material) ? o.material : [o.material];
        mats = mats.map(function (mt) {
          var c = mt.clone();
          if (/Skin/i.test(mt.name)) skin = c.color;
          return c;
        });
        mats.forEach(function (c) {
          if (look === "manichino") { c.color.set(0xe8dfd2); c.roughness = 0.7; c.metalness = 0; }
          else if (/Shirt|Jacket/i.test(c.name)) c.color.set(look.top);
          else if (/Pants/i.test(c.name)) c.color.set(look.bottom);
          else if (/Shoe|Sock/i.test(c.name)) c.color.set(0x1c2026);
          if (c.emissive) c.emissive.set(0x000000);
        });
        o.material = Array.isArray(o.material) ? mats : mats[0];
      }
    });
    // niente volti: occhi e sopracciglia prendono il colore della pelle
    m.traverse(function (o) {
      if (o.isMesh) (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (c) {
        if (FACE.some(function (f) { return c.name.indexOf(f) === 0; })) c.color.copy(look === "manichino" ? new THREE.Color(0xe8dfd2) : (skin || c.color));
      });
    });
    // altezza misurata sulle ossa (il box della mesh con skinning non è affidabile)
    m.updateMatrixWorld(true);
    var hb = findBone(m, "Head"), fb = findBone(m, "Foot.L") || findBone(m, "LowerLeg.L");
    var hgt = 1;
    if (hb && fb) { var hv = hb.getWorldPosition(new THREE.Vector3()), fv = fb.getWorldPosition(new THREE.Vector3()); hgt = hv.distanceTo(fv) * 1.12; m.userData.footY = fv.y; }
    var k = 1.7 / (hgt || 1);
    m.scale.multiplyScalar(k);
    m.updateMatrixWorld(true);
    if (fb) { var f2 = fb.getWorldPosition(new THREE.Vector3()); m.position.y -= f2.y - 0.06; }
    return m;
  }
  function findBone(obj, name) { var key = name.replace(/[^A-Za-z]/g, ""), f = null; obj.traverse(function (o) { if (!f && o.isBone && o.name.replace(/[^A-Za-z]/g, "") === key) f = o; }); return f; }
  var LOOKS = {
    p1: { top: 0x2f8f9d, bottom: 0x2a6f7a },
    p2: { top: 0x4a78c2, bottom: 0x35558a },
    istr: { top: 0x2b2f36, bottom: 0x1f2329 }
  };
  var FILES = { p1: "modelli/donna2.glb", p2: "modelli/uomo.glb", istr: "modelli/donna.glb", manichino: "modelli/uomo.glb" };

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
          var clip = gltf.animations.filter(function (a) { return /Idle/.test(a.name); })[0] || gltf.animations[0];
          if (clip) { var a = mx.clipAction(clip); a.play(); a.time = (ri * 0.9 + si * 0.37) % (clip.duration || 1); }
          mx.update(0.001);
          sl.mixer = mx; mixers.push(mx);
          sl.abdomen = findBone(m, "Abdomen"); sl.torso = findBone(m, "Torso");
          sl.armR = findBone(m, "UpperArm.R"); sl.armL = findBone(m, "UpperArm.L");
          sl.foreR = findBone(m, "LowerArm.R"); sl.foreL = findBone(m, "LowerArm.L");
        });
        // manichino: lo stesso corpo, sdraiato e di un colore solo
        var mm = prepPerson(byFile[FILES.manichino], "manichino");
        var inner = new THREE.Group(); inner.rotation.x = -Math.PI / 2; inner.add(mm);
        var outer = new THREE.Group(); outer.rotation.y = Math.PI / 2; outer.add(inner);
        outer.position.set(0, -0.02, 0);
        r.mannequinSlot.remove(r.mannequinPh); r.mannequinSlot.add(outer);
        var mmx = new THREE.AnimationMixer(mm);
        var c2 = byFile[FILES.manichino].animations.filter(function (a) { return /Standing|Idle/.test(a.name); })[0];
        if (c2) { mmx.clipAction(c2).play(); mmx.update(0.001); }
        r.mannequin = mm; r.mannequinTorso = findBone(mm, "Torso");
      });
    }).catch(function () { /* restano le figure segnaposto */ });
  }
  function attachDevices() {
    if (!loader) return Promise.resolve();
    return Promise.all(rooms.map(function (r) {
      if (!r.s.modello) return null;
      return load(r.s.modello).then(function (gltf) {
        var m = gltf.scene.clone(true);
        m.traverse(function (o) {
          if (o.isMesh) {
            if (/screen/i.test(o.name) || (o.material && /screen/i.test(o.material.name))) o.material = r.screen.mat;
            else { o.material = o.material.clone(); o.material.roughness = 0.6; o.material.metalness = 0; }
          }
        });
        m.scale.setScalar(r.dev.userData.scale);
        r.dev.remove(r.devPh); r.dev.add(m); r.devModel = m;
      }).catch(function () {});
    }));
  }

  /* ---------- camera isometrica ---------- */
  var cam = { tx: 0, ty: 0.6, tz: 0, half: 8, az: Math.PI / 4 };
  var camGoal = { tx: 0, ty: 0.6, tz: 0, half: 8, az: Math.PI / 4 };
  var selected = null, scrollAz = 0;
  function overviewGoal() {
    // inquadra gli angoli reali delle sale (non il box allineato agli assi)
    var pts = [];
    rooms.forEach(function (r) {
      var p = r.group.position;
      [-1, 1].forEach(function (sx) { [-1, 1].forEach(function (sz) { [0, 1.8].forEach(function (y) {
        pts.push(new THREE.Vector3(p.x + sx * ROOM / 2, y, p.z + sz * ROOM / 2));
      }); }); });
    });
    var W = canvas.clientWidth || 800, H = canvas.clientHeight || 600, asp = W / H;
    var az = Math.PI / 4 + scrollAz, dir = camDir(az), up = new THREE.Vector3(0, 1, 0);
    var right = new THREE.Vector3().crossVectors(up, dir).normalize(), camUp = new THREE.Vector3().crossVectors(dir, right).normalize();
    var minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
    pts.forEach(function (v) { var x = v.dot(right), y = v.dot(camUp); minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); });
    var cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
    // centro: punto del mondo che si proietta in (cx, cy) sul piano passante per l'origine
    var c = right.clone().multiplyScalar(cx).add(camUp.clone().multiplyScalar(cy));
    var half = Math.max((maxY - minY) / 2, (maxX - minX) / 2 / asp) * 1.12;
    return { tx: c.x, ty: c.y, tz: c.z, half: half, az: az };
  }
  function roomGoal(r) {
    var W = canvas.clientWidth || 800, H = canvas.clientHeight || 600, asp = W / H;
    var side = W >= 860; // pannello a destra: sposta la sala a sinistra
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
  function camDir(az) { var el = 0.6155; return new THREE.Vector3(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az)); }
  function applyCam() {
    var W = canvas.clientWidth || 800, H = canvas.clientHeight || 600, asp = W / H;
    camera.left = -cam.half * asp; camera.right = cam.half * asp; camera.top = cam.half; camera.bottom = -cam.half;
    var d = camDir(cam.az).multiplyScalar(40);
    camera.position.set(cam.tx + d.x, cam.ty + d.y, cam.tz + d.z);
    camera.lookAt(cam.tx, cam.ty, cam.tz);
    camera.updateProjectionMatrix();
  }

  /* ---------- interfaccia HTML ---------- */
  var ui = document.getElementById("sale-ui");
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
  backBtn.addEventListener("click", function () { leave(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && selected) leave(); });

  function renderPanel(r) {
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
    // piccola scena d'ingresso: dopo un attimo l'istruttore dà il primo cue
    clearTimeout(r.auto);
    if (r.step < 0) r.auto = setTimeout(function () { if (selected === r) act(r, 0); }, reduce ? 0 : 1400);
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
    var hits = ray.intersectObjects(targets, false);
    return hits.length ? hits[0].object : null;
  }
  canvas.addEventListener("pointermove", function (ev) {
    var o = pick(ev), h = null, txt = "";
    if (o) {
      if (o.userData.device) { h = o.userData.device; txt = h.p.nome; }
      else if (o.userData.instructor) { h = o.userData.instructor; txt = selected === h ? "Istruttore: tocca per il prossimo cue" : "Sala «" + h.p.nome.replace(/^similFranz\s*/, "") + "»"; }
      else if (o.userData.room && !selected) { h = o.userData.room; txt = "Entra nella sala «" + h.p.nome.replace(/^similFranz\s*/, "") + "»"; }
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
    var r2 = o.userData.device || o.userData.instructor || o.userData.room;
    if (r2 && selected !== r2) enter(r2);
  });

  /* ---------- etichette e bottoni sopra le sale ---------- */
  var tmpV = new THREE.Vector3();
  function placeLabels() {
    var W = canvas.clientWidth, H = canvas.clientHeight;
    if (W < 860) { rooms.forEach(function (r) { r.btn.style.transform = ""; }); return; }
    var boxes = rooms.map(function (r) {
      // una fila: sotto il bordo anteriore della sala; griglia: dentro la sala, sul pavimento vicino all'angolo verso chi guarda
      if (multiRow) tmpV.set(ROOM / 2 - 1.7, 0, ROOM / 2 - 1.7).add(r.group.position);
      else tmpV.set(-0.3, 0, ROOM / 2).add(r.group.position);
      tmpV.project(camera);
      var w = r.btn.offsetWidth || 200, h = r.btn.offsetHeight || 34;
      return { r: r, w: w, h: h, x: (tmpV.x + 1) / 2 * W, y: (1 - tmpV.y) / 2 * H + (multiRow ? 0 : 6 + h / 2) };
    });
    // le etichette non si devono mai toccare: quelle sovrapposte si allontanano (soprattutto in verticale)
    for (var k = 0; k < 24; k++) {
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
      q.r.btn.style.transform = "translate(" + Math.round(q.x) + "px," + Math.round(q.y) + "px) translate(-50%, -50%)";
    });
  }

  /* ---------- animazione ---------- */
  var lastDt = 0.016, clock = 0, raf = 0, prev = 0, visible = false, screenTick = 0, needs = true;
  var tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3();
  function updateLink(r, t) {
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
  function poseReactions(r, t) {
    var cpr = r.state === "fv", vent = r.state === "desat";
    r.slots.forEach(function (sl, k) {
      if (!sl.model) return;
      sl.group.position.y = 0;
      if (k === 0 && cpr) {
        // compressioni: il primo partecipante si china sul torace e spinge
        sl.group.position.set(r.bed.position.x + 0.15, 0, r.bed.position.z + 0.62);
        var ph = reduce ? 0.5 : (Math.sin(t * Math.PI * 2 * 1.8) * 0.5 + 0.5);
        sl.model.rotation.x = 0.42 + 0.07 * ph;
        sl.group.position.y = -0.04 * ph;
      } else if (k === 0) {
        sl.group.position.set(sl.base[0], 0, sl.base[2]);
        sl.model.rotation.x = 0;
      }
      if (k === 1) sl.model.rotation.x = vent ? 0.3 : 0;
    });
    if (r.mannequinTorso && !reduce) { var br = Math.sin(t * 2 * Math.PI / 4) * 0.5 + 0.5; r.mannequinTorso.scale.set(1, 1 + 0.035 * br, 1 + 0.06 * br); }
  }
  function frame(now) {
    raf = 0;
    var dt = prev ? Math.min(0.05, (now - prev) / 1000) : 0.016; prev = now; lastDt = dt;
    if (!reduce) clock += dt;
    // camera morbida
    var k = reduce ? 1 : 1 - Math.pow(0.0015, dt);
    ["tx", "ty", "tz", "half", "az"].forEach(function (key) { cam[key] += (camGoal[key] - cam[key]) * k; });
    applyCam();
    var moving = Math.abs(cam.half - camGoal.half) > 0.002 || Math.abs(cam.tx - camGoal.tx) > 0.002 || Math.abs(cam.tz - camGoal.tz) > 0.002;
    mixers.forEach(function (m) { m.update(reduce ? 0 : dt); });
    screenTick++;
    rooms.forEach(function (r) {
      var sel = selected === r, hov = hover === r;
      var target = selected ? (sel ? 1.6 : 0.12) : (hov ? 1.1 : 0.6);
      r.lamp.intensity += (target - r.lamp.intensity) * (reduce ? 1 : Math.min(1, dt * 5));
      r.edgeMat.opacity = selected ? (sel ? 0.9 : 0.12) : (hov ? 0.85 : 0.4);
      r.floor.material.color.setHex(selected && !sel ? 0x0e161e : 0x1a2632);
      r.flash = Math.max(0, r.flash - dt * 1.6); r.pulse = Math.max(0, r.pulse - dt * 0.8);
      poseReactions(r, clock);
      updateLink(r, clock);
      r.linkMat.opacity = selected && !sel ? 0.2 : 0.95;
      if (needs || reduce || screenTick % 2 === 0) {
        if (r.s.schermo === "spo2") drawSpo2(r.screen.ctx, 160, 240, r.state, clock);
        else drawMonitor(r.screen.ctx, 320, 200, r.state, clock);
        r.screen.tex.needsUpdate = true;
        drawRegia(r.regiaScreen.ctx, 128, 96, r.p.accento || "#46f2a0", r.flash);
        r.regiaScreen.tex.needsUpdate = true;
      }
    });
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
    layout();
    camGoal = selected ? roomGoal(selected) : overviewGoal();
    cam = Object.assign({}, camGoal);
    kick();
  }
  window.addEventListener("resize", resize);
  // lenta orbita con lo scroll, nella vista d'insieme
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
  // link diretto a una sala: ?sala=<id> porta alla sezione e apre la sala
  var q = /[?&]sala=([\w-]+)/.exec(location.search);
  if (q) {
    var rq = rooms.filter(function (r) { return r.p.id === q[1]; })[0];
    if (rq) setTimeout(function () { box.scrollIntoView({ block: "center", behavior: "instant" }); enter(rq); }, 50);
  }
  window.__sale = { rooms: rooms, enter: enter, leave: leave, act: act };
})();
