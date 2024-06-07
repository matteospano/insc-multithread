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
//import { Container } from "react-smooth-dnd";
import { useAppDispatch } from "./hooks.ts";
import RenderCardSigils from "./RenderCardSigils.tsx";
import { egg, EMPTY_CARD } from "./utilCards.tsx";

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
    if (owner === 1) {
      //debugger
      setCurrCard(fieldCards.P1side[index]);
      setShow(fieldCards.P1side[index].name?.length > 0);
    }
  }, [fieldCards.P1side]);
  useEffect(() => {
    //update during battlePhase
    if (owner === 2) {
      //debugger
      setCurrCard(fieldCards.P2side[index]);
      setShow(fieldCards.P2side[index].name?.length > 0);
    }
  }, [fieldCards.P2side]);

  useEffect(() => {
    if (!pendingSacr) {
      let tempSide: CardType[] = [...mySide].map((card): CardType =>
        card.selected ? { ...card, selected: false } : card); //deselect all
      dispatch(updateField({
        P1side: P1Owner ? tempSide : fieldCards.P1side,
        P2side: P1Owner ? fieldCards.P2side : tempSide
      }));
    }
  }, [pendingSacr]);

  const onSpawn = (tempCard: CardType) => {
    tempCard = { ...tempCard, selected: false };
    const positionId = P1Owner ? 100 + index : 200 + index;

    //debugger
    //TODO cerca se qualche sigillo hanno flag onSpawn
    if (tempCard.sigils?.includes(1)) { //1='egg'
      debugger
      let oppField = [...fieldCards.P2side]
      if (oppField[index].cardID === -1) {
        oppField[index] = { ...egg, cardID: positionId };
        dispatch(updateField({
          P1side: P1Owner ? fieldCards.P1side : oppField,
          P2side: P1Owner ? oppField : fieldCards.P2side
        }));
      }
    }

    setCurrCard(tempCard);
    dispatch(updateSacrificeCount(0));
    dispatch(setDeleteCardHand(tempCard));
    //emptyCard();
    let tempSide: CardType[] = [...mySide].map((card): CardType =>
      card.selected && !(card?.sigils?.includes(202)) ? onSacrifice(card) //202='degnoSacr'
        : { ...card, selected: false }); // eccezione gatto gestita

    tempSide[index] = tempCard;
    dispatch(updateField({
      P1side: P1Owner ? tempSide : fieldCards.P1side,
      P2side: P1Owner ? fieldCards.P2side : tempSide
    }));
  }

  const onSacrifice = (card: CardType) => {
    currPlayer === 1 ? dispatch(addP1bones(card.dropBones)) : dispatch(addP2bones(card.dropBones));
    //TODO eccezione carte che tornano in mano
    return (EMPTY_CARD);
  }

  const destroyCard = () => {
    currPlayer === 1 ? dispatch(addP1bones(currCard.dropBones)) : dispatch(addP2bones(currCard.dropBones));
    let tempSide: CardType[] = [...mySide].map((card): CardType =>
      card.selected && !(card?.sigils?.includes(202)) ? onSacrifice(card) //202='degnoSacr'
        : { ...card, selected: false }); // eccezione gatto gestita

    tempSide[index] = EMPTY_CARD;
    dispatch(updateField({
      P1side: P1Owner ? tempSide : fieldCards.P1side,
      P2side: P1Owner ? fieldCards.P2side : tempSide
    }));
  }

  const handleDrop = () => {
    //debugger
    //const id = movedCard.name;
    //console.log(`Somebody dropped an element with id: ${id}`);
    //setDragOver(false);

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
    else
      onSpawn(dragCard); //replace this card
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
          //debugger
          tempSide[index] = { ...tempSide[index], selected: true };
          dispatch(setWarning({
            message: 'sacrifices',
            subject: 'Player' + currPlayer.toString(),
            severity: tempSacr + currCard.dropBlood <= 0 ? 'close' : 'action'
          }))
          dispatch(updateSacrificeCount(currCard.dropBlood))
        }
        dispatch(updateField({
          P1side: P1Owner ? tempSide : fieldCards.P1side,
          P2side: P1Owner ? fieldCards.P2side : tempSide
        }));
      }
    }
  }

  return (
    //   <Container
    //   orientation="vertical"
    //   onDrop={this.onColumnDrop}
    //   dragHandleSelector=".column-drag-handle"
    //   dropPlaceholder={{
    //     animationDuration: 150,
    //     showOnTop: true,
    //     className: 'cards-drop-preview'
    //   }}
    // >
    <div
      className={(show ? (currCard.dropBlood < 0 ? "rock-shape" : "card-shape") : empty_slot) +
        (currPlayer === owner ? " has-hover" : "") +
        (currCard.selected ? " selected" : "")}
      onClick={dragCard?.name ? handleDrop : validateSelection}

    //onDragOver={(e) => e.preventDefault()}
    //onDrop={handleDrop}
    //onDragStart={() => { debugger; setDragOver(true) }}
    //onDragEnd={() => { debugger; setDragOver(false) }}
    >
      {show && <>
        <div className="mt-01">{currCard.name}</div>
        {RenderCardSigils({ cardInfo: currCard, show })}
        <span className="card-atk-def">
          <div>{currCard.dropBlood >= 0 && !currCard.name?.includes('_sub') && currCard.atk || ' '}</div>
          <div>{!currCard.name?.includes('_sub') && currCard.def}</div>
        </span>
      </>}
    </div>
    // </Container>
  );
}
