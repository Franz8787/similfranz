/* similFranz · elenco dei progetti dell'hub.
   Una voce per progetto: schede, sale 3D, bottoni e fallback si generano da qui.
   Per aggiungere un progetto leggi «Aggiungere un progetto» nel README.

   Campi:
   id           identificativo breve, senza spazi
   nome         nome pubblico
   dispositivo  su che cosa gira (con ® / ™ alla prima citazione)
   descrizione  due-tre frasi, al «tu»
   stato        "disponibile" oppure "in arrivo"
   pagina       URL della pagina del progetto (GitHub Pages): l'unico link verso il progetto
   doi          facoltativo, solo il codice (es. "10.5281/zenodo.123")
   immagine     percorso in img/ (JPEG < 200 KB, senza EXIF)
   alt          testo alternativo dell'immagine
   accento      colore della sala e della scheda
   regia_web    facoltativo: una frase sulla regia web del dispositivo (compare nella sala regia)
   sala:
     modello    facoltativo, GLB in modelli/ (senza: dispositivo segnaposto)
     posto      "dito" (sul letto, al dito del manichino) oppure "carrello" (accanto al letto)
     schermo    "spo2" (saturimetro) oppure "monitor"
     regia      "telefono", "ipad", "pocket" oppure "tablet": che cosa tiene in mano l'istruttore
     scena      una frase che racconta la sala
     azioni     2-3 azioni dell'istruttore: { etichetta, stato }
                stati per "monitor": base, tachicardia, ipotensione, fv, rosc
                stati per "spo2":    nosonda, base, desat, recupero
*/
window.SIMILFRANZ_PROGETTI = [
  {
    id: "saturimetro",
    nome: "similFranz Saturimetro",
    dispositivo: "iPod touch® di 4ª generazione",
    descrizione: "SpO₂, polso, pletismografia e allarmi in un saturimetro palmare. Il partecipante applica un vero sensore da dito; tu guidi i valori dal browser del telefono, subito o con una transizione graduale.",
    stato: "disponibile",
    pagina: "https://franz8787.github.io/similfranz-saturimetro/",
    doi: "10.5281/zenodo.24064777",
    immagine: "img/saturimetro.jpg",
    alt: "Il saturimetro similFranz acceso in mano: SpO2 96, polso 78, curva pletismografica e sensore da dito collegato",
    accento: "#5fd4ff",
    regia_web: "console web nel browser del telefono: SpO₂, polso, curva, sonda e allarmi",
    sala: {
      modello: "modelli/saturimetro.glb",
      posto: "dito",
      schermo: "spo2",
      regia: "telefono",
      stato_iniziale: "nosonda",
      scena: "Il saturimetro è al dito del manichino; l'istruttore lo guida dal telefono, in disparte.",
      azioni: [
        { etichetta: "Applica la sonda", stato: "base" },
        { etichetta: "Desatura a 86%", stato: "desat" },
        { etichetta: "Ossigeno: risale", stato: "recupero" }
      ]
    }
  },
  {
    id: "monitor-ipad",
    nome: "similFranz Monitor per iPad",
    dispositivo: "iPad mini® di 1ª generazione · regia su un secondo iPad mini o sul Pocket, su iPod touch® di 5ª generazione",
    descrizione: "Un monitor-defibrillatore con tre layout originali: ICU, extraH e DAE. Carica, scarica, sincronizzazione e pacing. Dalla regia dai i cue al momento giusto, conduci lo scenario a fasi, e il registro prepara il debriefing.",
    stato: "disponibile",
    pagina: "https://franz8787.github.io/similfranz-monitor/",
    doi: "10.5281/zenodo.24232019",
    immagine: "img/monitor-ipad.jpg",
    alt: "Il monitor similFranz nel suo guscio stampato in 3D e, accanto, il secondo iPad con la regia del facilitatore",
    accento: "#46f2a0",
    regia_web: "regia web dal computer: parametri, scenari a fasi, registro e debriefing",
    sala: {
      modello: "modelli/monitor-ipad.glb",
      posto: "carrello",
      schermo: "monitor",
      regia: "ipad",
      stato_iniziale: "base",
      scena: "Il monitor nel suo guscio è accanto al letto; l'istruttore conduce lo scenario dall'iPad della regia.",
      azioni: [
        { etichetta: "Alza la frequenza", stato: "tachicardia" },
        { etichetta: "Arresto in FV", stato: "fv" },
        { etichetta: "ROSC", stato: "rosc" }
      ]
    }
  },
  {
    id: "monitor-android",
    nome: "similFranz Monitor per Android",
    dispositivo: "Samsung® Galaxy® Tab Active2 o tablet Android™ 8 e successivi",
    descrizione: "Monitor e controller su due tablet, collegati in modo diretto. Un modello fisiologico lega ritmo, circolo e respiro: l'EtCO₂ segue la RCP, la pletismografia la perfusione. Scenari a fasi, esito di ogni scarica deciso da te, guscio stampabile con maniglia.",
    stato: "in arrivo",
    pagina: "https://franz8787.github.io/similfranz-monitor-android/",
    immagine: "img/monitor-android.jpg",
    alt: "Rendering del monitor similFranz per Android nel suo guscio con maniglia: schermo acceso in fibrillazione ventricolare",
    accento: "#ffbe5c",
    regia_web: "regia web dal computer: parametri, stati, scenari, Sala in diretta, Storia Sim",
    sala: {
      modello: "modelli/monitor-android.glb",
      posto: "carrello",
      schermo: "monitor",
      regia: "tablet",
      stato_iniziale: "base",
      scena: "Il tablet nel guscio con maniglia è accanto al letto; l'istruttore lo guida dal tablet controller.",
      azioni: [
        { etichetta: "Abbassa la pressione", stato: "ipotensione" },
        { etichetta: "Arresto in FV", stato: "fv" },
        { etichetta: "ROSC", stato: "rosc" }
      ]
    }
  }
];
