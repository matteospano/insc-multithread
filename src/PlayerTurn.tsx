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
  const canP1draw = useAppSelector((state) => state.card.canP1draw);
  const canP2draw = useAppSelector((state) => state.card.canP2draw);

  useEffect(() => {
    if (currPhase === 11 || currPhase === 21) {
      const nextPlayer = currPhase === 11 ? 1 : 2;
      currPhase === 11 ? dispatch(updateP1draw(true)) : dispatch(updateP2draw(true))
      dispatch(setCurrPlayer(nextPlayer));
      setTurnLabel("P" + nextPlayer + " end turn");
    }
  }, [currPhase]);

  interface battleSigils {
    atkSig: number[], deathSig: number[], enAtkListen: number[], enDefSig: number[], enDeathSig: number[]
  }

  const checkSigilList = (mySide: CardType[], enSide: CardType[]): battleSigils => {
    let sigils: battleSigils = { atkSig: [], deathSig: [], enAtkListen: [], enDefSig: [], enDeathSig: [] }
    mySide.forEach((c: CardType, index: number) => {
      if (c.sigils?.find((s) => 499 < s && s < 600)) //500 atk
        sigils.atkSig.push(index);
      if (c.sigils?.find((s) => 99 < s && s < 400)) //1/2/300 death
        sigils.deathSig.push(index);
    });
    enSide.forEach((c: CardType, index: number) => {
      if (c.sigils?.find((s) => 89 < (s % 100) && (s % 100) < 100)) //90 en_atk
        sigils.enAtkListen.push(index);
      if (c.sigils?.find((s) => 599 < s && s < 700)) //600 def
        sigils.enDefSig.push(index);
      if (c.sigils?.find((s) => 99 < s && s < 400)) //1/2/300 death
        sigils.enDeathSig.push(index);
    });
    return sigils;
  }

  const BattlePhase = (P1attack: boolean) => {
    const incr = P1attack ? 1 : -1;
    let tempSide: CardType[] = P1attack ? [...fieldCards.P1side] : [...fieldCards.P2side];
    let oppSide: CardType[] = P1attack ? [...fieldCards.P2side] : [...fieldCards.P1side];

    const sigils: battleSigils = checkSigilList(tempSide, oppSide);
    debugger

    // tempSide.forEach((c: CardType, index: number) => {
    //   debugger
    //   if (c.atk > 0) {
    //     /* select attacker */
    //     let tempCard: CardType = { ...c, fight: true };
    //     tempSide[index] = tempCard;

    //     let oppCard: CardType = { ...oppSide[index], fight: true };
    //     if (oppCard?.def > 0) {
    //       debugger
    //       if (c.sigils?.includes(502) && !oppCard.sigils?.includes(600)) {
    //         dispatch(setWarning({
    //           message: 'fly_attack',
    //           subject: c.name,
    //           severity: 'info',
    //           expire: 1500
    //         }))
    //         dispatch(increaseP1Live(incr * c.atk));
    //       }
    //       else {
    //         if (oppCard.sigils?.includes(206))
    //           oppCard.sigils = [...oppCard.sigils.map((s) => s === 206 ? -1 : s)];
    //         else { //onOpponentCardDeath
    //           oppCard.def -= c.atk;
    //           if (oppCard.sigils?.includes(603)) {
    //             tempCard.def = c.def - 1; /* c.def -= 1; */
    //             if (tempCard.def <= 0) {
    //               P1attack ? dispatch(addP1bones(c.dropBones)) : dispatch(addP2bones(c.dropBones));
    //               dispatch(setWarning({
    //                 message: 'dies',
    //                 subject: oppCard.name,
    //                 severity: 'info',
    //                 expire: 1500
    //               }));
    //               tempCard = EMPTY_CARD;
    //             }
    //           }

    //           if (oppCard.def <= 0) { //onDeath
    //             if (oppCard.sigils?.includes(207)) { //'snakeBomb'
    //               const opponentCards = 0//opponent_deck?.length || 0; //TODO controllo interno ?
    //               // opponentCards > 2 ? DrawFromDeck(!P1attack, deck, handCards, rules, dispatch) :
    //               //   DrawFromSQR(!P1attack, SQR, handCards, rules, dispatch);
    //               // opponentCards > 1 ? DrawFromDeck(!P1attack, deck, handCards, rules, dispatch) :
    //               //   DrawFromSQR(!P1attack, SQR, handCards, rules, dispatch);
    //               // opponentCards > 0 ? DrawFromDeck(!P1attack, deck, handCards, rules, dispatch) :
    //               //   DrawFromSQR(!P1attack, SQR, handCards, rules, dispatch);
    //             }
    //             P1attack ? dispatch(addP2bones(c.dropBones)) : dispatch(addP1bones(c.dropBones));
    //             debugger
    //             dispatch(setWarning({
    //               message: 'dies',
    //               subject: oppCard.name,
    //               severity: 'info',
    //               expire: 1500
    //             }));
    //             oppCard = EMPTY_CARD;
    //           }
    //         }

    //         //TODO sposta in func onDeath e fai fading della carta (sfondo -> transparent per 700ms)
    //         debugger
    //         //TODO fix copia by reference e si spacca
    //         tempSide[index] = { ...tempCard, fight: false };
    //         /* deselect defender*/
    //         oppSide[index] = { ...oppCard, fight: false }; //senza scudo, ferita o EMPTY
    //         debugger
    //         dispatch(updateField(
    //           {
    //             P1side: P1attack ? tempSide : oppSide,
    //             P2side: P1attack ? oppSide : tempSide
    //           }))
    //       }
    //     }
    //     else //no enemy
    //     // TODO bug, non attaccano la roccia???
    //     {
    //       dispatch(updateField(
    //         {
    //           P1side: P1attack ? tempSide : oppSide,
    //           P2side: P1attack ? oppSide : tempSide
    //         }))

    //       dispatch(setWarning({
    //         message: 'direct_attack',
    //         subject: c.name,
    //         severity: 'info',
    //         expire: 1500
    //       }));
    //       dispatch(increaseP1Live(incr * c.atk));

    //       /* deselect attacker*/
    //       tempCard = { ...tempCard, fight: false };
    //       tempSide[index] = tempCard;
    //       dispatch(updateField(
    //         {
    //           P1side: P1attack ? tempSide : oppSide,
    //           P2side: P1attack ? oppSide : tempSide
    //         }))
    //     }
    //   }
    // })
    return {
      P1side: P1attack ? tempSide : oppSide,
      P2side: P1attack ? oppSide : tempSide
    }
  };

  const TurnOverAndEvolvePhase = (field: Field, P1attack: boolean) => {
    const turnOverSig: number[] = [];
    const evolveSig: number[] = [];

    let tempSide = P1attack ? field.P1side : field.P2side;
    let oppSide = P1attack ? field.P2side : field.P1side;

    tempSide.forEach((c: CardType, index: number) => {
      if (c.sigils?.find((s) => 39 < (s % 100) && (s % 100) < 50)) //40 turn over
        turnOverSig.push(index);
    });
    //importante! lavoro sui side invertiti,
    //così alla fine di P2 uccido/evolvo le creature di P1
    oppSide.forEach((c: CardType, index: number) => {
      if (c.sigils?.find((s) => 299 < s && s < 500)) //3/400 evolve
        evolveSig.push(index);
      if (c.sigils?.find((s) => s === 640))//rimuovi water
        evolveSig.push(index);
    });

    if (turnOverSig.length > 0) {
      turnOverSig.forEach((s) => {
        if (tempSide[s].sigils?.includes(940) && s < 4) {//push
          let tempCard = tempSide[s + 1];
          tempSide[s + 1] = tempSide[s];
          tempSide[s] = tempCard;
        }
        if (tempSide[s].sigils?.includes(640)) //water
          tempSide[s].name = tempSide[s].name + '_sub';
      })
    }

    if (evolveSig.length > 0)
      turnOverSig.forEach((s) =>  {
      if (oppSide[s].sigils?.includes(402)) { //fragile
        P1attack ? dispatch(addP1bones(oppSide[s].dropBones)) : dispatch(addP2bones(oppSide[s].dropBones));
        dispatch(setWarning({
          message: 'fragile',
          subject: oppSide[s].name,
          severity: 'info',
          expire: 1500
        }));
        oppSide[s] = EMPTY_CARD;
      }
      if (oppSide[s].sigils?.includes(401)) { //evolve
        const evol = (evolutions as Evolution[]).find((ev) => ev.cardName === oppSide[s].name);
        //debugger
        if (evol) {
          oppSide[s] = {
            ...evol.into,
            cardID: oppSide[s].cardID,
            atk: oppSide[s].atk + evol.into.atk,
            def: oppSide[s].def + evol.into.def,
          };
          dispatch(setWarning({
            message: 'evolves',
            // TODO props: 'into ...newName'
            subject: oppSide[s].name,
            props: oppSide[s].name,
            severity: 'info',
            expire: 1500
          }));
        }
      }
      if (oppSide[s].sigils?.includes(640)) //water
      oppSide[s].name = oppSide[s].name.split('_sub')[0];
    })

      dispatch(updateField(
        {
          P1side: P1attack ? tempSide : oppSide,
          P2side: P1attack ? oppSide : tempSide
        }))
    }

    const onPlayerChange = () => {
      // if (currPhase === 11 || currPhase === 21)
      //   setTurnLabel("Wait for P" + currPlayer + ' to draw');
      if (currPlayer && currPhase !== 10 && currPhase !== 20) { //bottone 'disabled' in wait for player
        if (hammer)
          dispatch(setHammer());

        setTurnLabel("Battle ...");
        if (rules.useBelts) handleClock(fieldCards, true, dispatch);

        const updatedField = BattlePhase(currPlayer === 1);
        TurnOverAndEvolvePhase(updatedField, currPlayer === 1);
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
      disabled={currPhase === 10 || (currPhase === 11 && canP1draw)
        || currPhase === 20 || (currPhase === 21 && canP2draw)}
      onClick={onPlayerChange}
    />);
  }
