import React from "react";
import "../css/PlayerCards.scss";
import Card from "../Card.tsx";
import { CardType, EMPTY_CARD } from "../cardReducer.tsx";
import { useAppSelector } from "../hooks.ts";

export default function PlayerCards(props: { owner: number }): JSX.Element {
  const handCardSide: CardType[] = useAppSelector((state) => props.owner === 1 ?
    state.card.handCards.P1side : state.card.handCards.P2side);

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
    </div>
  );
}
