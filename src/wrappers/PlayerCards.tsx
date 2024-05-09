import React from "react";
import "../css/PlayerCards.scss";
import Card from "../Card.tsx";
import { CardType, EMPTY_CARD, setCurrPlayer } from "../cardReducer.tsx";
import { useAppDispatch, useAppSelector } from "../hooks.ts";
import { Sidebar } from "primereact/sidebar";

export default function PlayerCards(props: { owner: number }): JSX.Element {
  const dispatch = useAppDispatch();
  const handCardSide: CardType[] = useAppSelector((state) => props.owner === 1 ?
    state.card.handCards.P1side : state.card.handCards.P2side);
  const currPlayer: number = useAppSelector((state) => state.card.currPlayer);

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
        visible={currPlayer === 0}//phase preP1 || phase preP2
        position={props.owner === 1 ? "bottom" : "top"}
        //onhide phase P1draw
        onHide={() => dispatch(setCurrPlayer(props.owner))}
        onClick={() => dispatch(setCurrPlayer(props.owner))}>
        <h2 className="player-ready-sidebar-title">{("P" + props.owner + " ready")}</h2>
      </Sidebar>
    </div>
  );
}
