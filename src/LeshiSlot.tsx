import React, { useEffect, useState } from "react";
import "./css/Card.scss";
import { useAppSelector } from "./hooks.ts";
import {
  CardType,   Field, EMPTY_CARD,
  EMPTY_TOAST,
  addP1bones, addP2bones,
  setWarning, updateField, updateSacrificeCount
} from "./cardReducer.tsx";
//import { Container } from "react-smooth-dnd";
import { useAppDispatch } from "./hooks.ts";
import RenderCardSigils from "./RenderCardSigils.tsx";
import { sigil_def } from "./const/families.tsx";

export default function LeshiSlot(props: { owner: number, index: number }): JSX.Element {
  const { owner, index } = props;
  const P1Owner: boolean = (owner === 1);
  const dispatch = useAppDispatch();
  const currPlayer: number = useAppSelector((state) => state.card.currPlayer);
  const movedCard = useAppSelector((state) => state.card.dragCardInfo);
  const pendingSacr = useAppSelector((state) => state.card.pendingSacr);
  const leshiField: Field = useAppSelector((state) => state.card.leshiField);
  const mySide = P1Owner ? leshiField.P1side : leshiField.P2side;
  const hammer = useAppSelector((state) => state.card.hammer);

  const [currCard, setCurrCard] = useState<CardType>(mySide[index]);
  const [selected, setSelected] = useState<boolean>(false);
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [show, setShow] = useState<boolean>(currCard?.name?.length > 0);
  const empty_slot: string = "empty-slot-shape";

  useEffect(() => {
    //reset pending selections during battlePhase
    if (currPlayer === 0 && selected) {
      dispatch(updateSacrificeCount(0))
    }
  }, [currPlayer]);

  useEffect(() => {
    //update during battlePhase
    if (owner === 1) {
      //debugger
      setCurrCard(leshiField.P1side[index]);
      setShow(leshiField.P1side[index].name?.length > 0);
    }
  }, [leshiField.P1side]);
  useEffect(() => {
    //update during battlePhase
    if (owner === 2) {
      //debugger
      setCurrCard(leshiField.P2side[index]);
      setShow(leshiField.P2side[index].name?.length > 0);
    }
  }, [leshiField.P2side]);

  useEffect(() => {
    if (!pendingSacr)
      setSelected(false)
  }, [pendingSacr]);

  const currCardSetter = (tempCard: CardType) => {
    setCurrCard(tempCard);
    let tempSide: CardType[] = [...mySide];
    tempSide[index] = tempCard;
    dispatch(updateField({
      P1side: P1Owner ? tempSide : leshiField.P1side,
      P2side: P1Owner ? leshiField.P2side : tempSide
    }));
  }

  const emptyCard = () => {
    currPlayer === 1 ? dispatch(addP1bones(currCard.dropBones)) : dispatch(addP2bones(currCard.dropBones));
    currCardSetter(EMPTY_CARD);
  }

  const handleDrop = () => {
    debugger
    const id = movedCard.name;
    console.log(`Somebody dropped an element with id: ${id}`);
    setDragOver(false);
  }

  // useEffect(() => {
  //   const deltaX: number = Math.abs(position.x - (movedCard?.coord?.x || 0));
  //   const deltaY: number = Math.abs(position.y - (movedCard?.coord?.y || 0));
  //   //console.log(index, owner, movedCard)
  //   if (movedCard.sacr > pendingSacr)
  //     dispatch(setWarning({
  //       message: 'sacrifices_needed',
  //       subject: 'Player' + currPlayer.toString(),
  //       severity: 'warning',
  //       props: movedCard.name
  //     }))
  //   else if ((movedCard?.bone || 0) > currPbone)
  //     dispatch(setWarning({
  //       message: 'bones_needed',
  //       subject: 'Player' + currPlayer.toString(),
  //       severity: 'warning',
  //       props: movedCard.name
  //     }))
  //   else {
  //     debugger
  //     if (deltaX < 35 && deltaY < 50)
  //       copyCardStats(); //replace this card
  //     else if (deltaX < 35 && selected)
  //       emptyCard();
  //   }
  // }, [movedCard]);

  const validateSelection = () => {
    if (currPlayer === owner && currCard.name) {
      if (hammer) { //click con martello svuota slot
        //TODO apply all the OnDeath effects (es. armatura->distruggi armatura,
        //immortal, and bomba) before destrying the card
        emptyCard();
      }
      else if (currCard.dropBlood >= 0) {
        //TODO bug: sulla selezione + click in basso (su altra carta?) spariscono
        if (selected) {
          setSelected(false)
            dispatch(setWarning({
              message: 'sacrifices',
              subject: 'Player' + currPlayer.toString(),
              severity: pendingSacr + currCard.dropBlood <= 0 ? 'close' : 'action'
            }))
          dispatch(updateSacrificeCount(-currCard.dropBlood))
        }
        else {
          //debugger
          setSelected(true)
          dispatch(updateSacrificeCount(currCard.dropBlood))
          dispatch(setWarning({
            message: 'sacrifices',
            subject: 'Player' + currPlayer.toString(),
            severity: pendingSacr + currCard.dropBlood <= 0 ? 'close' : 'action'
          }))
        }
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
        (selected ? " selected" : "") +
        (dragOver ? " dragged" : "")}
      onClick={validateSelection}

      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onDragStart={() => { debugger; setDragOver(true) }}
      onDragEnd={() => { debugger; setDragOver(false) }}
    >
      {show && <>
        <div className="mt-01">{currCard.name}</div>
        {RenderCardSigils({ cardInfo: currCard, show })}
        <span className="card-atk-def">
          <div>{currCard.dropBlood >= 0 && currCard.atk || ' '}</div>
          <div>{currCard.def}</div>
        </span>
      </>}
    </div>
    // </Container>
  );
}
