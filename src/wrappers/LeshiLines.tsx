import React, { useEffect } from "react";
import "../css/CardSlots.scss";
import { useAppDispatch, useAppSelector } from "../hooks.ts";
import { EMPTY_FIELD, Field, updateLeshiField, updateField, squirrel, CardType } from "../cardReducer.tsx";
import LeshiSlot from "../LeshiSlot.tsx";

export default function LeshiLines(props: { owner: number }): JSX.Element {
  const { owner } = props;
  const dispatch = useAppDispatch();
  const currPhase: number = useAppSelector((state) => state.card.currPhase);
  const leshiField: Field = useAppSelector((state) => state.card.leshiField);
  const fieldCards: Field = useAppSelector((state) => state.card.fieldCards);
  const rules = useAppSelector((state) => state.card.rules);

  useEffect(() => {
    if (owner === 2 && currPhase === 21 && rules.isMultiplayer > 0)
      autoPlay();
  }, [currPhase]);

  const autoPlay = () => {
    const newLeshiField: Field = {
      ...EMPTY_FIELD,
      P2side: [squirrel, squirrel, squirrel, squirrel, squirrel]
    };
    let newP2side: CardType[] = fieldCards.P2side;
    newP2side = newP2side.map((card, index) => {
      if (card.cardID === -1) return leshiField.P2side[index]
      return card
    });
    dispatch(updateField({ P1side: fieldCards.P1side, P2side: newP2side })); //TODO gestisci qui l'onSpawn
    dispatch(updateLeshiField(newLeshiField));
  }

  return (
    <div className="board-grid">
      <LeshiSlot owner={owner} index={0} />
      <LeshiSlot owner={owner} index={1} />
      <LeshiSlot owner={owner} index={2} />
      <LeshiSlot owner={owner} index={3} />
      <LeshiSlot owner={owner} index={4} />
    </div>
  );
}
