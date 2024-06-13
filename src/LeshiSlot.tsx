import React, { useEffect, useState } from "react";
import "./css/Card.scss";
import { useAppSelector } from "./hooks.ts";
import {
  CardType, Field,
  setWarning, updateSacrificeCount
} from "./cardReducer.tsx";
import { useAppDispatch } from "./hooks.ts";
import RenderCardSigils from "./RenderCardSigils.tsx";

export default function LeshiSlot(props: { owner: number, index: number }): JSX.Element {
  const { owner, index } = props;
  const P1Owner: boolean = (owner === 1);
  const dispatch = useAppDispatch();
  const currPlayer: number = useAppSelector((state) => state.card.currPlayer);
  const pendingSacr = useAppSelector((state) => state.card.pendingSacr);
  const leshiField: Field = useAppSelector((state) => state.card.leshiField);
  const mySide = P1Owner ? leshiField.P1side : leshiField.P2side;
  //const hammer = useAppSelector((state) => state.card.hammer);

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
      setCurrCard(leshiField.P1side[index]);
      setShow(leshiField.P1side[index].name?.length > 0);
    }
  }, [leshiField.P1side]);
  useEffect(() => {
    //update during battlePhase
    if (owner === 2) {
      setCurrCard(leshiField.P2side[index]);
      setShow(leshiField.P2side[index].name?.length > 0);
    }
  }, [leshiField.P2side]);

  useEffect(() => {
    if (!pendingSacr)
      setSelected(false)
  }, [pendingSacr]);

  const validateSelection = () => {
    if (currPlayer === owner && currCard.name) {
      // if (hammer) { //click con martello svuota slot
      //   emptyCard();
      // }
      if (currCard.dropBlood >= 0) {
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
    <div
      className={(show ? (currCard.dropBlood < 0 ? "rock-shape" : "card-shape") : empty_slot) +
        (currPlayer === owner ? " has-hover" : "") +
        (selected ? " selected" : "") +
        (dragOver ? " dragged" : "")}
      onClick={validateSelection}  >
      {show && <>
        <div className="mt-01">{currCard.name}</div>
        {RenderCardSigils({ cardInfo: currCard, show })}
        <span className="card-atk-def">
          <div>{currCard.dropBlood >= 0 && currCard.atk || ' '}</div>
          <div>{currCard.def}</div>
        </span>
      </>}
    </div>
  );
}
