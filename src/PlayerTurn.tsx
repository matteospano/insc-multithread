import React, { useEffect, useState } from "react";
import {
  Field, setCurrPlayer, setHammer, updateP1draw, updateP2draw,
  addP1bones, addP2bones, increaseP1Live, updateField,
  CardType,
  setWarning,
  setCurrPhase,
  drawnHand,
  deleteHand
} from "./cardReducer.tsx";
import { useAppSelector, useAppDispatch } from "./hooks.ts";
import { handleClock } from "./utils.tsx";
import { Button } from "primereact/button";
import evolutions from './const/evolutions.json';
import { Evolution } from "./Main.tsx";
import './css/PlayerTurn.scss'
import { EMPTY_CARD } from "./utilCards.tsx";

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
  const handCards = useAppSelector((state) => state.card.handCards);

  useEffect(() => {
    if (currPhase === 11 || currPhase === 21) {
      const nextPlayer = currPhase === 11 ? 1 : 2;
      currPhase === 11 && dispatch(updateP1draw(true));
      currPhase === 21 && rules.isMultiplayer === 0 && dispatch(updateP2draw(true));
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
      if (c.sigils?.find((s) => 499 < s && s < 504)) //500 atk
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
        if (atk < defender.def) {
          defender = { ...defender, def: defender.def - atk }
          if (defender.sigils?.includes(601)) {//ice
            //debugger
            return { def: onEvolve(defender), dannoRifl: -1 }
          }
          else
            return { def: defender, dannoRifl: -1 }
        }
        else {
          const { card, effect } = onDeath(defender, riflesso ? sigils.deathSig : sigils.enDeathSig)
          return { def: card, dannoRifl: defender.sigils.includes(603) ? 1 : effect } //spikes 
        }
      }
    }
    else {
      if (atk < defender.def)
        return { def: { ...defender, def: defender.def - atk }, dannoRifl: -1 }
      else {
        const { card, effect } = onDeath(defender, riflesso ? sigils.deathSig : sigils.enDeathSig)
        return { def: card, dannoRifl: effect }
      }
    }
  }

  const onDeath = (card: CardType, sigils: number[]): { card: CardType, effect: number } => {
    //TODO rimuovi effetti di: bells,leader,alarm
    //TODO: applica: snakeBomb,tail

    //             dispatch(setWarning({
    //               message: 'dies',
    //               subject: card.name,
    //               severity: 'info',
    //               expire: 1500
    //             }));
    console.log('dies ', card.name);
    card.cardID < 200 ? dispatch(addP1bones(card.dropBones))
      : dispatch(addP2bones(card.dropBones));

    if (card.sigils?.includes(203)) { //immortal non droppa ossa
      const isP1Owner = card.cardID < 200;
      const cardCopy = card; //TODO ricerca la carta con le stats pulite da un elenco, aggiungi i totem
      dispatch(drawnHand({ isP1Owner, drawnCard: cardCopy }));
      return { card: EMPTY_CARD, effect: -1 }
    }
    if (card.sigils?.includes(208)) //trap non droppa ossa
      return { card: EMPTY_CARD, effect: -10 }
    if (card.sigils?.includes(201) || card.sigils?.includes(300)) //bomb || dinamite non droppano ossa
      return { card: EMPTY_CARD, effect: -11 }

    return { card: EMPTY_CARD, effect: -1 }
  }

  const addBones = (card: CardType): CardType => {
    console.log('dies ', card.name);
    card.cardID < 200 ? dispatch(addP1bones(card.dropBones)) : dispatch(addP2bones(card.dropBones));
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
    oppSide[listenInd] = EMPTY_CARD; //si è spostata su defInd
    //todo sullo spostamento vengono ricalcolati effetti di smell,leader...
    //removeCardEffects(oppSide[defIndex], oppSide, tempSide, listenInd, dispatch);

    if (oppSide[defIndex].def < tempSide[atkIndex].atk) //TODO i'm assuming he will die
      enBurrower.shift();
    else
      enBurrower[0] = defIndex; //update value
    let { def: defender, dannoRifl } = onAtk(tempSide[atkIndex].atk, oppSide[defIndex], defIndex, sigils);
    oppSide[defIndex] = defender;
    if (dannoRifl > 0) {
      let { def: attacker, dannoRifl: _danno } = onAtk(dannoRifl, tempSide[atkIndex], atkIndex, sigils, true);
      tempSide[atkIndex] = attacker;
    }
    else if (tempSide[atkIndex].sigils?.includes(504) && dannoRifl === -1) //il defender non aveva scudo
      tempSide[atkIndex] = { ...tempSide[atkIndex], def: tempSide[atkIndex].def + 1 }
    else if (dannoRifl < -9) { //il defender era una bomba, dinamite o trappola
      if (dannoRifl === -11 && defIndex > 0 && oppSide[defIndex - 1].cardID !== -1) {
        const sigils = oppSide[defIndex - 1].sigils || [];
        if (sigils.includes(604)) { //shield
          const noShield = [...sigils].filter((s) => s !== 604);
          oppSide[defIndex - 1] = { ...oppSide[defIndex - 1], sigils: noShield }
        }
        else
          oppSide[defIndex - 1] = addBones(oppSide[defIndex - 1]);
      }

      const sigils = tempSide[defIndex].sigils || [];
      if (sigils.includes(604)) { //shield
        const noShield = [...sigils].filter((s) => s !== 604);
        tempSide[defIndex] = { ...tempSide[defIndex], sigils: noShield }
      }
      else
        tempSide[defIndex] = addBones(tempSide[defIndex]);

      if (dannoRifl === -11 && defIndex < 4 && oppSide[defIndex + 1].cardID !== -1) {
        const sigils = oppSide[defIndex + 1].sigils || [];
        if (sigils.includes(604)) { //shield
          const noShield = [...sigils].filter((s) => s !== 604);
          oppSide[defIndex + 1] = { ...oppSide[defIndex + 1], sigils: noShield }
        }
        else
          oppSide[defIndex + 1] = addBones(oppSide[defIndex + 1]);
      }
    }
    tempSide[atkIndex] = { ...tempSide[atkIndex], def: tempSide[atkIndex].def + 1 }
    return { atkSide: tempSide, defSide: oppSide, burrows: enBurrower }
  }

  const onEvolve = (young: CardType): CardType => {
    const evol = (evolutions as Evolution[]).find((ev) => ev.cardName.split('_')[0] === young.name); //ignora attributi _sub,_elder
    //TODO controlla se c'è un totem e riassegnalo all'evoluzione const sigilWithFamily=evol.into.sigils.push(rules...)
    if (evol) {
      if (young.name === 'raven egg') {
        const noRaven = Math.random() < 0.5;
        if (noRaven)
          evol.into = {
            ...young,
            name: 'broken egg',
            sigils: undefined
          }
      }

      dispatch(setWarning({
        message: 'evolves',
        subject: young.name,
        props: evol.into.name,
        severity: 'info',
        expire: 1500
      }));
      return {
        ...evol.into,
        cardID: young.cardID,
        atk: young.atk + evol.into.atk,
        def: young.def + evol.into.def,
      };
    }
    else {
      return {
        ...young,
        name: young.name + '_elder',
        atk: young.atk + 1,
        def: young.def + 1
      };
    }
  }

  const BattlePhase = (P1attack: boolean) => {
    let tempSide: CardType[] = P1attack ? [...fieldCards.P1side] : [...fieldCards.P2side]; //attacker
    let oppSide: CardType[] = P1attack ? [...fieldCards.P2side] : [...fieldCards.P1side]; //defender

    const sigils: battleSigils = checkSigilList(tempSide, oppSide);

    tempSide.forEach((c: CardType, s: number) => {
      if (c.atk) {
        if (sigils.atkSig.length > 0 && sigils.atkSig.includes(s)) {
          //uniche possibilità: [sniper, 2, 3, sniper-fly, 2-fly, 3-fly] con o senza vampire
          const sniper = c.sigils?.includes(503);
          const triple = c.sigils?.includes(501);
          const double = triple || c.sigils?.includes(500);
          const fly = c.sigils?.includes(502);

          if (double) {
            if (s > 0) {
              if (
                (fly && !(oppSide[s - 1].sigils?.includes(600))) ||
                oppSide[s - 1].sigils?.includes(640)
              ) //fly && no blockFly, submerged enemy
                directAtk((P1attack ? 1 : -1), c.atk, c.name, dispatch);
              else if (oppSide[s - 1].cardID === -1) {
                if (sigils.enBurrower?.length > 0) { //burrower
                  const { atkSide, defSide, burrows } = burrowerMove(sigils.enBurrower, s, s - 1, tempSide, oppSide, sigils)
                  tempSide = [...atkSide]; oppSide = [...defSide]; sigils.enBurrower = [...burrows];
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
                else if (tempSide[s].sigils?.includes(504) && dannoRifl === -1) //il defender non aveva scudo
                  tempSide[s] = { ...tempSide[s], def: tempSide[s].def + 1 }
                else if (dannoRifl < -9) { //il defender era una bomba, dinamite o trappola
                  const centralInd = s - 1;
                  if (dannoRifl === -11 && centralInd > 0 && oppSide[centralInd - 1].cardID !== -1) {
                    const sigils = oppSide[centralInd - 1].sigils || [];
                    if (sigils.includes(604)) { //shield
                      const noShield = [...sigils].filter((s) => s !== 604);
                      oppSide[centralInd - 1] = { ...oppSide[centralInd - 1], sigils: noShield }
                    }
                    else
                      oppSide[centralInd - 1] = addBones(oppSide[centralInd - 1]);
                  }

                  const sigils = tempSide[centralInd].sigils || [];
                  if (sigils.includes(604)) { //shield
                    const noShield = [...sigils].filter((s) => s !== 604);
                    tempSide[centralInd] = { ...tempSide[centralInd], sigils: noShield }
                  }
                  else
                    tempSide[centralInd] = addBones(tempSide[centralInd]);

                  if (dannoRifl === -11 && centralInd < 4 && oppSide[centralInd + 1].cardID !== -1) {
                    const sigils = oppSide[centralInd + 1].sigils || [];
                    if (sigils.includes(604)) { //shield
                      const noShield = [...sigils].filter((s) => s !== 604);
                      oppSide[centralInd + 1] = { ...oppSide[centralInd + 1], sigils: noShield }
                    }
                    else
                      oppSide[centralInd + 1] = addBones(oppSide[centralInd + 1]);
                  }
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
                  tempSide = [...atkSide]; oppSide = [...defSide]; sigils.enBurrower = [...burrows];
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
                else if (tempSide[s].sigils?.includes(504) && dannoRifl === -1) //il defender non aveva scudo
                  tempSide[s] = { ...tempSide[s], def: tempSide[s].def + 1 }
                else if (dannoRifl < -9) { //il defender era una bomba, dinamite o trappola
                  if (dannoRifl === -11 && s > 0 && oppSide[s - 1].cardID !== -1) {
                    const sigils = oppSide[s - 1].sigils || [];
                    if (sigils.includes(604)) { //shield
                      const noShield = [...sigils].filter((s) => s !== 604);
                      oppSide[s - 1] = { ...oppSide[s - 1], sigils: noShield }
                    }
                    else
                      oppSide[s - 1] = addBones(oppSide[s - 1]);
                  }

                  const sigils = tempSide[s].sigils || [];
                  if (sigils.includes(604)) { //shield
                    const noShield = [...sigils].filter((s) => s !== 604);
                    tempSide[s] = { ...tempSide[s], sigils: noShield }
                  }
                  else
                    tempSide[s] = addBones(tempSide[s]);

                  if (dannoRifl === -11 && s < 4 && oppSide[s + 1].cardID !== -1) {
                    const sigils = oppSide[s + 1].sigils || [];
                    if (sigils.includes(604)) { //shield
                      const noShield = [...sigils].filter((s) => s !== 604);
                      oppSide[s + 1] = { ...oppSide[s + 1], sigils: noShield }
                    }
                    else
                      oppSide[s + 1] = addBones(oppSide[s + 1]);
                  }
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
                  const { atkSide, defSide, burrows } = burrowerMove(sigils.enBurrower, s, s + 1, tempSide, oppSide, sigils)
                  tempSide = [...atkSide]; oppSide = [...defSide]; sigils.enBurrower = [...burrows];
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
                else if (tempSide[s].sigils?.includes(504) && dannoRifl === -1) //il defender non aveva scudo
                  tempSide[s] = { ...tempSide[s], def: tempSide[s].def + 1 }
                else if (dannoRifl < -9) { //il defender era una bomba, dinamite o trappola
                  const centralInd = s + 1;
                  if (dannoRifl === -11 && centralInd > 0 && oppSide[centralInd - 1].cardID !== -1) {
                    const sigils = oppSide[centralInd - 1].sigils || [];
                    if (sigils.includes(604)) { //shield
                      const noShield = [...sigils].filter((s) => s !== 604);
                      oppSide[centralInd - 1] = { ...oppSide[centralInd - 1], sigils: noShield }
                    }
                    else
                      oppSide[centralInd - 1] = addBones(oppSide[centralInd - 1]);
                  }

                  const sigils = tempSide[centralInd].sigils || [];
                  if (sigils.includes(604)) { //shield
                    const noShield = [...sigils].filter((s) => s !== 604);
                    tempSide[centralInd] = { ...tempSide[centralInd], sigils: noShield }
                  }
                  else
                    tempSide[centralInd] = addBones(tempSide[centralInd]);

                  if (dannoRifl === -11 && centralInd < 4 && oppSide[centralInd + 1].cardID !== -1) {
                    const sigils = oppSide[centralInd + 1].sigils || [];
                    if (sigils.includes(604)) { //shield
                      const noShield = [...sigils].filter((s) => s !== 604);
                      oppSide[centralInd + 1] = { ...oppSide[centralInd + 1], sigils: noShield }
                    }
                    else
                      oppSide[centralInd + 1] = addBones(oppSide[centralInd + 1]);
                  }
                }
              }
            }
          }
          else { //fly con o senza sniper
            const sniperIndex = sniper ? 0 : s //TODO scelta indice(cambia solo 0, s è giusto)
            if (
              (fly && !(oppSide[sniperIndex].sigils?.includes(600))) ||
              oppSide[sniperIndex].sigils?.includes(640)
            ) //fly && no blockFly, submerged enemy
              directAtk((P1attack ? 1 : -1), c.atk, c.name, dispatch);
            else if (oppSide[sniperIndex].cardID === -1) {
              if (sigils.enBurrower?.length > 0) {
                const { atkSide, defSide, burrows } = burrowerMove(sigils.enBurrower, s, sniperIndex, tempSide, oppSide, sigils)
                tempSide = [...atkSide]; oppSide = [...defSide]; sigils.enBurrower = [...burrows];
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
              else if (tempSide[s].sigils?.includes(504) && dannoRifl === -1) //il defender non aveva scudo
                tempSide[s] = { ...tempSide[s], def: tempSide[s].def + 1 }
              else if (dannoRifl < -9) { //il defender era una bomba, dinamite o trappola
                if (dannoRifl === -11 && sniperIndex > 0 && oppSide[sniperIndex - 1].cardID !== -1) {
                  const sigils = oppSide[sniperIndex - 1].sigils || [];
                  if (sigils.includes(604)) { //shield
                    const noShield = [...sigils].filter((s) => s !== 604);
                    oppSide[sniperIndex - 1] = { ...oppSide[sniperIndex - 1], sigils: noShield }
                  }
                  else
                    oppSide[sniperIndex - 1] = addBones(oppSide[sniperIndex - 1]);
                }

                const sigils = tempSide[sniperIndex].sigils || [];
                if (sigils.includes(604)) { //shield
                  const noShield = [...sigils].filter((s) => s !== 604);
                  tempSide[sniperIndex] = { ...tempSide[sniperIndex], sigils: noShield }
                }
                else
                  tempSide[sniperIndex] = addBones(tempSide[sniperIndex]);
                if (dannoRifl === -11 && sniperIndex < 4 && oppSide[sniperIndex + 1].cardID !== -1) {
                  const sigils = oppSide[sniperIndex + 1].sigils || [];
                  if (sigils.includes(604)) { //shield
                    const noShield = [...sigils].filter((s) => s !== 604);
                    oppSide[sniperIndex + 1] = { ...oppSide[sniperIndex + 1], sigils: noShield }
                  }
                  else
                    oppSide[sniperIndex + 1] = addBones(oppSide[sniperIndex + 1]);
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
            tempSide = [...atkSide]; oppSide = [...defSide]; sigils.enBurrower = [...burrows];
          }
          else
            directAtk((P1attack ? 1 : -1), c.atk, c.name, dispatch);
        }
        else { //normal atk con o senza vampire
          let { def: defender, dannoRifl } = onAtk(c.atk, oppSide[s], s, sigils);
          oppSide[s] = defender;
          if (dannoRifl > 0) {
            let { def: attacker, dannoRifl: _danno } = onAtk(dannoRifl, c, s, sigils, true);
            tempSide[s] = attacker;
          }
          else if (tempSide[s].sigils?.includes(504) && dannoRifl === -1) //il defender non aveva scudo
            tempSide[s] = { ...tempSide[s], def: tempSide[s].def + 1 }
          else if (dannoRifl < -9) { //il defender era una bomba, dinamite o trappola
            if (dannoRifl === -11 && s > 0 && oppSide[s - 1].cardID !== -1) {
              const sigils = oppSide[s - 1].sigils || [];
              if (sigils.includes(604)) { //shield
                const noShield = [...sigils].filter((s) => s !== 604);
                oppSide[s - 1] = { ...oppSide[s - 1], sigils: noShield }
              }
              else
                oppSide[s - 1] = addBones(oppSide[s - 1]);
            }

            const sigils = tempSide[s].sigils || [];
            if (sigils.includes(604)) { //shield
              const noShield = [...sigils].filter((s) => s !== 604);
              tempSide[s] = { ...tempSide[s], sigils: noShield }
            }
            else
              tempSide[s] = addBones(tempSide[s]);

            if (dannoRifl === -11 && s < 4 && oppSide[s + 1].cardID !== -1) {
              const sigils = oppSide[s + 1].sigils || [];
              if (sigils.includes(604)) { //shield
                const noShield = [...sigils].filter((s) => s !== 604);
                oppSide[s + 1] = { ...oppSide[s + 1], sigils: noShield }
              }
              else
                oppSide[s + 1] = addBones(oppSide[s + 1]);
            }
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
          //todo sullo spostamento vengono ricalcolati effetti di smell,leader...
          //removeCardEffects(tempSide[s + 1], tempSide, oppSide, s, dispatch);
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
          oppSide[s] = addBones(oppSide[s]);
        }
        if (oppSide[s].sigils?.includes(401)) { //evolve
          oppSide[s] = onEvolve(oppSide[s]);
        }
        if (oppSide[s].sigils?.includes(640)) //water
          oppSide[s] = { ...oppSide[s], name: oppSide[s].name.split('_sub')[0] }; //riemerge

        if (oppSide[s].sigils?.includes(300)) {//dinamite
          if (s > 0 && oppSide[s - 1].cardID !== -1) {
            const sigils = oppSide[s - 1].sigils || [];
            if (sigils.includes(604)) { //shield
              const noShield = [...sigils].filter((s) => s !== 604);
              oppSide[s - 1] = { ...oppSide[s - 1], sigils: noShield }
            }
            else
              oppSide[s - 1] = addBones(oppSide[s - 1]);
          }

          const sigils = tempSide[s].sigils || [];
          if (sigils.includes(604)) { //shield
            const noShield = [...sigils].filter((s) => s !== 604);
            tempSide[s] = { ...tempSide[s], sigils: noShield }
          }
          else
            tempSide[s] = addBones(tempSide[s]);
          const sigilsDef = oppSide[s].sigils || [];
          if (sigilsDef.includes(604)) { //shield
            const noShield = [...sigils].filter((s) => s !== 604);
            oppSide[s] = { ...oppSide[s], sigils: noShield }
          }
          else
            oppSide[s] = addBones(oppSide[s]);

          if (s < 4 && oppSide[s + 1].cardID !== -1) {
            const sigils = oppSide[s + 1].sigils || [];
            if (sigils.includes(604)) { //shield
              const noShield = [...sigils].filter((s) => s !== 604);
              oppSide[s + 1] = { ...oppSide[s + 1], sigils: noShield }
            }
            else
              oppSide[s + 1] = addBones(oppSide[s + 1]);
          }
        }
      })
    /* dinamite in mano */
    const oppHand = P1attack ? handCards.P2side : handCards.P1side;
    const tntInd = oppHand.find(h => h.name === 'dinamite')?.cardID;
    if (tntInd) {
      dispatch(deleteHand({ isP1Owner: !P1attack, deleteCardHandID: tntInd - 1 }));
      dispatch(deleteHand({ isP1Owner: !P1attack, deleteCardHandID: tntInd }));
      dispatch(deleteHand({ isP1Owner: !P1attack, deleteCardHandID: tntInd + 1 }));
      dispatch(increaseP1Live(P1attack ? 1 : -1));
    }

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
