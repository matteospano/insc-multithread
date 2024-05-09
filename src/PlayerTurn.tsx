import React, { useEffect, useState } from "react";
import {
  Field, setCurrPlayer, setHammer, updateP1draw, updateP2draw,
  addP1bones, addP2bones, increaseP1Live, updateField,
  CardType,
  setWarning,
  EMPTY_CARD,
  setCurrPhase
} from "./cardReducer.tsx";
import { useAppSelector, useAppDispatch } from "./hooks.ts";
import { handleClock } from "./utils.tsx";
import { Button } from "primereact/button";
import evolutions from './const/evolutions.json';
import { Evolution } from "./Main.tsx";
import './css/PlayerTurn.scss'

export default function PlayerTurn(): JSX.Element {
  const dispatch = useAppDispatch();
  const [turnLabel, setTurnLabel] = useState("End turn");

  const currPlayer: number = useAppSelector((state) => state.card.currPlayer);
  const currPhase: number = useAppSelector((state) => state.card.currPhase);
  const fieldCards: Field = useAppSelector((state) => state.card.fieldCards);
  const hammer = useAppSelector((state) => state.card.hammer);
  const rules = useAppSelector((state) => state.card.rules);

  useEffect(() => {
    if (currPhase === 11 || currPhase === 21) {
      const nextPlayer = currPhase === 11 ? 1 : 2;
      currPhase === 11 ? dispatch(updateP1draw(true)) : dispatch(updateP2draw(true))
      dispatch(setCurrPlayer(nextPlayer));
      setTurnLabel("P" + nextPlayer + " end turn");
    }
  }, [currPhase]);

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

  const onPlayerChange = () => {
    if (currPlayer && currPhase !== 10 && currPhase !== 20) { //bottone 'disabled' in wait for player
      if (hammer)
        dispatch(setHammer());

      setTurnLabel("Battle ...");
      if (rules.useBelts) handleClock(fieldCards, true, dispatch);

      BattlePhase(currPlayer === 1);
      EvolveFragilePhase(currPlayer === 1);
      const next = currPlayer === 1 ? 2 : 1;
      dispatch(setCurrPlayer(0));

      if (rules.isMultiplayer > 0) //elimina il click su ready, vale per tutti i single player
        dispatch(setCurrPhase(next === 1 ? 11 : 21));
      else {
        setTurnLabel("Wait for P" + next);
        dispatch(setCurrPhase(next === 1 ? 10 : 20));
      }
    }
  };


  return (<Button
    className={"turn-button " + "turn-button-col-" + currPlayer}
    label={turnLabel}
    onClick={onPlayerChange}
  />);
}
