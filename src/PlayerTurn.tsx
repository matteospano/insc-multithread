import React, { useEffect, useState } from "react";
import {
  Field, setCurrPlayer, setHammer, updateP1draw, updateP2draw,
  addP1bones, addP2bones, increaseP1Live, updateField,
  CardType,
  setWarning,
  setCurrPhase
} from "./cardReducer.tsx";
import { useAppSelector, useAppDispatch } from "./hooks.ts";
import { handleClock } from "./utils.tsx";
import { Button } from "primereact/button";
import evolutions from './const/evolutions.json';
import { Evolution } from "./Main.tsx";
import './css/PlayerTurn.scss'
import { EMPTY_CARD } from "./utilCards.tsx";
import CardSlot from "./CardSlot.tsx";

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
    atkSig: number[], deathSig: number[], enBurrower: number[], enDefSig: number[], enDeathSig: number[]
  } //enHelper

  const checkSigilList = (mySide: CardType[], enSide: CardType[]): battleSigils => {
    let sigils: battleSigils = { atkSig: [], deathSig: [], enBurrower: [], enDefSig: [], enDeathSig: [] }
    mySide.forEach((c: CardType, index: number) => {
      if (c.sigils?.find((s) => 499 < s && s < 600)) //500 atk
        sigils.atkSig.push(index);
      if (c.sigils?.find((s) => 99 < s && s < 400)) //1/2/300 death
        sigils.deathSig.push(index);
    });
    enSide.forEach((c: CardType, index: number) => {
      if (c.sigils?.find((s) => s === 990)) //burrower
        sigils.enBurrower.push(index);
      // if (c.sigils?.find((s) => s===991)) //helper
      // sigils.enHelper.push(index);
      if (c.sigils?.find((s) => 600 < s && s < 700)) //600 def, ignora blockFly
        sigils.enDefSig.push(index);
      if (c.sigils?.find((s) => 99 < s && s < 400)) //1/2/300 death
        sigils.enDeathSig.push(index);
    });
    return sigils;
  }

  const onAtk = (atk: number, defender: CardType, defInd: number, sigils: battleSigils, riflesso?: boolean): { def: CardType, dannoRifl: number } => {
    if (defender.sigils && (riflesso ? true : sigils.enDefSig.includes(defInd))) {
      if (defender.sigils.includes(604)) { //shield
        const noShield = [...defender.sigils].filter((s) => s !== 604);
        return {
          def: {
            ...defender,
            sigils: noShield
          }, dannoRifl: !riflesso && defender.sigils.includes(603) ? 1 : 0 //spikes non si applica 2 volte
        }
      }
      else {
        if (atk < defender.def)
          return { def: { ...defender, def: defender.def - atk }, dannoRifl: 0 }
        else {
          const card = onDeath(defender, riflesso ? sigils.deathSig : sigils.enDeathSig)
          return { def: card, dannoRifl: defender.sigils.includes(603) ? 1 : 0 } //spikes 
        }
      }
    }
    else {
      if (atk < defender.def)
        return { def: { ...defender, def: defender.def - atk }, dannoRifl: 0 }
      else {
        const card = onDeath(defender, riflesso ? sigils.deathSig : sigils.enDeathSig)
        return { def: card, dannoRifl: 0 }
      }
    }



  }

  const onDeath = (card: CardType, sigils: number[]): CardType => {
    //             dispatch(setWarning({
    //               message: 'dies',
    //               subject: card.name,
    //               severity: 'info',
    //               expire: 1500
    //             }));
    console.log('dies ', card.name);

    return EMPTY_CARD
  }

  const directAtk = (increase: number, atk: number, cardName: string, dispatch: any) => {
    //       dispatch(setWarning({
    //         message: 'direct_attack',
    //         subject: cardName,
    //         severity: 'info',
    //         expire: 1500
    //       }));
    console.log('direct_attack ', cardName);
    dispatch(increaseP1Live(increase * atk));
  }

  const burrowerMove = (enBurrower: number[], atkIndex: number,
    defIndex: number, tempSide: CardType[], oppSide: CardType[], sigils: battleSigils
  ): { atkSide: CardType[], defSide: CardType[], burrows: number[] } => {
    const listenInd = enBurrower[0];
    oppSide[defIndex] = { ...oppSide[listenInd] };
    oppSide[listenInd] = EMPTY_CARD;
    debugger
    if (oppSide[defIndex].def < tempSide[atkIndex].atk) //TODO i'm assuming he will die
      enBurrower.shift();
    else
      enBurrower[0] = defIndex; //update value
    debugger
    let { def: defender, dannoRifl } = onAtk(tempSide[atkIndex].atk, oppSide[defIndex], defIndex, sigils);
    oppSide[defIndex] = defender;
    if (dannoRifl > 0) {
      let { def: attacker, dannoRifl: _danno } = onAtk(dannoRifl, tempSide[atkIndex], atkIndex, sigils, true);
      tempSide[atkIndex] = attacker;
    }
    return { atkSide: tempSide, defSide: oppSide, burrows: enBurrower }
  }

  const BattlePhase = (P1attack: boolean) => {
    let tempSide: CardType[] = P1attack ? [...fieldCards.P1side] : [...fieldCards.P2side]; //attacker
    let oppSide: CardType[] = P1attack ? [...fieldCards.P2side] : [...fieldCards.P1side]; //defender

    const sigils: battleSigils = checkSigilList(tempSide, oppSide);

    tempSide.forEach((c: CardType, s: number) => {
      if (c.atk) {
        if (sigils.atkSig.length > 0 && sigils.atkSig.includes(s)) {
          //uniche possibilità: [sniper, 2, 3, sniper-fly, 2-fly, 3-fly]
          const sniper = c.sigils?.includes(503);
          const triple = c.sigils?.includes(501);
          const double = triple || c.sigils?.includes(500);
          const fly = c.sigils?.includes(502);

          if (sniper) {
            const sniperIndex = 3 //TODO scelta indice
            if (
              (fly && !(oppSide[sniperIndex].sigils?.includes(600))) ||
              oppSide[sniperIndex].sigils?.includes(640)
            ) //fly && no blockFly, submerged enemy
              directAtk((P1attack ? 1 : -1), c.atk, c.name, dispatch);
            else if (oppSide[sniperIndex].cardID === -1) {
              if (sigils.enBurrower?.length > 0) {
                const { atkSide, defSide, burrows } = burrowerMove(sigils.enBurrower, s, sniperIndex, tempSide, oppSide, sigils)
                tempSide = [ ...atkSide ]; oppSide = [ ...defSide ]; sigils.enBurrower = [...burrows];
                debugger
              }
              else
                directAtk((P1attack ? 1 : -1), c.atk, c.name, dispatch);
            }
            else {
              //todo case 991
              let { def: defender, dannoRifl } = onAtk(c.atk, oppSide[sniperIndex], sniperIndex, sigils);
              oppSide[sniperIndex] = defender;
              if (dannoRifl > 0) {
                let { def: attacker, dannoRifl: _danno } = onAtk(dannoRifl, c, s, sigils, true);
                tempSide[s] = attacker;
              }
            }
          }
          if (double) {
            if (s > 0) {
              if (
                (fly && !(oppSide[s - 1].sigils?.includes(600))) ||
                oppSide[s - 1].sigils?.includes(640)
              ) //fly && no blockFly, submerged enemy
                directAtk((P1attack ? 1 : -1), c.atk, c.name, dispatch);
              else if (oppSide[s - 1].cardID === -1) {
                if (sigils.enBurrower?.length > 0) { //burrower
                  const { atkSide, defSide, burrows } = burrowerMove(sigils.enBurrower, s, s-1, tempSide, oppSide, sigils)
                  tempSide = [ ...atkSide ]; oppSide = [ ...defSide ]; sigils.enBurrower = [...burrows];
                }
                else
                  directAtk((P1attack ? 1 : -1), c.atk, c.name, dispatch);
              }
              else {
                let { def: defender, dannoRifl } = onAtk(c.atk, oppSide[s - 1], s - 1, sigils);
                oppSide[s - 1] = defender;
                if (dannoRifl > 0) {
                  let { def: attacker, dannoRifl: _danno } = onAtk(dannoRifl, c, s, sigils, true);
                  tempSide[s] = attacker;
                }
              }
            }
            if (triple && tempSide[s].def > 0) {
              if (
                (fly && !(oppSide[s].sigils?.includes(600))) ||
                oppSide[s].sigils?.includes(640)
              ) //fly && no blockFly, submerged enemy
                directAtk((P1attack ? 1 : -1), c.atk, c.name, dispatch);
              else if (oppSide[s].cardID === -1) {
                if (sigils.enBurrower?.length > 0) { //burrower
                  const { atkSide, defSide, burrows } = burrowerMove(sigils.enBurrower, s, s, tempSide, oppSide, sigils)
                  tempSide = [ ...atkSide ]; oppSide = [ ...defSide ]; sigils.enBurrower = [...burrows];
                }
                else
                  directAtk((P1attack ? 1 : -1), c.atk, c.name, dispatch);
              }
              else {
                let { def: defender, dannoRifl } = onAtk(c.atk, oppSide[s], s, sigils);
                oppSide[s] = defender;
                if (dannoRifl > 0) {
                  let { def: attacker, dannoRifl: _danno } = onAtk(dannoRifl, c, s, sigils, true);
                  tempSide[s] = attacker;
                }
              }
            }
            if (s < 4 && tempSide[s].def > 0) {
              if (
                (fly && !(oppSide[s + 1].sigils?.includes(600))) ||
                oppSide[s + 1].sigils?.includes(640)
              ) //fly && no blockFly, submerged enemy
                directAtk((P1attack ? 1 : -1), c.atk, c.name, dispatch);
              else if (oppSide[s + 1].cardID === -1) {
                if (sigils.enBurrower?.length > 0) { //burrower
                  const { atkSide, defSide, burrows } = burrowerMove(sigils.enBurrower, s, s+1, tempSide, oppSide, sigils)
                  tempSide = [ ...atkSide ]; oppSide = [ ...defSide ]; sigils.enBurrower = [...burrows];
                }
                else
                  directAtk((P1attack ? 1 : -1), c.atk, c.name, dispatch);
              }
              else {
                let { def: defender, dannoRifl } = onAtk(c.atk, oppSide[s + 1], s + 1, sigils);
                oppSide[s + 1] = defender;
                if (dannoRifl > 0) {
                  let { def: attacker, dannoRifl: _danno } = onAtk(dannoRifl, c, s, sigils, true);
                  tempSide[s] = attacker;
                }
              }
            }
          }
        }
        else if (oppSide[s].sigils?.includes(640))
          directAtk((P1attack ? 1 : -1), c.atk, c.name, dispatch);
        else if (oppSide[s].cardID === -1) {
          if (sigils.enBurrower?.length > 0) { //burrower
            const { atkSide, defSide, burrows } = burrowerMove(sigils.enBurrower, s, s, tempSide, oppSide, sigils)
            tempSide = [ ...atkSide ]; oppSide = [ ...defSide ]; sigils.enBurrower = [...burrows];
          }
          else
            directAtk((P1attack ? 1 : -1), c.atk, c.name, dispatch);
        }
        else { //normal atk
          let { def: defender, dannoRifl } = onAtk(c.atk, oppSide[s], s, sigils);
          oppSide[s] = defender;
          if (dannoRifl > 0) {
            let { def: attacker, dannoRifl: _danno } = onAtk(dannoRifl, c, s, sigils, true);
            tempSide[s] = attacker;
          }
        }
      }
    })

    return {
      P1side: P1attack ? tempSide : oppSide,
      P2side: P1attack ? oppSide : tempSide
    }
  };

  const TurnOverAndEvolvePhase = (field: Field, P1attack: boolean) => {
    const turnOverSig: number[] = [];
    const evolveSig: number[] = [];
    let tempSide = P1attack ? [...field.P1side] : [...field.P2side]; //finishing turn
    let oppSide = P1attack ? [...field.P2side] : [...field.P1side]; //uccido/evolvo già le creature

    tempSide.forEach((c: CardType, index: number) => {
      if (c.sigils?.find((s) => 39 < (s % 100) && (s % 100) < 50)) //40 turn over
        turnOverSig.push(index);
    });
    oppSide.forEach((c: CardType, index: number) => {
      if (c.sigils?.find((s) => 299 < s && s < 500)) //3/400 evolve
        evolveSig.push(index);
      if (c.sigils?.find((s) => s === 640)) //rimuovi water
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
          tempSide[s] = { ...tempSide[s], name: tempSide[s].name + '_sub' };
      })
    }

    if (evolveSig.length > 0)
      evolveSig.forEach((s) => {
        if (oppSide[s].sigils?.includes(402)) { //fragile
          P1attack ? dispatch(addP2bones(oppSide[s].dropBones)) : dispatch(addP1bones(oppSide[s].dropBones));
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
          //TODO controlla se c'è un totem e riassegnalo all'evoluzione const sigilWithFamily=evol.into.sigils.push(rules...)
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
          else {
            oppSide[s] = {
              ...oppSide[s],
              name: tempSide[s].name + '_elder',
              atk: tempSide[s].atk + 1,
              def: tempSide[s].def + 1
            };
          }
        }
        if (oppSide[s].sigils?.includes(640)) //water
          oppSide[s] = { ...oppSide[s], name: oppSide[s].name.split('_sub')[0] }; //riemerge
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
