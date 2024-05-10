import React, { useEffect } from "react";
import "../css/CardSlots.scss";
import { useAppDispatch, useAppSelector } from "../hooks.ts";
import { EMPTY_FIELD, Field, updateLeshiField, updateField, squirrel, CardType, EMPTY_CARD } from "../cardReducer.tsx";
import LeshiSlot from "../LeshiSlot.tsx";
import { fillEmptySpots } from "../utils.tsx";

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
    let movedLeshi: CardType[] = [...leshiField.P2side];
    let newP2side: CardType[] = fieldCards.P2side;
    newP2side = newP2side.map((card, index) => {
      if (card.cardID === -1) {
        movedLeshi[index] = EMPTY_CARD; //la carta si sposta sul field e lascia il buco vuoto
        return leshiField.P2side[index]
      }
      return card
    });
    //TODO provide a dataset depending on isMultiplayer mode
    const newLeshiP2side = fillEmptySpots(movedLeshi, 1, [{ ...squirrel, cardID: 15 }]);

    dispatch(updateField({ P1side: fieldCards.P1side, P2side: newP2side })); //TODO gestisci qui l'onSpawn
    dispatch(updateLeshiField({ ...EMPTY_FIELD, P2side: newLeshiP2side }));
  }

  return (
    <div className={owner === 1 ? "board-grid leshi-P1-aligned" : "board-grid leshi-P2-aligned"}>
      <LeshiSlot owner={owner} index={0} />
      <LeshiSlot owner={owner} index={1} />
      <LeshiSlot owner={owner} index={2} />
      <LeshiSlot owner={owner} index={3} />
      <LeshiSlot owner={owner} index={4} />
    </div>
  );
}
