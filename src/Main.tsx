import { useState } from "react";
import "./App.scss";
import { Button } from "primereact/button";
import Card from "./Card.tsx";
import CardSlot from "./CardSlot.tsx";
import LifeCounter from "./LifeCounter.tsx";
import React from "react";
import { useAppSelector, useAppDispatch } from "./hooks.ts";
import {
  CardType,
  EMPTY_CARD, Field, addP1bones, addP2bones,
  increaseP1Live, setCurrPlayer,
  setHammer,
  setShowRules,
  setShowSidebarInfo,
  setWarning,
  turnClock,
  updateField,
  updateP1draw, updateP2draw
} from "./cardReducer.tsx";
import Deck from "./Deck.tsx";
import { CustomToastSacr } from "./CustomToast.tsx";
import RuleDialog from "./RuleDialog.tsx";
import evolutions from './const/evolutions.json';
import SidebarCardInfo from "./SidebarCardInfo.tsx";

export interface Evolution {
  cardName: string,
  into: CardType
}

function Main() {
  const dispatch = useAppDispatch();
  const handCards: Field = useAppSelector((state) => state.card.handCards);
  const currPlayer: number = useAppSelector((state) => state.card.currPlayer);
  const P1Bones: number = useAppSelector((state) => state.card.P1Bones);
  const P2Bones: number = useAppSelector((state) => state.card.P2Bones);
  const fieldCards: Field = useAppSelector((state) => state.card.fieldCards);
  const rules = useAppSelector((state) => state.card.rules);
  const showRules = useAppSelector((state) => state.card.showRules);
  const hammer = useAppSelector((state) => state.card.hammer);

  const [nextPlayer, setNextPlayer] = useState<number>(2);
  const [turnLabel, setTurnLabel] = useState("End turn");

  const [dialogOptions, setDialogOptions] = useState<{ label: string; items: any[]; }[]>([]);

  const BattlePhase = (P1attack: boolean) => {
    const incr = P1attack ? 1 : -1;
    let tempSide: CardType[] = P1attack ? [...fieldCards.P1side] : [...fieldCards.P2side];
    let oppSide: CardType[] = P1attack ? [...fieldCards.P2side] : [...fieldCards.P1side];
    tempSide.forEach((c: CardType, index: number) => {
      if (c.atk > 0) {
        let tempCard = { ...c };
        let oppCard = oppSide.length > index ? { ...oppSide[index] } : null;
        if (oppCard && oppCard?.def > 0) {
          if (c.sigils?.includes('fly') && !oppCard.sigils?.includes('blokFly')) {
            dispatch(setWarning({
              message: 'fly_attack',
              subject: c.name,
              severity: 'info',
              expire: 1500
            }))
            dispatch(increaseP1Live(incr * c.atk));
          }
          else {
            if (oppCard.sigils?.includes('shield'))
              oppCard.sigils = [...oppCard.sigils.map((s) => s !== 'shield' ? s : 'empty')];
            else { //onOpponentCardDeath
              oppCard.def -= c.atk;
              if (oppCard.sigils?.includes('spikes')) {
                tempCard.def = c.def - 1; /* c.def -= 1; */
                if (tempCard.def <= 0) {
                  P1attack ? dispatch(addP1bones(c.dropBones)) : dispatch(addP2bones(c.dropBones));
                  dispatch(setWarning({
                    message: 'dies',
                    subject: c.name,
                    severity: 'info',
                    expire: 1500
                  }));
                  tempCard = EMPTY_CARD;
                }
                debugger
                //TODO fix copia by reference e si spacca
                tempSide[index] = tempCard;
              }
              if (oppCard.def <= 0) {
                if (oppCard.sigils?.includes('snakeBomb')) {
                  const opponentCards = 0//opponent_deck?.length || 0; //TODO controllo interno ?
                  // opponentCards > 2 ? DrawFromDeck(!P1attack, deck, handCards, rules, dispatch) :
                  //   DrawFromSQR(!P1attack, SQR, handCards, rules, dispatch);
                  // opponentCards > 1 ? DrawFromDeck(!P1attack, deck, handCards, rules, dispatch) :
                  //   DrawFromSQR(!P1attack, SQR, handCards, rules, dispatch);
                  // opponentCards > 0 ? DrawFromDeck(!P1attack, deck, handCards, rules, dispatch) :
                  //   DrawFromSQR(!P1attack, SQR, handCards, rules, dispatch);
                }
                P1attack ? dispatch(addP2bones(c.dropBones)) : dispatch(addP1bones(c.dropBones));
                dispatch(setWarning({
                  message: 'dies',
                  subject: c.name,
                  severity: 'info',
                  expire: 1500
                }));
                oppCard = EMPTY_CARD;
              }
            }

            oppSide[index] = oppCard; //senza scudo, ferita o EMPTY
            //debugger
            dispatch(updateField(
              {
                P1side: P1attack ? tempSide : oppSide,
                P2side: P1attack ? oppSide : tempSide
              }))
          }
        }
        else //no enemy
        // TODO bug, non attaccano la roccia???
        {
          dispatch(setWarning({
            message: 'direct_attack',
            subject: c.name,
            severity: 'info',
            expire: 1500
          }));
          dispatch(increaseP1Live(incr * c.atk));
        }
      }
    })
  };

  const EvolveFragilePhase = (P1attack: boolean) => {
    //importante! lavoro sui side invertiti,
    //così alla fine di P2 uccido/evolvo le creature di P1
    const tempSide = P1attack ? fieldCards.P1side : fieldCards.P2side;
    let oppSide = P1attack ? fieldCards.P2side : fieldCards.P1side;
    oppSide = oppSide.map((c: CardType) => {
      let tempCard = { ...c };
      if (c.sigils?.includes('fragile')) {
        P1attack ? dispatch(addP1bones(c.dropBones)) : dispatch(addP2bones(c.dropBones));
        dispatch(setWarning({
          message: 'fragile',
          subject: c.name,
          severity: 'info',
          expire: 1500
        }));
        tempCard = EMPTY_CARD;
      }
      else if (c.sigils?.includes('evolve')) {
        const evol = (evolutions as Evolution[]).find((ev) => ev.cardName === c.name);
        //debugger
        if (evol) {
          tempCard = {
            ...evol.into,
            cardID: c.cardID,
            atk: c.atk + evol.into.atk,
            def: c.def + evol.into.def,
          };
          dispatch(setWarning({
            message: 'evolves',
            // TODO props: 'into ...newName'
            subject: c.name,
            props: tempCard.name,
            severity: 'info',
            expire: 1500
          }));
        }
      }
      return tempCard;
    })
    dispatch(updateField(
      {
        P1side: P1attack ? tempSide : oppSide,
        P2side: P1attack ? oppSide : tempSide
      }))
  }

  const handleClock = () => {
    const turnedField: Field = {
      P1side: [
        fieldCards.P1side[1],
        fieldCards.P1side[2],
        fieldCards.P1side[3],
        fieldCards.P1side[4],
        fieldCards.P2side[4]],
      P2side: [
        fieldCards.P1side[0],
        fieldCards.P2side[0],
        fieldCards.P2side[1],
        fieldCards.P2side[2],
        fieldCards.P2side[3]]
    };
    dispatch(turnClock({ turnedField }));
    //TODO non fa l'update del field
  }

  const onPlayerChange = () => { //TODO sposta in un componente a parte con bottone
    if (currPlayer) {
      if (hammer)
        dispatch(setHammer());

      const next = currPlayer === 1 ? 2 : 1;
      setNextPlayer(next);
      dispatch(setCurrPlayer(0));
      setTurnLabel("Battle ...");
      if (rules.useBelts)
        handleClock();

      const P1attack: boolean = (currPlayer === 1);
      BattlePhase(P1attack);
      EvolveFragilePhase(P1attack);

      setTurnLabel("P" + next.toString() + " ready");
    } else {
      nextPlayer === 1 ? dispatch(updateP1draw(true)) : dispatch(updateP2draw(true))
      dispatch(setCurrPlayer(nextPlayer));
      setTurnLabel("End turn");
    }
  };

  const onDialodOpen = () => {
    let basicOptions = [
      { label: "P2 field side:", items: [...fieldCards.P2side.filter((c) => c.name)] },
      { label: "P1 field side:", items: [...fieldCards.P1side.filter((c) => c.name)] }]
    dispatch(setShowSidebarInfo(true));
    if (currPlayer === 2)
      basicOptions.unshift({ label: "P2 hand side:", items: [...handCards.P2side] })
    else if (currPlayer === 1)
      basicOptions.push({ label: "P1 hand side:", items: [...handCards.P1side] })
    setDialogOptions(basicOptions)
  }

  return (
    <div className="App">
      {showRules !== false && <RuleDialog />}
      <div className="player-side">
        <div className="player-cards-area pt-1">
          <div className="decks-area ml-2">
            <Deck owner={2} />
          </div>
          <div className="player-cards">
            <Card cardInfo={handCards.P2side[0] || EMPTY_CARD} />
            <Card cardInfo={handCards.P2side[1] || EMPTY_CARD} />
            <Card cardInfo={handCards.P2side[2] || EMPTY_CARD} />
            <Card cardInfo={handCards.P2side[3] || EMPTY_CARD} />
            <Card cardInfo={handCards.P2side[4] || EMPTY_CARD} />
            <Card cardInfo={handCards.P2side[5] || EMPTY_CARD} />
            <Card cardInfo={handCards.P2side[6] || EMPTY_CARD} />
            <Card cardInfo={handCards.P2side[7] || EMPTY_CARD} />
            <Card cardInfo={handCards.P2side[8] || EMPTY_CARD} />
            <Card cardInfo={handCards.P2side[9] || EMPTY_CARD} />
            <Card cardInfo={handCards.P2side[10] || EMPTY_CARD} />
          </div>
          <CustomToastSacr />
        </div>
      </div>
      <div className="board">
        <div className="side-stats ml-1">
          <>
            <LifeCounter owner={2} />
            {(rules.useCandles.P1 || rules.useCandles.P2)
              && <h3 className="m-0">{"Lit candles: " + (rules.useCandles.P2 ? '1' : '0')}</h3>}
            {rules.useBones && <h3 className="m-0">{"Bones: " + P2Bones}</h3>}
          </>
          <Button
            className="turn-button"
            label={turnLabel}
            onClick={onPlayerChange}
          />
          <>
            {rules.useBones && <h3 className="m-0">{"Bones: " + P1Bones}</h3>}
            {(rules.useCandles.P1 || rules.useCandles.P2)
              && <h3 className="m-0">{"Lit candles: " + (rules.useCandles.P1 ? '1' : '0')}</h3>}
            <LifeCounter owner={1} />
          </>
        </div>
        <div className="board-grids">
          <div className="board-grid">
            <CardSlot owner={2} index={0} />
            <CardSlot owner={2} index={1} />
            <CardSlot owner={2} index={2} />
            <CardSlot owner={2} index={3} />
            <CardSlot owner={2} index={4} />
          </div>
          <div className="board-grid">
            <CardSlot owner={1} index={0} />
            <CardSlot owner={1} index={1} />
            <CardSlot owner={1} index={2} />
            <CardSlot owner={1} index={3} />
            <CardSlot owner={1} index={4} />
          </div>
        </div>
        <div className="flex side-info">
          <Button
            aria-label='cards info'
            label='cards info'
            onClick={onDialodOpen} />

          {rules.useWatches.P2 && <div className="clock-image"
            onClick={() => currPlayer === 2 ?
              dispatch(setWarning({
                message: 'use_clock',
                subject: 'Player' + currPlayer,
                severity: 'action'
              })) :
              dispatch(setWarning({
                message: 'not_your_clock',
                subject: currPlayer ? 'Player' + currPlayer : 'Pause phase',
                severity: 'error'
              }))} />}

          {rules.useHammer && <div className={"hammer-image"
            + (hammer ? " hammer-selected" : '')}
            onClick={() => {
              currPlayer ? dispatch(
                setWarning({
                  message: 'use_hammer',
                  subject: 'Player' + currPlayer,
                  severity: 'warning'
                })) :
                dispatch(
                  setWarning({
                    message: 'action_pause_phase',
                    subject: 'Pause phase',
                    severity: 'error'
                  }));
              currPlayer && dispatch(setHammer())
            }} />}

          {rules.useWatches.P1 && <div className="clock-image"
            onClick={() => currPlayer === 1 ?
              dispatch(setWarning({
                message: 'use_clock',
                subject: 'Player' + currPlayer,
                severity: 'action'
              })) :
              dispatch(setWarning({
                message: 'not_your_clock',
                subject: currPlayer ? 'Player' + currPlayer : 'Pause phase',
                severity: 'error'
              }))
            } />}

          <Button
            aria-label='rules info'
            label='rules info'
            onClick={() => dispatch(setShowRules(true))} />
        </div>
      </div>
      <div className="player-side">
        <div className="player-cards-area pt-1">
          <div className="player-cards">
            <Card cardInfo={handCards.P1side[0] || EMPTY_CARD} />
            <Card cardInfo={handCards.P1side[1] || EMPTY_CARD} />
            <Card cardInfo={handCards.P1side[2] || EMPTY_CARD} />
            <Card cardInfo={handCards.P1side[3] || EMPTY_CARD} />
            <Card cardInfo={handCards.P1side[4] || EMPTY_CARD} />
            <Card cardInfo={handCards.P1side[5] || EMPTY_CARD} />
            <Card cardInfo={handCards.P1side[6] || EMPTY_CARD} />
            <Card cardInfo={handCards.P1side[7] || EMPTY_CARD} />
            <Card cardInfo={handCards.P1side[8] || EMPTY_CARD} />
            <Card cardInfo={handCards.P1side[9] || EMPTY_CARD} />
            <Card cardInfo={handCards.P1side[10] || EMPTY_CARD} />
          </div>
          <div className="decks-area">
            <Deck owner={1} />
          </div>
        </div>
      </div>
      <SidebarCardInfo dialogOptions={dialogOptions} />
    </div>
  );
}

export default Main;
