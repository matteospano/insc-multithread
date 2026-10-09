# Checklist Completa Meccaniche e TODO di Sviluppo

Documento riassuntivo di tutte le funzionalità pendenti, estrapolate dai commenti TODO del codice sorgente.

---

## 1. Meccaniche Carte, Sigilli ed Effetti (`CardSlot.tsx`, `PlayerTurn.tsx`, `families.tsx`, `utilCards.tsx`)
- [ ] **Campane / Bells (Sigil Helper)**: Alla morte della carta base, liberare il campo dalle 2 campane adiacenti (`[index - 1]` e `[index + 1]`).
- [ ] **Gestione Triggers Ingressi/Uscite (Smell, Leaders, Alarm)**:
  - Riapplicare gli effetti al momento dell'evento `onEnemySpawn` e `onFriendSpawn`.
  - Annullare/rimuovere correttamente i relativi buff/debuff agli eventi `onDeath` e `onSacrifice`.
- [ ] **Nuovi Sigilli e Comportamenti Speciali**:
  DA rifare playtest: - **Vampire (Sigillo 504)**: Guadagna +1 DEF dopo un attacco andato a segno a una carta avv. Ricontrolla atk diretto e vs scudo.
  - **Water / Submerge (Sigillo 640)**: Immersione a fine turno con liberazione dello slot sul terreno.
  - **Fertilità Zombie**: Sacrificare la carta ne genera una copia identica in mano con -1 ATK.
  - **Carta Mulo**: Alla morte evoca 2 carte prese dal mazzo del proprietario (definire se cloni o carte effettive dal deck).
  - **Procione Bloodlust**: Aumenta l'ATK di +1 per ogni uccisione effettuata.
  - **Uccellino / Uovo di Corvo**: Spawna un uovo di corvo (50% non fecondato, non visibile all'avversario).
  - **Hunter**: All'evento `onSpawn`, trasforma tutti i nemici presenti in pellicce (mantiene stats, assegna sigillo *Looter* e `dropBlood = -1`).
  - **Regola Irritante (Annoying)**: Assegna il sigillo *Annoying* a 2 carte casuali in mano ad entrambi i giocatori (o solo al player in single-player).

---

## 2. Flusso di Gioco, Spawning e Turni (`RemoveCardEffects.tsx`, `LeshiLines.tsx`, `utils.tsx`)
- [ ] **Gestione Rimozione ed Effetti (`RemoveCardEffects.tsx`)**:
  - Risolvere i dispatch asincroni e separare le logiche di `onDeath`.
  - Spostare i dispatch di `updateField` e gestione `onSpawn` direttamente in `LeshiLines.tsx` anziché in `CardSlot`.
- [ ] **Pesca e Gestione Deck (`utils.tsx`, `RuleDialog.tsx`)**:
  - Imporre una dimensione minima di 10 carte nella selezione del mazzo.
  N2H: - Creare una funzione dedicata per la pesca casuale simultanea di 5 indici unici, risolvendo il problema dei doppioni.
- [ ] **Filtro Conflitti Sigilli (`utils.tsx`)**: Escludere la generazione di sigilli fra loro incompatibili (es. *Smell* e *Alarm*) durante l'assegnazione casuale.

---

## 3. Eventi di Gioco e Regole (`RuleDialog.tsx`)
- [ ] **Salvataggio Dati**: Inizializzare lo stato e le opzioni di gioco recuperandoli da `localStorage`.
- [ ] **Evento Prospettore**: Completare la logica dell'evento (già agganciato agli eventi della candela).
- [ ] **Evento Gancio**:
  - Single-player: Ruba la carta "pesce più fresco" dell'avversario.
  - Multiplayer: Permette l'utilizzo singolo su una carta a scelta dell'avversario.
- [ ] **Evento Apprendista**: Entrambi i giocatori selezionano 1 carta a testa; viene creata una copia nei rispetti mazzi con modificatori (+/-1 ATK/DEF, sigillo casuale o raramente +1 sacrificio richiesto).
- [ ] **Totem e Modalità di Gioco**: Pre-impostare `Totem2` nel cambio modalità e aggiornare/refreshare i sigilli sulle carte `initialField`.

---

## 4. Interfaccia Utente, Debug e Polish (`CustomToast.tsx`, `InfoSidebar.tsx`, `families.tsx`)
- [ ] **Modalità Debug (`CustomToast.tsx`)**: Aggiungere l'icona debug per aprire un pannello/form per modificare al volo stats, ATK, DEF e sigilli della carta selezionata.
- [ ] **Sidebar Informativa (`InfoSidebar.tsx`)**: Abilitare l'editing diretto di nome, costo, ATK, DEF e sigilli della carta selezionata quando `isMultiplayer === 4`.
- [ ] **Rifiniture Visive e Meccaniche**:
  - Migliorare la resa grafica dei sigilli.
  - Automatizzare la gestione e riproduzione delle linee di dialogo di Leshi.
  - **Sniper (Sigillo 503)**: Integrare la selezione manuale tramite `onClick` della colonna bersaglio.