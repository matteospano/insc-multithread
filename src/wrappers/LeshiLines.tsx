import React from "react";
import "../css/CardSlots.scss";
import CardSlot from "../CardSlot.tsx";

export default function LeshiLines(props: { owner: number }): JSX.Element {
  const { owner } = props;

  return (
    <div className="board-grid">
      <CardSlot owner={owner} index={0} />
      <CardSlot owner={owner} index={1} />
      <CardSlot owner={owner} index={2} />
      <CardSlot owner={owner} index={3} />
      <CardSlot owner={owner} index={4} />
    </div>
  );
}
