
import React, { useState } from "react";
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Dialog } from 'primereact/dialog';
import { Carousel } from 'primereact/carousel';
import { MultiSelect } from 'primereact/multiselect';
import './css/RuleDialog.scss';
import "./icons/Icons.scss";
import { useAppSelector, useAppDispatch } from "./hooks.ts";
import { CardType, EMPTY_HAND_CARDS, RuleType, setDecks, setRules, setSecretName, setShowRules, setWarning, updateField } from "./cardReducer.tsx";
import { SigilDefType, families, sigil_def } from "./const/families.tsx";
import deck_P1 from './defaultSettings/P1Deck.json';
import deck_P2 from './defaultSettings/P2Deck.json';
import deck_P2_Easy from './defaultSettings/P2DeckEasy.json';
import deck_P2_Medium from './defaultSettings/P2DeckMedium.json';
import deck_P2_Hard from './defaultSettings/P2DeckHard.json';
import field_P2_Workshop from './defaultSettings/initialFieldP2Magnificus.json';
import { rock } from "./utilCards.tsx";
import { Dropdown } from "primereact/dropdown";
import { DrawFromDeck, DrawFromSQR } from "./utils.tsx";

//TODO inizializza i dati da localstorage come scorsa partita
//TODO implementa il prospettore (già settato negli eventi della candela)
//TODO gancio in giocatore singolo ruba 'il pesce più fresco'
//in multiplayer gancio uso singolo su carta a scelta

//TODO apprendista tu e avversario selezionate 1 carta a testa, crea copia nei vostri deck
// con +o-1 atk,def, aggiunge sigillo random o raramente +1 sacr richiesti.



export default function RuleDialog() {
  const dispatch = useAppDispatch();
  const rules: RuleType = useAppSelector((state) => state.card.rules);
  const showRules = useAppSelector((state) => state.card.showRules);
  const visible: boolean = showRules === false ? false : true;
  const disableEdit: boolean = (showRules !== undefined);
  const fieldCards = useAppSelector((state) => state.card.fieldCards);
  const hand1Length: number = useAppSelector((state) => state.card.handCards.P1side.length);
  const hand2Length: number = useAppSelector((state) => state.card.handCards.P2side.length);

  const [isMultiplayer, setMultiplayer] = useState<number>(0); //0:multiplayer, 1/2/3:singleplayer, 4:workshop
  const easyTitle: string = "one or two tiar 1 cards played per turn";
  const mediumTitle: string = "one or two tiar 2 cards played per turn";
  const hardTitle: string = "one or two tiar 3 cards played per turn. Uses totems. TOO FAST TOO SOON!";

  const [editDecks, setEditDecks] = useState<boolean>(true);
  const [useBones, setBones] = useState<boolean>(rules.useBones);
  const [useLeshiLine, setLeshiLine] = useState<boolean>(rules.useLeshiLine);
  const [use4slots, set4slots] = useState<boolean>(rules.use4slots);
  const [useHammer, setHammer] = useState<boolean>(rules.useHammer);
  const [useBelts, setBelts] = useState<boolean>(rules.useBelts);
  const [useWatches, setWatches] = useState<boolean>(rules.useWatches.P1 || rules.useWatches.P2);
  const [useCandles, setCandles] = useState<boolean>(rules.useCandles.P1 || rules.useCandles.P2);
  const [boss, setBoss] = useState<string>(rules.boss || '');
  const [randomSigils, setRandomSigils] = useState<boolean>(rules.randomSigils ? true : false);
  const [useTotems, setTotems] = useState<boolean>(rules.useTotems.P1Head ? true : false);

  const [activePlayer, setActivePlayer] = useState<number>(1);
  const [P1deck, setP1deck] = useState<CardType[]>([...deck_P1] as CardType[]);
  const [P2deck, setP2deck] = useState<CardType[]>([...deck_P2] as CardType[]);
  const [defaultDeck1, setDefaultDeck1] = useState<boolean>(true);
  const [defaultDeck2, setDefaultDeck2] = useState<boolean>(true);
  const [P1TotemHead, setP1TotemHead] = useState(rules.useTotems.P1Head || '');
  const [P1TotemSigil, setP1TotemSigil] = useState(rules.useTotems.P1Sigil || -1);
  const [P2TotemHead, setP2TotemHead] = useState(rules.useTotems.P2Head || '');
  const [P2TotemSigil, setP2TotemSigil] = useState(rules.useTotems.P2Sigil || -1);

  interface deckOption { family: string, cards: CardType[] }

  const onFamilyChange = (family: any) => {
    if (!disableEdit) {
      if (activePlayer === 1 && P2TotemHead !== family)
        setP1TotemHead(family)
      if (activePlayer === 2 && P1TotemHead !== family)
        setP2TotemHead(family)
    }
  }
  const familyTemplate = (family: any) => {
    return (
      <div className={P1TotemHead === family ?
        "rule-carosel-template selected-P1-carosel" :
        P2TotemHead === family ?
          "rule-carosel-template selected-P2-carosel" :
          "rule-carosel-template"}
        onClick={() => onFamilyChange(family)}>
        <p className={"rule-image " + family + "-sigil"} />
        <h4 className="mt-2 mb-1">{family}</h4>
      </div>
    );
  };
  const onSigilChange = (sigilId: number) => {
    if (!disableEdit) {
      if (activePlayer === 1 && P2TotemSigil !== sigilId)
        setP1TotemSigil(sigilId)
      if (activePlayer === 2 && P1TotemSigil !== sigilId)
        setP2TotemSigil(sigilId)
    }
  }
  const sigilTemplate = (sigil: SigilDefType) => {
    return (
      <div className={P1TotemSigil === sigil.id ?
        "rule-carosel-template selected-P1-carosel" :
        P2TotemSigil === sigil.id ?
          "rule-carosel-template selected-P2-carosel" :
          "rule-carosel-template"} title={sigil.trad}
        onClick={() => onSigilChange(sigil.id)}>
        <p className={"rule-image sigil_" + sigil.id} />
        <h4 className="mt-2 mb-1">{sigil.name}</h4>
      </div>
    );
  };

  const deckSelection = (isP1: boolean): deckOption[] => {
    const deck: CardType[] = isP1 ? [...deck_P1] : [...deck_P2];
    let options: deckOption[] = [];
    deck.forEach((d) => {
      if (useBones || d.bone === 0) { //mostra elementi filtrati
        const index = options.findIndex((o) => o.family === d.family);
        if (index >= 0)
          options[index].cards.push(d);
        else
          options.push({ family: d.family, cards: [d] });
      }
    })
    return options
  }

  const onConfirmRules = () => {
    /*Achievements segreti*/
    let secretName: string = ''
    if (useBones && useLeshiLine && useCandles && boss === 'prospector' && useTotems &&
      !useHammer && !useBelts && use4slots && !useWatches)
      secretName = 'Leshi'; //bones + leshiLine + candles + prospector + totems
    if (!use4slots && useBelts && boss === 'hunter' &&
      !useBones && !useLeshiLine && !useCandles &&
      !useHammer && !useWatches && !randomSigils && !useTotems)
      secretName = 'P03'; //5lines + belts + bountyHunter
    if (useWatches && randomSigils &&
      !useBones && !useLeshiLine &&
      !useCandles && !useBelts &&
      !useHammer && use4slots && !useTotems)
      secretName = 'Lonely Wizard'; //watches + randomSigils
    if (useBones && useHammer &&
      !useLeshiLine && !useCandles && !useBelts &&
      useHammer && use4slots && !useWatches &&
      !randomSigils && !useTotems)
      secretName = 'Grimora'; //bones + hammer

    if (secretName) {
      dispatch(setSecretName(secretName));
      dispatch(setWarning({
        message: 'secret_name',
        subject: 'Player',
        severity: 'action',
        props: secretName
      }))
    }

    const tempRules: RuleType = {
      isMultiplayer,
      useBones, useLeshiLine, useHammer,
      use4slots, useBelts,
      useWatches: { P1: useWatches, P2: useWatches },
      useCandles: { P1: useCandles, P2: useCandles },
      boss, randomSigils,
      useTotems: {
        P1Head: useTotems ? P1TotemHead : undefined,
        P1Sigil: useTotems ? P1TotemSigil : undefined,
        P2Head: useTotems ? P2TotemHead : undefined,
        P2Sigil: useTotems ? P2TotemSigil : undefined
      }
    }
    dispatch(setRules(tempRules));
    dispatch(setShowRules(false));
    if (!useBones)
      dispatch(setDecks({
        P1Deck: P1deck.filter((c) => c.bone === 0),
        P2Deck: P2deck.filter((c) => c.bone === 0)
      }));
    else
      dispatch(setDecks({ P1Deck: P1deck, P2Deck: P2deck }));
    if (use4slots && isMultiplayer !== 4) {
      let P1side = [...fieldCards.P1side];
      P1side[2] = rock;
      let P2side = [...fieldCards.P2side];
      P2side[2] = rock;
      dispatch(updateField({ P1side, P2side }));
    }
    if (isMultiplayer === 4) {
      let P1side = [...fieldCards.P1side];
      P1side[1] = P1side[0]; //rimuovo roccia
      let P2side = [...field_P2_Workshop] as CardType[];
      dispatch(updateField({ P1side, P2side }));
    }
    /* distribute cards P1*/
    DrawFromSQR(true, hand1Length, rules, dispatch);
    DrawFromDeck(true, P1deck, tempRules, hand1Length, dispatch);
    DrawFromDeck(true, P1deck, tempRules, hand1Length, dispatch);
    DrawFromDeck(true, P1deck, tempRules, hand1Length, dispatch);
    DrawFromDeck(true, P1deck, tempRules, hand1Length, dispatch);
    DrawFromDeck(true, P1deck, tempRules, hand1Length, dispatch);
    //TODO bug: forse pesca doppioni va rallentata la pesca con await?
    if (isMultiplayer === 0) {
      /* distribute cards P2*/
      DrawFromSQR(false, hand2Length, rules, dispatch);
      DrawFromDeck(false, P2deck, tempRules, hand2Length, dispatch);
      DrawFromDeck(false, P2deck, tempRules, hand2Length, dispatch);
      DrawFromDeck(false, P2deck, tempRules, hand2Length, dispatch);
      DrawFromDeck(false, P2deck, tempRules, hand2Length, dispatch);
      DrawFromDeck(false, P2deck, tempRules, hand2Length, dispatch);
      //TODO bug: forse pesca doppioni va rallentata la pesca con await?
    }
  }

  const dialogHeader = () => {
    return (
      <div className="flex">
        <div className="col-2-5">
          <p className="mt-0 ml-1 mb-0 mr-2">
            {disableEdit ? "Ruleset recap" : "Edit ruleset"}</p>
        </div>
        <div className="col-3">
          <Button
            className={isMultiplayer === 0 ? "button-multiplayer" : ""}
            label="Local Multiplayer"
            onClick={() => setMultiplayer(0)}
            title="challenge your friend" />
        </div>
        <div className="col-3">
          <Button
            className={(isMultiplayer === 1 ? "button-singleplayer button-singleplayer-easy" :
              isMultiplayer === 2 ? "button-singleplayer button-singleplayer-medium" :
                isMultiplayer === 3 ? "button-singleplayer button-singleplayer-hard" : '')}
            label={"Single player" +
              (isMultiplayer === 1 ? ': Easy' :
                isMultiplayer === 2 ? ': Medium' :
                  isMultiplayer === 3 ? ': Hard' : '')
            }
            onClick={() => {
              isMultiplayer === 1 ? setP2deck([...deck_P2_Medium] as CardType[]) :
                isMultiplayer === 2 ? setP2deck([...deck_P2_Hard] as CardType[]) :
                  setP2deck([...deck_P2_Easy] as CardType[])

              isMultiplayer === 2 && setTotems(true) //sta diventando 3, hard
              //TODO setta già il totem2
              isMultiplayer < 3 ? setMultiplayer(isMultiplayer + 1) : setMultiplayer(1);
            }}
            title={"Challenge Leshi: " +
              (isMultiplayer === 1 ? easyTitle :
                isMultiplayer === 2 ? mediumTitle :
                  isMultiplayer === 3 ? hardTitle :
                    "Easy, medium or hard mode.")
            }
          />
        </div>
        <div className="col-3">
          <Button
            className={isMultiplayer === 4 ? "button-workshop" : ""}
            label="Magnificus Tower"
            onClick={() => { setMultiplayer(4); setP2deck([] as CardType[]) }}
            title="Workshop" />
        </div>
      </div>)
  }

  return (
    <Dialog header={dialogHeader} visible={visible} className="rule-dialog" onHide={() => dispatch(setShowRules(false))}>
      <div style={{ height: '32.2rem' }}>
        <div className="flex">
          <div className="col-4">
            <h3 className="mt-1">Gameplay</h3>
            <div className="flex-row mt-1">
              <Checkbox checked={useLeshiLine} disabled={disableEdit} onChange={e => setLeshiLine(e.checked || false)} />
              <p className="mt-0 ml-1 mb-0"
                title="See next move of each other"> Play in advance</p>
            </div>
            <div className="flex-row mt-1">
              <Checkbox checked={useCandles}
                disabled={disableEdit}
                onChange={e => {
                  setCandles(e.checked || false)
                  if (!e.value) setBoss('')
                }} />
              <p className="mt-0 ml-1 mb-0"
                title="3 lives or one-shot victory"> Light candels</p>
            </div>
            <div className="flex-row mt-1">
              <p className={"mt-0 ml-1 mb-0 mr-1" +
                ((disableEdit || !useCandles) ? ' disabled' : '')}
                title="on candle blown out, you will drawn a special card">Spawn</p>
              <Dropdown
                disabled={(disableEdit || !useCandles)}
                value={boss}
                placeholder="select a boss"
                options={
                  [{ label: "the Angler", value: "angler" },
                  { label: "Prospector", value: "prospector" },
                  { label: "the Hunter", value: "hunter" },
                  { label: "Necromancer", value: "necromancer" }]
                }
                optionValue="value"
                optionLabel="label"
                onChange={(data) => setBoss(data.value)}
                className="mt-0 mr-2"
              />
            </div>
          </div>

          <div className="col-4">
            <h3 className="mt-1">Field</h3>
            <div className="flex-row mt-1">
              <Checkbox checked={use4slots} disabled={disableEdit}
                onChange={e => set4slots(e.checked || false)} />
              <p className="mt-0 ml-1 mb-0"
                title="starts with rocks in the central line"> Block the middle path</p>
            </div>
            <div className="flex-row mt-1">
              <Checkbox checked={useHammer} disabled={disableEdit} onChange={e => setHammer(e.checked || false)} />
              <p className="mt-0 ml-1 mb-0"
                title="adds an hammer to destroy any card on your side of the field"> Grip the hammer</p>
            </div>
            <div className="flex-row mt-1">
              <Checkbox checked={useWatches} disabled={disableEdit} onChange={e => setWatches(e.checked || false)} />
              <p className="mt-0 ml-1 mb-0"
                title="turns the full field clockwise/anticlockwise once per player"> Distribute watches</p>
            </div>
            <div className="flex-row mt-1">
              <Checkbox checked={useBelts} disabled={disableEdit} onChange={e => setBelts(e.checked || false)} />
              <p className="mt-0 ml-1 mb-0"
                title="permanently spins the field clockwise at each round"> Place conveyor belts</p>
            </div>
          </div>

          <div className="col-4">
            <h3 className="mt-1">Cards</h3>
            <div className="flex-row mt-1">
              <Checkbox checked={editDecks} disabled={disableEdit} onChange={e => setEditDecks(e.checked || false)} />
              <p className="mt-0 ml-1 mb-0"
                title="choose from 20 to 30 cards for each player"> Edit decks</p>
            </div>
            <div className="flex-row mt-1">
              <Checkbox checked={useBones} disabled={disableEdit} onChange={e => setBones(e.checked || false)} />
              <p className="mt-0 ml-1 mb-0"
                title="add the bones sacrifice feature and its cards"> Enable bone card</p>
            </div>
            <div className="flex-row mt-1">
              <Checkbox checked={randomSigils}
                disabled={disableEdit || useTotems}
                onChange={e => {
                  setRandomSigils(e.checked || false)
                  if (e.checked) setTotems(false)
                }} />
              <p className={"mt-0 ml-1 mb-0" +
                ((disableEdit || useTotems) ? ' disabled' : '')}
                title="add a random sigil to each drawn card">Re-paint every sigil</p>
              {/* tutte le carte col sigillo ? random */}
            </div>
            <div className="flex-row mt-1">
              <Checkbox checked={useTotems}
                disabled={disableEdit || randomSigils}
                onChange={e => {
                  setTotems(e.checked || false)
                  if (e.checked) setRandomSigils(false)
                }} />
              <p className={"mt-0 ml-1 mb-0" +
                ((disableEdit || randomSigils || isMultiplayer === 3) ? ' disabled' : '')}
                title="add a chosen sigil to each drawn card if their family corrispond to the selected ones">Place totems</p>
              {/* TODO refresh sigils sulle initialField */}
            </div>
          </div>
        </div>
        {
          editDecks && <div className="mt-2">
            <span className="flex-row">
              <p className="mt-0 ml-1 mb-0 mr-2"> {disableEdit ? "Current decks:" : "Compose decks:"}</p>
              {!disableEdit && <>
                <Button label="Modify deck 1" className={activePlayer === 1 ? "mr-1 selected-P1-carosel" : "mr-1"}
                  onClick={() => setActivePlayer(1)} title={"P1 deck: " + P1deck.length + " cards"} />
                <Button label="Modify deck 2" disabled={isMultiplayer > 0} className={activePlayer === 2 ? "mr-1 selected-P2-carosel" : "mr-1"}
                  onClick={() => setActivePlayer(2)} title={"P2 deck: " + P2deck.length + " cards"} />
              </>}
              <div className="flex-row mt-0 ml-2">
                <Checkbox
                  checked={activePlayer === 1 ? defaultDeck1 : defaultDeck2}
                  disabled={disableEdit || (activePlayer === 2 && isMultiplayer > 0)}
                  onChange={(e) => {
                    if (activePlayer === 1) {
                      setDefaultDeck1(e.checked || false)
                      e.checked && setP1deck([...deck_P1] as CardType[])
                    }
                    else {
                      setDefaultDeck2(e.checked || false)
                      e.checked && setP2deck([...deck_P2] as CardType[])
                    }
                  }} />

                <p className="mt-0 ml-1 mb-0"
                  title="starts with the default deck"> {'Default deck' + activePlayer}</p>
              </div>
            </span>

            <MultiSelect
              value={activePlayer === 1 ? P1deck : P2deck}
              disabled={activePlayer === 2 && isMultiplayer > 0}
              onChange={(e) => {
                if (activePlayer === 1) {
                  setDefaultDeck1(false);
                  setP1deck(e.value);
                } else {
                  setDefaultDeck2(false);
                  setP2deck(e.value);
                }
              }}
              options={deckSelection(activePlayer === 1)}
              optionLabel="name" display="chip"
              placeholder={"Select P" + activePlayer + " cards"}
              optionGroupLabel="family"
              optionGroupChildren="cards"
              //maxSelectedLabels={30}
              className="p-dropdown mt-1"
            />
          </div>
        }
        {
          useTotems && <div className="mt-2">
            <span className="flex-row">
              <p className="mt-0 ml-1 mb-0 mr-2"> {disableEdit ? "Current totems:" : "Compose totems:"}</p>
              {!disableEdit && <>
                <Button label="Modify totem 1" className={activePlayer === 1 ? "mr-1 selected-P1-carosel" : "mr-1"}
                  onClick={() => setActivePlayer(1)} />
                <Button label="Modify totem 2" className={activePlayer === 2 ? "selected-P2-carosel" : ""}
                  onClick={() => setActivePlayer(2)} />
              </>}
            </span>

            <Carousel
              value={families.slice(0, families.length)}
              numScroll={1}
              numVisible={8}
              itemTemplate={familyTemplate} />

            <Carousel
              value={sigil_def.filter((s) => s.totem).slice(0, sigil_def.length)}
              numScroll={1}
              numVisible={8}
              itemTemplate={sigilTemplate} />
          </div>
        }
      </div >

      <div className="p-dialog-footer">
        {!disableEdit && <div className="flex-row button-end mt-1">
          <Button label="Confirm rules" onClick={onConfirmRules} />
        </div>}
      </div>
    </Dialog >
  )
}
