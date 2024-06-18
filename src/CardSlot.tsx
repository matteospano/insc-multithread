import React, { useEffect, useState } from "react";
import "./css/Card.scss";
import { useAppSelector } from "./hooks.ts";
import {
  CardType,
  Field,
  addP1bones, addP2bones,
  setDeleteCardHand,
  setWarning, updateField, updateSacrificeCount
} from "./cardReducer.tsx";
import { useAppDispatch } from "./hooks.ts";
import RenderCardSigils from "./RenderCardSigils.tsx";
import { bell, egg, EMPTY_CARD } from "./utilCards.tsx";
import RemoveCardEffects from "./RemoveCardEffects.tsx";

export default function CardSlot(props: {
  owner: number, index: number
}): JSX.Element {
  const { owner, index } = props;
  const P1Owner: boolean = (owner === 1);
  const dispatch = useAppDispatch();
  const currPlayer: number = useAppSelector((state) => state.card.currPlayer);
  const dragCard = useAppSelector((state) => state.card.dragCardInfo);
  const pendingSacr = useAppSelector((state) => state.card.pendingSacr);
  const myBones = useAppSelector((state) => P1Owner ? state.card.P1Bones : state.card.P2Bones);

  const fieldCards: Field = useAppSelector((state) => state.card.fieldCards);
  const mySide = P1Owner ? fieldCards.P1side : fieldCards.P2side;
  const avvSide = P1Owner ? fieldCards.P2side : fieldCards.P1side;
  const hammer = useAppSelector((state) => state.card.hammer);
  const useBelts: boolean = useAppSelector((state) => state.card.rules.useBelts);

  const [currCard, setCurrCard] = useState<CardType>(mySide[index]);
  const [show, setShow] = useState<boolean>(currCard?.name?.length > 0);
  const empty_slot: string = useBelts ?
    (P1Owner && index === 0 ? "belt-shape-turn" :
      !P1Owner && index === 4 ? "belt-shape-turn-flipped" :
        P1Owner ? "belt-shape-str-flipped" : "belt-shape-str")
    : "empty-slot-shape";

  useEffect(() => {
    //reset pending selections during battlePhase
    if (currPlayer === 0 && mySide[index].selected) {
      dispatch(updateSacrificeCount(0))
    }
  }, [currPlayer]);

  useEffect(() => {
    //update during battlePhase
    setCurrCard(mySide[index]);
    setShow(mySide[index].name?.length > 0);
  }, [mySide]);

  useEffect(() => {
    if (!pendingSacr && mySide.find((c: CardType) => c.selected)) {
      let tempSide: CardType[] = [...mySide].map((card): CardType =>
        card.selected ? { ...card, selected: false } : card); //deselect all
      dispatch(updateField({
        P1side: P1Owner ? tempSide : fieldCards.P1side,
        P2side: P1Owner ? fieldCards.P2side : tempSide
      }));
    }
  }, [pendingSacr]);

  const onSpawn = (card: CardType): Field => {
    dispatch(setDeleteCardHand(card.cardID));
    card = { ...card, selected: false, cardID: index + (P1Owner ? 100 : 200) };
    setCurrCard(card);
    dispatch(updateSacrificeCount(0));

    let apples: number = 0;
    [...mySide].forEach((card) => {
      if (card.selected && card?.sigils?.includes(700)) //700='apple'
        apples += + card.def
    });

    let tempSide: CardType[] = [...mySide].map((card): CardType =>
      card.selected ? onSacrifice(card) : card);
    if (apples)
      card = {
        ...card,
        def: card.def + Math.floor(apples * 2 / 3)
      };
    if (tempSide.find((c) => c.sigils?.includes(150) && //150 = 'leader'
      (c.cardID === card.cardID - 1 || c.cardID === card.cardID + 1)))
      card = {
        ...card,
        atk: card.atk + 1
      };
    if (avvSide[index].sigils?.includes(170)) // 170 = 'alarm'
      card = {
        ...card,
        atk: card.atk + 1
      };

    if (avvSide[index].sigils?.includes(171)) // 171 = 'smell'
      card = {
        ...card,
        atk: card.atk - 1
      };

    tempSide[index] = card;
    let oppField = [...avvSide];

    if (card.sigils?.find((s) => s < 200)) { //0/1 spawn
      const advPosId = P1Owner ? 200 + index : 100 + index;

      if (card.sigils?.includes(1) && oppField[index].cardID === -1) //1='egg'       
        oppField[index] = { ...egg, cardID: advPosId };

      if (card.sigils?.includes(100)) { //bells
        if (index > 0)
          if (tempSide[index - 1].cardID === -1)
            tempSide[index - 1] = { ...bell, cardID: card.cardID - 1 };
        if (index < 4)
          if (tempSide[index + 1].cardID === -1)
            tempSide[index + 1] = { ...bell, cardID: card.cardID + 1 };
        //todo bells ondeath libera il campo dalle 2 bell
      }

      if (card.sigils?.includes(170)) //alarm
        oppField[index] = { ...oppField[index], atk: oppField[index].atk + 1 };
      //todo riapplica l'effetto onEnemy spawn e annullalo on death e on sacr
      if (card.sigils?.includes(171)) //smell
        oppField[index] = { ...oppField[index], atk: oppField[index].atk + -1 };
      //todo riapplica l'effetto onEnemy spawn e annullalo on death e on sacr

      if (card.sigils?.includes(150)) { //leader
        if (index > 0)
          if (tempSide[index - 1].cardID !== -1)
            tempSide[index - 1] = { ...tempSide[index - 1], atk: tempSide[index - 1].atk + 1 };
        if (index < 4)
          if (tempSide[index + 1].cardID !== -1)
            tempSide[index + 1] = { ...tempSide[index + 1], atk: tempSide[index + 1].atk + 1 };
        //todo riapplica l'effetto onFriend spawn e annullalo on death e on sacr
      }
    }
    return {
      P1side: P1Owner ? [...tempSide] : [...oppField],
      P2side: P1Owner ? [...oppField] : [...tempSide]
    };
  }

  const onSacrifice = (card: CardType) => {
    if (card?.sigils?.includes(704)) //704='cat'
      return { ...card, selected: false }
    currPlayer === 1 ? dispatch(addP1bones(card.dropBones)) : dispatch(addP2bones(card.dropBones));
    RemoveCardEffects(card, mySide, avvSide, -1);
    return (EMPTY_CARD);
  }

  const destroyCard = () => {
    RemoveCardEffects(mySide[index], mySide, avvSide, -2);
  }

  const handleDrop = () => {
    if (dragCard.sacr > pendingSacr)
      dispatch(setWarning({
        message: 'sacrifices_needed',
        subject: 'Player' + currPlayer.toString(),
        severity: 'warning',
        props: dragCard.name
      }))
    else if ((dragCard?.bone || 0) > myBones)
      dispatch(setWarning({
        message: 'bones_needed',
        subject: 'Player' + currPlayer.toString(),
        severity: 'warning',
        props: dragCard.name
      }))
    else {
      const newField = onSpawn(dragCard); //replace this card
      dispatch(updateField(newField));
    }
  }

  const validateSelection = () => {
    if (currPlayer === owner && currCard.name) {
      if (hammer) { //click con martello svuota slot, non applica effetti OnDeath
        destroyCard();
      }
      else if (currCard.dropBlood >= 0) {
        let tempSide: CardType[] = [...mySide];
        const tempSacr = pendingSacr;
        if (currCard.selected) {
          tempSide[index] = { ...tempSide[index], selected: false };
          dispatch(setWarning({
            message: 'sacrifices',
            subject: 'Player' + currPlayer.toString(),
            severity: tempSacr - currCard.dropBlood <= 0 ? 'close' : 'action'
          }))
          dispatch(updateSacrificeCount(-currCard.dropBlood))
        }
        else {
          tempSide[index] = { ...tempSide[index], selected: true };
          dispatch(setWarning({
            message: 'sacrifices',
            subject: 'Player' + currPlayer.toString(),
            severity: tempSacr + currCard.dropBlood <= 0 ? 'close' : 'action'
          }))
          dispatch(updateSacrificeCount(currCard.dropBlood))
        }
        dispatch(updateField({
          P1side: P1Owner ? tempSide : avvSide,
          P2side: P1Owner ? avvSide : tempSide
        }));
      }
    }
  }

  return (
    <div
      className={(show ? (currCard.dropBlood < 0 ? "rock-shape" : "card-shape") : empty_slot) +
        (currPlayer === owner ? " has-hover" : "") +
        (currCard.selected ? " selected" : "")}
      onClick={dragCard?.name ? handleDrop : validateSelection}>
      {show && <>
        <div className="mt-01">{currCard.name}</div>
        {RenderCardSigils({ cardInfo: currCard, show })}
        <span className="card-atk-def">
          <div>{!currCard.name?.includes('_sub') && currCard.atk > 0 && currCard.atk || ' '}</div>
          <div>{!currCard.name?.includes('_sub') && currCard.def}</div>
        </span>
      </>}
    </div>
  );
}
