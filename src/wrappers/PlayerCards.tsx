import React from "react";
import "../css/PlayerCards.scss";
import Card from "../Card.tsx";
import { CardType, setCurrPhase } from "../cardReducer.tsx";
import { useAppDispatch, useAppSelector } from "../hooks.ts";
import { Sidebar } from "primereact/sidebar";
import { EMPTY_CARD } from "../const/utilCards.tsx";

export default function PlayerCards(props: { owner: number }): JSX.Element {
  const dispatch = useAppDispatch();
  const handCardSide: CardType[] = useAppSelector((state) => props.owner === 1 ?
    state.card.handCards?.P1side : state.card.handCards?.P2side);
  const currPhase: number = useAppSelector((state) => state.card.currPhase);

  const onNextPhase = () => {
    if ((props.owner === 1 && currPhase === 10) ||
      (props.owner === 2 && currPhase === 20))
      dispatch(setCurrPhase(currPhase + 1)); //onhide phase P1draw || phase P2draw
  }

  return (
    <div className="player-cards">
      <Card cardInfo={handCardSide[0] || EMPTY_CARD} />
      <Card cardInfo={handCardSide[1] || EMPTY_CARD} />
      <Card cardInfo={handCardSide[2] || EMPTY_CARD} />
      <Card cardInfo={handCardSide[3] || EMPTY_CARD} />
      <Card cardInfo={handCardSide[4] || EMPTY_CARD} />
      <Card cardInfo={handCardSide[5] || EMPTY_CARD} />
      <Card cardInfo={handCardSide[6] || EMPTY_CARD} />
      <Card cardInfo={handCardSide[7] || EMPTY_CARD} />
      <Card cardInfo={handCardSide[8] || EMPTY_CARD} />
      <Card cardInfo={handCardSide[9] || EMPTY_CARD} />
      <Card cardInfo={handCardSide[10] || EMPTY_CARD} />

      <Sidebar
        className={props.owner === 1 ? "player-ready-sidebar-P1" : "player-ready-sidebar-P2"}
        visible={
          (props.owner === 1 && currPhase === 10) ||
          (props.owner === 2 && currPhase === 20)} //phase preP1 || phase preP2
        position={props.owner === 1 ? "bottom" : "top"}
        onHide={() => { }}>
        <div className="player-ready-sidebar-title" onClick={onNextPhase}>
          <h2 className="m-0">{("P" + props.owner + " ready")}</h2>
          <p>Click here to proceed</p> {/* Press Enter, Space or click here non funziona*/}
        </div>
      </Sidebar>
    </div>
  );
}
