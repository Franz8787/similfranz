# similFranz

**Apri quel cassetto: dentro c'è una sala di simulazione.**

L'iPad®, l'iPod touch® e il tablet Android™ che avevi messo da parte diventano monitor, defibrillatore e saturimetro
per la tua simulazione sanitaria. Tu conduci lo scenario, la squadra cresce.
Open source, pensati per formatori, istruttori e facilitatori di simulazione.

Questa è la casa dell'ecosistema similFranz: la pagina **https://franz8787.github.io/similfranz/** ti porta a ogni progetto.

## L'ecosistema

| Progetto | Dispositivo | Stato | Pagina | Codice |
|---|---|---|---|---|
| **similFranz Saturimetro** | iPod touch® di 4ª generazione | disponibile · DOI [10.5281/zenodo.24064777](https://doi.org/10.5281/zenodo.24064777) | [pagina](https://franz8787.github.io/similfranz-saturimetro/) | [repo](https://github.com/Franz8787/similfranz-saturimetro) |
| **similFranz Monitor per iPad** | iPad mini® di 1ª generazione, regia su un secondo iPad mini o sul Pocket (iPod touch® di 5ª generazione) | disponibile · DOI [10.5281/zenodo.24232019](https://doi.org/10.5281/zenodo.24232019) | [pagina](https://franz8787.github.io/similfranz-monitor/) | [repo](https://github.com/Franz8787/similfranz-monitor) |
| **similFranz Monitor per Android** | Samsung® Galaxy® Tab Active2 o tablet Android™ 8 e successivi | in arrivo | [pagina](https://franz8787.github.io/similfranz-monitor-android/) (online alla pubblicazione) | in arrivo |

Altri dispositivi sono in cantiere.

- **Saturimetro**: SpO₂, polso, pletismografia e allarmi. Il partecipante applica un vero sensore da dito, tu guidi i valori
  dal browser del telefono.
- **Monitor per iPad**: un monitor-defibrillatore con tre layout originali (ICU, extraH, DAE). Dalla regia dai i cue al momento
  giusto, conduci lo scenario a fasi, e il registro prepara il debriefing.
- **Monitor per Android**: monitor e controller su due tablet, collegati in modo diretto, con un modello fisiologico che lega
  ritmo, circolo e respiro. Nel guscio i tasti fisici del tablet diventano accensione, carica e scarica, con suono e
  vibrazione.

Monitor e regia si collegano direttamente fra loro; il saturimetro si appoggia all'hotspot del tuo telefono.
Niente router, niente internet, niente abbonamenti.

## Il metodo

1. **Familiarizzazione**: presenti il dispositivo e condividi gli obiettivi di apprendimento. Chi conosce lo strumento si sente al sicuro.
2. **Scenario**: i partecipanti agiscono, tu faciliti e dai i cue. Il registro lavora da solo.
3. **Debriefing**: parti dai fatti, il gruppo costruisce la riflessione.

## Com'è fatta la pagina

| File | Che cosa contiene |
|---|---|
| `index.html` | la pagina: testi, stile e la traccia ECG 3D dell'apertura |
| `progetti.js` | **l'elenco dei progetti**: schede, sale 3D, bottoni e versione senza 3D si generano da qui |
| `sale.js` | il centro di simulazione isometrico (three.js): sale dei progetti, corridoio, regia, debriefing, e le schede |
| `img/` | foto e rendering (JPEG sotto i 200 KB, senza dati EXIF) |
| `modelli/` | modelli 3D in GLB: persone (CC0) e gusci dei dispositivi |
| `blister.js` | Blister, il bovaro dell'Appenzell del centro (modulo separato: si aggancia a `sale.js` con `window.Blister.attach`; se manca, il centro funziona senza cane) |
| `CREDITI.md` | autori e licenze dei modelli e delle librerie |

La pagina usa solo three.js r128 (da cdnjs e jsdelivr, versione esatta) e tre caratteri di Google Fonts.
Rispetta «riduci movimento» del sistema, ha una versione statica quando WebGL manca e funziona da 390 px in su.

## Aggiungere un progetto

1. **Aggiungi la voce** in fondo a `progetti.js`, copiando una di quelle esistenti. Campi: `id`, `nome`, `dispositivo`,
   `descrizione`, `stato` (`"disponibile"` o `"in arrivo"`), `pagina` (la Pages del progetto: è l'unico link verso il
   progetto), `doi` (facoltativo), `immagine`, `alt`, `accento` (colore), `regia_web` (facoltativo: una frase sulla regia web del dispositivo, che compare nella
   sala regia del centro; senza, il progetto non ha la sua riga) e `sala` con `posto` (`"dito"` o `"carrello"`),
   `schermo` (`"spo2"` o `"monitor"`), `ambiente` (facoltativo: `"extraospedaliero"` per il soccorso a terra, senza letto) e `divise` (facoltativo: `"soccorso"` per divise generiche ad alta visibilità), `regia` (`"telefono"`, `"ipad"`, `"pocket"`, `"tablet"`), `scena` e 2-3 `azioni`
   dell'istruttore. Gli stati disponibili sono descritti in testa al file.
2. **Metti l'immagine** in `img/`: JPEG largo circa 1200 px, sotto i 200 KB, senza EXIF né GPS.
3. **Facoltativo: il modello 3D** in `modelli/` come GLB leggero (pochi migliaia di triangoli, un materiale per colore,
   una mesh chiamata `screen` per lo schermo) e indicalo in `sala.modello`. Senza modello la sala usa un dispositivo
   segnaposto. Tieni tutti i GLB insieme sotto i 3 MB.
4. **Prova in locale**: dalla cartella dell'hub lancia `python3 -m http.server 8770` e apri http://127.0.0.1:8770/.
   Il centro di simulazione si riorganizza da solo: fino a 4 progetti le sale stanno tutte dietro il corridoio, con
   regia e debriefing di fronte; da 5 in su le sale si dividono sui due lati. La camera inquadra tutto e le etichette
   si scostano per non sovrapporsi. Un link diretto a una sala: `?sala=<id>`; alla sala regia: `?sala=regia`; al laboratorio (come nasce uno strumento similFranz): `?sala=laboratorio`.
   Blister, il bovaro dell'Appenzell del centro, è ispirato al cane dell'autore: gira per il corridoio, entra nelle sale
   e nel laboratorio; il suo codice è in `blister.js`.
5. Se il modello viene da fuori, scrivi titolo, autore, pagina, licenza e data in `CREDITI.md` e nel footer.
   Ammesse CC0, CC BY, CC BY-SA.

## Licenze, marchi e responsabilità

> **Solo per la simulazione sanitaria: non sono dispositivi medici, non misurano e non erogano nulla, mai su persone.**

- Codice e documentazione: **GPL-3.0** ([LICENSE](LICENSE)). Modelli 3D dei gusci: **CC BY-NC 4.0**.
  Modelli 3D di persone: CC0 1.0 (Quaternius). three.js: licenza MIT. Dettagli in [CREDITI.md](CREDITI.md).
- Software fornito «così com'è», senza garanzie di alcun tipo. Installazione, stampa 3D e montaggio sono sotto la
  responsabilità di chi li esegue.
- Progetto indipendente: non è affiliato, sponsorizzato né approvato dai titolari dei marchi citati né da alcun produttore
  di dispositivi medici. I layout sono originali.
- Apple®, iPad®, iPad mini® e iPod touch® sono marchi di Apple Inc., registrati negli Stati Uniti e in altri Paesi.
  Samsung® e Galaxy® sono marchi registrati di Samsung Electronics Co., Ltd. Android™ è un marchio di Google LLC.
  Wi-Fi® è un marchio registrato di Wi-Fi Alliance. GitHub® è un marchio registrato di GitHub, Inc. Claude™ è un marchio
  di Anthropic, PBC. Gli altri nomi appartengono ai rispettivi titolari.

© 2026 Francesco Palmisano (ilFranz) · [ORCID 0009-0009-9368-0212](https://orcid.org/0009-0009-9368-0212).
Sviluppato con l'aiuto di Claude Code, sotto la guida e la verifica dell'autore.
