/* Blister, la mascotte del centro: un bovaro dell'Appenzell modellato a mano
   (geometrie semplici, nessun modello esterno) e animato proceduralmente.
   Nessun accesso al DOM: tutto passa da window.Blister.attach(opts). */
(function () {
  "use strict";

  var NOME_CANE = "Blister";

  var PI = Math.PI, TAU = Math.PI * 2;
  var VEL = 0.55;          // andatura tranquilla (m/s)
  var INCL = 0.68;         // inclinazione del tronco da seduto
  var PASSO = 0.4;         // metri per ciclo di trotto
  var ALT_ANCHE = 0.39;    // altezza delle anche in piedi (garrese circa 0,52)

  function tra(a, b) { return a + Math.random() * (b - a); }
  function stringi(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function diffAng(a, b) { return ((b - a + PI * 3) % TAU + TAU) % TAU - PI; }
  function verso(v, obiettivo, k) { return v + (obiettivo - v) * (k > 1 ? 1 : k); }
  function numero(n) { return typeof n === "number" && isFinite(n); }

  /* ---------- modello ---------- */
  function costruisci(T, mobile) {
    var seg = mobile ? 8 : 12;
    function mat(c, r) { return new T.MeshStandardMaterial({ color: c, roughness: r || 0.82, metalness: 0 }); }
    var M = {
      nero: mat(0x1b1a20), bianco: mat(0xf5f1e8), ruggine: mat(0xb04a14), naso: mat(0x101012, 0.4),
      occhio: mat(0x1a100a, 0.25), lingua: mat(0xe8848f, 0.6), collare: mat(0xc9362c, 0.6), medaglia: mat(0xe2c15a, 0.4)
    };
    function gruppo(genitore, x, y, z) { var g = new T.Group(); g.position.set(x || 0, y || 0, z || 0); genitore.add(g); return g; }
    function metti(geo, m, genitore, x, y, z) { var o = new T.Mesh(geo, m); o.position.set(x || 0, y || 0, z || 0); genitore.add(o); return o; }
    function sfera(r, m, genitore, x, y, z, sx, sy, sz) {
      var o = metti(new T.SphereGeometry(r, seg, Math.max(6, seg - 3)), m, genitore, x, y, z);
      if (sx) o.scale.set(sx, sy, sz);
      return o;
    }
    // cilindro col perno in cima (scende lungo -Y)
    function osso(rAlto, rBasso, h, m, genitore, y) {
      var geo = new T.CylinderGeometry(rAlto, rBasso, h, seg, 1);
      geo.translate(0, -h / 2, 0);
      return metti(geo, m, genitore, 0, y || 0, 0);
    }
    // calotta tonda appoggiata su una sfera di raggio R, rivolta verso dir
    function calotta(R, ang, m, genitore, dx, dy, dz) {
      var o = metti(new T.SphereGeometry(R, seg, 4, 0, TAU, 0, ang), m, genitore);
      o.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), new T.Vector3(dx, dy, dz).normalize());
      return o;
    }
    // striscia sul piano sagittale di una sfera (la lista bianca del muso)
    function striscia(R, a0, a1, w0, w1, n) {
      var pos = [], idx = [], i, j, m = 4, a, w, b, p;
      for (i = 0; i <= n; i++) {
        a = a0 + (a1 - a0) * i / n; w = w0 + (w1 - w0) * i / n;
        for (j = 0; j <= m; j++) { b = -w + 2 * w * j / m; pos.push(R * Math.sin(b), R * Math.cos(b) * Math.sin(a), R * Math.cos(b) * Math.cos(a)); }
      }
      for (i = 0; i < n; i++) for (j = 0; j < m; j++) { p = i * (m + 1) + j; idx.push(p, p + 1, p + m + 1, p + 1, p + m + 2, p + m + 1); }
      var g = new T.BufferGeometry();
      g.setAttribute("position", new T.Float32BufferAttribute(pos, 3));
      g.setIndex(idx); g.computeVertexNormals();
      return g;
    }

    var radice = new T.Group();
    var ombra = metti(new T.CircleGeometry(0.25, mobile ? 12 : 20),
      new T.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),
      radice, 0, 0.012, 0.02);
    ombra.rotation.x = -PI / 2; ombra.scale.set(0.8, 1.3, 1);

    var salto = gruppo(radice);                       // si alza nei saltelli
    var anche = gruppo(salto, 0, ALT_ANCHE, -0.165);   // perno del bacino
    var tronco = gruppo(anche);                       // si inclina quando si siede

    /* corpo: profilo ruotato, petto profondo, groppa tonda */
    var prof = [[0.001, -0.115], [0.07, -0.105], [0.112, -0.065], [0.128, 0], [0.126, 0.12], [0.134, 0.25], [0.146, 0.35], [0.136, 0.43], [0.095, 0.485], [0.001, 0.505]];
    var punti = [], i;
    for (i = 0; i < prof.length; i++) punti.push(new T.Vector2(prof[i][0], prof[i][1]));
    var gCorpo = new T.LatheGeometry(punti, mobile ? 10 : 14);
    gCorpo.rotateX(PI / 2);
    var corpo = metti(gCorpo, M.nero, tronco);
    corpo.material = M.nero.clone(); corpo.material.side = T.DoubleSide;
    corpo.scale.set(0.8, 0.94, 0.87);
    /* petto bianco con focature ai lati */
    sfera(0.1, M.bianco, tronco, 0, -0.03, 0.375, 0.72, 1.2, 0.9);
    sfera(0.06, M.ruggine, tronco, 0.07, -0.035, 0.37, 0.7, 1.25, 0.9);
    sfera(0.06, M.ruggine, tronco, -0.07, -0.035, 0.37, 0.7, 1.25, 0.9);

    /* collo e testa */
    var collo = gruppo(tronco, 0, 0.055, 0.35);
    var gCollo = new T.CylinderGeometry(0.07, 0.1, 0.2, seg, 1); gCollo.translate(0, 0.08, 0);
    metti(gCollo, M.nero, collo);
    sfera(0.06, M.bianco, collo, 0, 0.05, 0.052, 0.85, 1.6, 0.75);          // gola bianca
    var collare = metti(new T.TorusGeometry(0.078, 0.013, 6, seg + 4), M.collare, collo, 0, 0.125, 0);
    collare.rotation.x = PI / 2;
    sfera(0.016, M.medaglia, collo, 0, 0.1, 0.085, 1, 1, 0.45);
    var testa = gruppo(collo, 0, 0.19, 0);
    var cranio = gruppo(testa); cranio.scale.set(1, 0.92, 1.08);
    var R = 0.095;
    sfera(R, M.nero, cranio);
    metti(striscia(R * 1.025, -0.25, 1.35, 0.4, 0.13, 7), M.bianco, cranio);     // lista
    calotta(R * 1.02, 0.52, M.ruggine, cranio, 0.8, -0.42, 0.5);                // guance
    calotta(R * 1.02, 0.52, M.ruggine, cranio, -0.8, -0.42, 0.5);
    calotta(R * 1.035, 0.2, M.ruggine, cranio, 0.36, 0.56, 0.72);               // «sopracciglia»
    calotta(R * 1.035, 0.2, M.ruggine, cranio, -0.36, 0.56, 0.72);
    sfera(0.0135, M.occhio, cranio, 0.043, 0.02, 0.083);
    sfera(0.0135, M.occhio, cranio, -0.043, 0.02, 0.083);
    var gMuso = new T.CylinderGeometry(0.04, 0.058, 0.11, seg, 1); gMuso.rotateX(PI / 2);
    var muso = metti(gMuso, M.bianco, testa, 0, -0.03, 0.115); muso.scale.set(1, 0.84, 1);
    sfera(0.04, M.bianco, testa, 0, -0.03, 0.168, 1, 0.84, 0.6);
    sfera(0.022, M.naso, testa, 0, -0.012, 0.187, 1.1, 0.85, 0.9);
    sfera(0.03, M.ruggine, testa, 0.04, -0.042, 0.085, 0.7, 0.9, 1.5);          // focature sul muso
    sfera(0.03, M.ruggine, testa, -0.04, -0.042, 0.085, 0.7, 0.9, 1.5);
    var lingua = sfera(0.018, M.lingua, testa, 0, -0.064, 0.15, 0.9, 0.4, 1.5);
    lingua.rotation.x = 0.5; lingua.visible = false;
    /* orecchie triangolari pendenti, attaccate alte */
    function orecchio(lato) {
      var perno = gruppo(testa, lato * 0.068, 0.062, -0.012);
      var f = new T.Shape();
      f.moveTo(0.04, -0.012); f.quadraticCurveTo(0, 0.01, -0.046, -0.01); f.lineTo(-0.056, -0.04); f.lineTo(-0.036, -0.118); f.quadraticCurveTo(-0.026, -0.134, -0.014, -0.12); f.lineTo(0.044, -0.03); f.closePath();
      var geo = new T.ExtrudeGeometry(f, { depth: 0.008, bevelEnabled: true, bevelSize: 0.006, bevelThickness: 0.006, bevelSegments: 2, curveSegments: 4 });
      geo.translate(0, 0, -0.004); geo.rotateY(PI / 2);
      metti(geo, M.nero, perno);
      perno.userData.base = lato * 0.16;
      perno.rotation.z = perno.userData.base;
      perno.rotation.y = lato * 0.14;
      return perno;
    }
    var orecchie = [orecchio(1), orecchio(-1)];

    /* coda arrotolata sul dorso, punta bianca */
    var coda = gruppo(tronco, 0, 0.095, -0.07); coda.scale.set(0.82, 0.82, 0.82);
    var arco = new T.CatmullRomCurve3([
      new T.Vector3(0, -0.02, 0.01), new T.Vector3(0, 0.06, -0.04), new T.Vector3(0, 0.145, -0.035), new T.Vector3(0, 0.19, 0.035),
      new T.Vector3(0, 0.16, 0.115), new T.Vector3(0, 0.095, 0.125), new T.Vector3(0, 0.07, 0.08)
    ]);
    var pa = arco.getPoints(24), nera = new T.CatmullRomCurve3(pa.slice(0, 19)), chiara = new T.CatmullRomCurve3(pa.slice(18));
    metti(new T.TubeGeometry(nera, mobile ? 8 : 14, 0.031, mobile ? 6 : 8, false), M.nero, coda);
    metti(new T.TubeGeometry(chiara, 5, 0.032, mobile ? 6 : 8, false), M.bianco, coda);
    sfera(0.032, M.bianco, coda, pa[24].x, pa[24].y, pa[24].z);

    /* zampe a due segmenti: nero, ruggine, calzino bianco */
    function zampa(genitore, x, y, z, davanti) {
      var L1 = davanti ? 0.18 : 0.19, L2 = davanti ? 0.155 : 0.175;
      var su = gruppo(genitore, x, y, z);
      osso(davanti ? 0.042 : 0.043, davanti ? 0.035 : 0.037, L1, M.nero, su, 0);
      if (davanti) sfera(0.05, M.nero, su, 0, 0, 0, 0.9, 1.1, 1); else sfera(0.08, M.nero, su, -0.014 * (x > 0 ? 1 : -1), -0.04, 0.005, 0.66, 1.15, 1.05);
      var giu = gruppo(su, 0, -L1, 0);
      sfera(0.036, M.nero, giu);
      osso(0.034, 0.031, L2 * 0.45, M.ruggine, giu, 0);
      osso(0.031, 0.03, L2 * 0.55, M.bianco, giu, -L2 * 0.45);
      var piede = gruppo(giu, 0, -L2, 0);
      sfera(0.037, M.bianco, piede, 0, 0, 0.014, 1, 0.72, 1.4);
      return { su: su, giu: giu, piede: piede, lato: x > 0 ? 1 : -1 };
    }
    var zampe = [
      zampa(tronco, 0.07, -0.03, 0.325, true), zampa(tronco, -0.07, -0.03, 0.325, true),
      zampa(anche, 0.072, -0.01, 0, false), zampa(anche, -0.072, -0.01, 0, false)
    ];

    /* bersaglio invisibile e generoso per il tocco */
    var presa = metti(new T.BoxGeometry(0.55, 0.85, 1.0), new T.MeshBasicMaterial({ visible: false }), radice, 0, 0.4, 0.03);

    return { radice: radice, ombra: ombra, salto: salto, anche: anche, tronco: tronco, collo: collo, testa: testa, naso: muso,
      lingua: lingua, orecchie: orecchie, coda: coda, zampe: zampe, presa: presa };
  }

  /* ---------- aggancio ---------- */
  function attach(opts) {
    opts = opts || {};
    var T = opts.THREE || window.THREE;
    var scena = opts.scene;
    var fermo = !!opts.reduce, mobile = !!opts.mobile;
    var y0 = numero(opts.floorY) ? opts.floorY : 0;

    function puntiValidi(a) {
      var out = [], i;
      if (!a || !a.length) return out;
      for (i = 0; i < a.length; i++) if (a[i] && numero(a[i][0]) && numero(a[i][1])) out.push([a[i][0], a[i][1]]);
      return out;
    }
    function sosteValide(a, conSguardo) {
      var out = [], i, s;
      if (!a || !a.length) return out;
      for (i = 0; i < a.length; i++) {
        s = a[i];
        if (s && numero(s.x) && numero(s.z)) out.push({ x: s.x, z: s.z, lookX: conSguardo && numero(s.lookX) ? s.lookX : s.x, lookZ: conSguardo && numero(s.lookZ) ? s.lookZ : s.z + 1 });
      }
      return out;
    }
    var cor = puntiValidi(opts.corridor);
    if (!cor.length) cor = [[-1.1, 0], [0, 0.7], [1.1, 0], [0, -0.7], [-1.1, 0]];   // giretto di riserva attorno all'origine
    var soste = sosteValide(opts.stops, true), segni = sosteValide(opts.marks, false);

    var C = costruisci(T, mobile);
    var radice = C.radice;
    radice.name = NOME_CANE;
    radice.position.set(cor[0][0], y0, cor[0][1]);
    if (scena) scena.add(radice);

    var S = {
      stato: "cammina", t: 0, timer: 0, fase: 0, imb: 0, faccia: null,
      nodo: 0, fuori: false, poi: null, via: [], giro: 0,
      sedK: 0, sdrK: 0, pipK: 0, suK: 0, mangiaK: 0, passoK: 0, coda: 0.15,
      sedO: 0, sdrO: 0, pipO: 0, suO: 0, mangiaO: 0, codaO: 0.15,
      lato: 1, saltiN: 0, saltoU: 0, saltoY: 0, raccolta: 0, prossimoSalto: tra(4, 8),
      grazie: 0, conBiscotto: false, alVolo: true, pozzaFatta: false, ultimoSegno: -99, ultimaSosta: -1
    };

    /* biscotto e pozzanghere stanno nella scena, non nel cane */
    var biscotto = null, lancio = null, pozze = [];
    if (!fermo && scena) {
      biscotto = new T.Mesh(new T.CylinderGeometry(0.04, 0.04, 0.014, 10), new T.MeshStandardMaterial({ color: 0xd9b27c, roughness: 0.9 }));
      biscotto.visible = false; scena.add(biscotto);
    }
    function nuovaPozza(x, z) {
      if (!scena) return;
      var p = null, i;
      for (i = 0; i < pozze.length; i++) if (!pozze[i].visible) { p = pozze[i]; break; }
      if (!p) {
        if (pozze.length >= 2) return;
        p = new T.Mesh(new T.CircleGeometry(0.085, mobile ? 12 : 20),
          new T.MeshBasicMaterial({ color: 0xf2d53a, transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }));
        p.rotation.x = -PI / 2; scena.add(p); pozze.push(p);
      }
      p.position.set(x, y0 + 0.008, z); p.userData.eta = 0; p.visible = true; p.scale.set(0.15, 0.15, 1);
    }
    function aggiornaPozze(dt) {
      var i, p, e;
      for (i = 0; i < pozze.length; i++) {
        p = pozze[i]; if (!p.visible) continue;
        e = (p.userData.eta += dt);
        var k = 0.15 + 0.85 * (1 - Math.pow(1 - stringi(e / 2.6, 0, 1), 2));   // si allarga
        p.scale.set(k * 1.12, k, 1);
        p.material.opacity = 0.5 * stringi(e / 0.4, 0, 1) * stringi((6 - e) / 2.8, 0, 1);   // poi svanisce
        if (e >= 6) p.visible = false;
      }
    }

    /* ---------- percorsi: solo corridoio↔corridoio e corridoio↔sosta ---------- */
    function nodoVicino(x, z) {
      var m = 0, dm = Infinity, i, d;
      for (i = 0; i < cor.length; i++) { d = (cor[i][0] - x) * (cor[i][0] - x) + (cor[i][1] - z) * (cor[i][1] - z); if (d < dm) { dm = d; m = i; } }
      return m;
    }
    function uguali(a, b) { return Math.abs(a[0] - b[0]) < 1e-4 && Math.abs(a[1] - b[1]) < 1e-4; }
    function vaiA(nodo, extra, poi) {
      var via = [], i = S.nodo, k, m;
      via.push(cor[i]);
      while (i !== nodo) { i += nodo > i ? 1 : -1; via.push(cor[i]); }
      // se la linea ripassa dallo stesso punto (soglie delle porte) salta l'andata e ritorno
      for (k = 0; k < via.length; k++) {
        for (m = via.length - 1; m > k; m--) if (uguali(via[k], via[m])) { via.splice(k + 1, m - k); break; }
      }
      if (!S.fuori && via.length) via.shift();
      if (extra) via.push(extra);
      S.via = via; S.nodo = nodo; S.fuori = !!extra; S.poi = poi; S.stato = "cammina"; S.faccia = null;
      S.sedO = 0; S.sdrO = 0; S.suO = 0; S.mangiaO = 0; S.pipO = 0; S.codaO = 0.15;
    }
    function scegli() {
      var r = Math.random(), n, j, u, s;
      if (soste.length && r < 0.36) {
        n = Math.floor(Math.random() * soste.length);
        if (n === S.ultimaSosta && soste.length > 1) n = (n + 1) % soste.length;
        S.ultimaSosta = n; s = soste[n];
        return vaiA(nodoVicino(s.x, s.z), [s.x, s.z], { tipo: "biscotto", s: s });
      }
      if (segni.length && r < 0.5 && S.t - S.ultimoSegno > 40) {
        s = segni[Math.floor(Math.random() * segni.length)];
        S.ultimoSegno = S.t;
        return vaiA(nodoVicino(s.x, s.z), [s.x, s.z], { tipo: "pipi" });
      }
      n = Math.floor(Math.random() * cor.length);
      if (n === S.nodo && cor.length > 1) n = (n + 1 + Math.floor(Math.random() * (cor.length - 1))) % cor.length;
      if (r < 0.74 || cor.length < 2) {
        // riposino a metà di un tratto di corridoio
        j = n + 1 < cor.length ? n + 1 : n - 1; u = tra(0.2, 0.8);
        if (j < 0 || uguali(cor[n], cor[j])) return vaiA(n, null, { tipo: "riposo" });
        return vaiA(n, [cor[n][0] + (cor[j][0] - cor[n][0]) * u, cor[n][1] + (cor[j][1] - cor[n][1]) * u], { tipo: "riposo" });
      }
      return vaiA(n, null, { tipo: "giro" });
    }
    function arrivo() {
      var p = S.poi || { tipo: "giro" }, q;
      S.saltiN = 0;
      if (p.tipo === "biscotto") {
        S.stato = "attesa"; S.timer = tra(4, 8); S.conBiscotto = Math.random() < 0.5;
        S.faccia = Math.atan2(p.s.lookX - radice.position.x, p.s.lookZ - radice.position.z);
        S.sedO = 1; S.suO = 1; S.codaO = 0.55;
      } else if (p.tipo === "pipi") {
        q = Math.random() < 0.5 ? 1 : -1;
        S.stato = "pipi"; S.timer = 0; S.giro = 0; S.pozzaFatta = false;
        S.faccia = radice.rotation.y + q * PI / 2; S.lato = -q;   // di fianco, zampa verso il muro
      } else if (p.tipo === "riposo") {
        S.stato = "riposo";
        if (Math.random() < 0.5) { S.sdrO = 1; S.timer = tra(5, 9); } else { S.sedO = 1; S.timer = tra(3.5, 6.5); }
      } else scegli();
    }

    /* ---------- biscotto ---------- */
    var v3 = new T.Vector3();
    function lancia() {
      var p = S.poi.s, a = radice.rotation.y;
      S.alVolo = Math.random() < 0.65;
      if (S.alVolo) {
        radice.updateWorldMatrix(true, true);
        C.naso.getWorldPosition(v3); if (scena) scena.worldToLocal(v3);
        v3.y += 0.02;
      } else v3.set(radice.position.x + Math.sin(a) * 0.5, y0 + 0.012, radice.position.z + Math.cos(a) * 0.5);
      lancio = { u: 0, ax: p.lookX, ay: y0 + 1.0, az: p.lookZ, bx: v3.x, by: v3.y, bz: v3.z };
      if (biscotto) { biscotto.visible = true; biscotto.position.set(lancio.ax, lancio.ay, lancio.az); }
      S.stato = "volo";
    }
    function aggiornaLancio(dt) {
      if (!lancio) return false;
      var L = lancio, u = (L.u = Math.min(1, L.u + dt / 0.85));
      if (biscotto) {
        biscotto.position.set(L.ax + (L.bx - L.ax) * u, L.ay + (L.by - L.ay) * u + 0.45 * 4 * u * (1 - u), L.az + (L.bz - L.az) * u);
        biscotto.rotation.x = u * 9; biscotto.rotation.z = u * 5;
        if (u >= 1) { biscotto.rotation.set(0, 0, 0); }
      }
      if (u >= 1) { lancio = null; return true; }
      return false;
    }
    function gioia() {
      if (biscotto) biscotto.visible = false;
      S.stato = "gioia"; S.timer = 1.7; S.grazie = 3;
      S.sedO = 0; S.suO = 0.4; S.mangiaO = 0; S.codaO = 0.6; S.saltiN = 2; S.saltoU = 0;
    }

    /* ---------- posa: tutte le articolazioni dai parametri ---------- */
    function posa() {
      var s = S.sedK * (1 - S.sdrK), l = S.sdrK, p = 1 - s - l, e = S.mangiaK, pk = S.pipK;
      var g = S.passoK * p * (1 - pk), amp = 0.38 * g;
      var beccheggio = -INCL * s + 0.36 * e + S.raccolta * -0.12;
      C.salto.position.y = S.saltoY;
      C.anche.position.y = p * ALT_ANCHE + s * 0.18 + l * 0.15 + Math.abs(Math.sin(S.fase)) * 0.012 * g;
      C.anche.rotation.z = -S.lato * 0.17 * pk + Math.sin(S.fase) * 0.03 * g;
      C.tronco.rotation.x = beccheggio;
      C.ombra.scale.set(0.8 - S.saltoY * 0.8, 1.3 - S.saltoY * 1.3 - 0.25 * s, 1);

      var i, z, f, sw, pieg, a1, a2, a3;
      for (i = 0; i < 4; i++) {
        z = C.zampe[i]; f = S.fase + ((i === 0 || i === 3) ? 0 : PI);    // trotto: diagonali insieme
        sw = Math.sin(f) * amp; pieg = Math.max(0, Math.cos(f)) * amp * 1.5;
        a3 = 0;
        if (i < 2) {
          a1 = -sw + INCL * s - 1.32 * l - 1.25 * e - 0.55 * S.raccolta;
          a2 = pieg + 1.8 * e + 1.0 * S.raccolta + 0.1 * l;
          z.piede.rotation.x = -(beccheggio + a1 + a2);
        } else {
          a1 = p * (-0.25 - sw) - 1.25 * (s + l) + 0.4 * S.raccolta * p;
          a2 = p * (0.5 + pieg) + 2.2 * s + 2.5 * l + 0.25 * S.raccolta * p;
          a3 = z.lato * 0.3 * (s + l);
          if (z.lato === S.lato && pk > 0) {            // zampa alzata
            a1 += (-0.5 - a1) * pk; a2 += (1.7 - a2) * pk; a3 += z.lato * 1.3 * pk;
          }
          z.piede.rotation.x = -(a1 + a2);
        }
        z.su.rotation.x = a1; z.su.rotation.z = a3; z.giu.rotation.x = a2;
      }

      var annuisci = Math.sin(S.fase * 2) * 0.04 * g;
      var cx = 0.78 + 0.72 * e - 0.12 * S.suK * s + 0.1 * l + annuisci;
      C.collo.rotation.x = cx;
      C.testa.rotation.x = -cx - beccheggio - 0.62 * S.suK + 0.55 * e + 0.12 * l;
      C.testa.rotation.z = S.suK * s * Math.sin(S.t * 0.9) * 0.14;       // inclina la testa in attesa
      C.testa.rotation.y = Math.sin(S.t * 0.6) * 0.1 * (1 - g) * (1 - e);
      C.coda.rotation.z = Math.sin(S.t * (5 + S.coda * 14)) * S.coda;
      C.coda.rotation.x = 0.4 * s - 0.1 * S.raccolta;
      var sbatte = S.raccolta * 0.7 + Math.abs(Math.sin(S.fase)) * 0.1 * g;
      C.orecchie[0].rotation.z = C.orecchie[0].userData.base + sbatte;
      C.orecchie[1].rotation.z = C.orecchie[1].userData.base - sbatte;
      C.lingua.visible = S.suK > 0.6 || S.stato === "gioia";
    }

    /* ---------- ciclo ---------- */
    function ruotaVerso(a, dt, k) { var d = diffAng(radice.rotation.y, a); radice.rotation.y += d * Math.min(1, dt * k); return Math.abs(d); }
    function cammina(dt) {
      var pos = radice.position, b, dx, dz, d, err, v, passo;
      while (S.via.length) {
        b = S.via[0]; dx = b[0] - pos.x; dz = b[1] - pos.z; d = Math.sqrt(dx * dx + dz * dz);
        if (d > 0.012) break;
        pos.x = b[0]; pos.z = b[1]; S.via.shift();
      }
      if (!S.via.length) { S.passoK = verso(S.passoK, 0, dt * 8); arrivo(); return; }
      err = ruotaVerso(Math.atan2(dx, dz), dt, 5.5);
      v = VEL * (S.saltiN ? 1.25 : 1) * Math.max(0.12, Math.cos(Math.min(err, PI / 2)));
      v *= Math.pow(1 - Math.max(S.sedK, S.sdrK), 2);     // prima si rialza, poi parte
      passo = Math.min(d, v * dt);
      pos.x += dx / d * passo; pos.z += dz / d * passo;
      S.fase += passo / PASSO * TAU;
      S.passoK = verso(S.passoK, v > 0.08 ? 1 : 0, dt * 6);
      S.prossimoSalto -= dt;
      if (S.prossimoSalto <= 0 && !S.saltiN && d > 0.9 && err < 0.3) { S.saltiN = Math.random() < 0.4 ? 3 : 2; S.saltoU = 0; S.prossimoSalto = tra(6, 12); }
    }
    function salti(dt) {
      if (!S.saltiN) { S.saltoY = 0; S.raccolta = verso(S.raccolta, 0, dt * 10); return; }
      S.saltoU += dt / 0.4;
      if (S.saltoU >= 1) { S.saltoU = 0; S.saltiN--; if (!S.saltiN) { S.saltoY = 0; return; } }
      S.saltoY = 0.12 * 4 * S.saltoU * (1 - S.saltoU) * (1 - 0.6 * S.sedK);
      S.raccolta = verso(S.raccolta, Math.sin(PI * S.saltoU), dt * 14);
    }

    function update(dt) {
      if (!numero(dt) || dt < 0) dt = 0;
      if (dt > 0.1) dt = 0.1;
      if (S.grazie > 0) S.grazie -= dt;
      if (fermo) return;
      S.t += dt;
      var st = S.stato, a;
      if (st !== "cammina") S.passoK = verso(S.passoK, 0, dt * 8);
      if (S.faccia !== null && st !== "cammina") a = ruotaVerso(S.faccia, dt, 5);

      if (st === "cammina") cammina(dt);
      else if (st === "attesa") {
        if (S.sedK > 0.9) S.timer -= dt;
        if (S.timer <= 0) {
          if (S.conBiscotto) lancia();
          else { S.stato = "alzati"; S.timer = 0.6; S.sedO = 0; S.suO = 0; S.codaO = 0.15; }
        }
      } else if (st === "volo") {
        if (aggiornaLancio(dt)) {
          if (S.alVolo) gioia();
          else { S.stato = "mangia"; S.timer = 1.5; S.sedO = 0; S.suO = 0; S.mangiaO = 1; }
        }
      } else if (st === "mangia") {
        S.timer -= dt;
        if (S.timer < 0.5 && biscotto) biscotto.visible = false;
        if (S.timer <= 0) gioia();
      } else if (st === "gioia" || st === "alzati") {
        S.timer -= dt;
        if (S.timer <= 0) scegli();
      } else if (st === "riposo") {
        S.timer -= dt;
        if (S.timer <= 0) { S.stato = "alzati"; S.timer = 0.7; S.sedO = 0; S.sdrO = 0; }
      } else if (st === "pipi") {
        S.giro += dt;
        if (S.timer > 0 || a < 0.1 || S.giro > 1.5) S.timer += dt;   // prima si gira di fianco
        if (S.timer > 0) S.pipO = S.timer < 2.5 ? 1 : 0;
        if (S.timer > 0.9 && !S.pozzaFatta && !(mobile && pozze.length >= 1 && pozze[0].visible)) {
          S.pozzaFatta = true; a = radice.rotation.y;
          nuovaPozza(radice.position.x + S.lato * 0.17 * Math.cos(a) - 0.2 * Math.sin(a), radice.position.z - S.lato * 0.17 * Math.sin(a) - 0.2 * Math.cos(a));
        }
        if (S.timer > 3.1) scegli();
      }

      S.sedK = verso(S.sedK, S.sedO, dt * 4.5); S.sdrK = verso(S.sdrK, S.sdrO, dt * 3);
      S.pipK = verso(S.pipK, S.pipO, dt * 5); S.suK = verso(S.suK, S.suO, dt * 4);
      S.mangiaK = verso(S.mangiaK, S.mangiaO, dt * 5); S.coda = verso(S.coda, S.codaO, dt * 4);
      salti(dt);
      posa();
      aggiornaPozze(dt);
    }

    var via0 = opts.start && numero(opts.start.x) && numero(opts.start.z) ? opts.start : null;
    if (via0) {
      // parte dal laboratorio: seduto accanto a chi lavora al banco, poi esce dalla porta verso il corridoio
      radice.position.set(via0.x, y0, via0.z);
      S.nodo = nodoVicino(via0.x, via0.z); S.fuori = true;
      radice.rotation.y = numero(via0.lookX) && numero(via0.lookZ) ? Math.atan2(via0.lookX - via0.x, via0.lookZ - via0.z) : 0;
      S.sedK = 1; S.sedO = 1; S.suK = 0.5; S.codaO = 0.55;
      if (fermo) { S.stato = "fermo"; } else { S.stato = "riposo"; S.timer = tra(3, 5); }
      posa();
    } else if (fermo) {
      // movimento ridotto: seduto e fermo al primo punto del corridoio
      S.sedK = 1; S.suK = 0.5; S.stato = "fermo";
      radice.rotation.y = cor.length > 1 && !uguali(cor[0], cor[1]) ? Math.atan2(cor[1][0] - cor[0][0], cor[1][1] - cor[0][1]) : 0.5;
      posa();
    } else {
      if (cor.length > 1) radice.rotation.y = Math.atan2(cor[1][0] - cor[0][0], cor[1][1] - cor[0][1]);
      posa();
      scegli();
    }

    var api = {
      object: radice,
      update: update,
      hit: function (raycaster) {
        if (!raycaster || !raycaster.intersectObject) return false;
        return raycaster.intersectObject(C.presa, false).length > 0;
      },
      poke: function () {
        S.grazie = 3;
        if (fermo || S.stato === "pipi" || S.sdrK > 0.3 || S.mangiaK > 0.3 || S.saltiN) return;
        S.saltiN = 2; S.saltoU = 0;
      },
      label: function () {
        if (S.grazie > 0) return NOME_CANE + " · grazie!";
        if (S.stato === "pipi") return NOME_CANE + " · un attimo…";
        return NOME_CANE + " · aspetta un biscotto";
      }
    };
    return api;
  }

  window.Blister = { NOME: NOME_CANE, attach: attach };
})();
