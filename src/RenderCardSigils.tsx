import React from "react";
import "./css/RenderCardSigils.scss";
import "./icons/Icons.scss";
import { CardType } from "./cardReducer.tsx";

export default function RenderCardSigils(props: {
  cardInfo: CardType,
  show: boolean
}): JSX.Element {
  const { cardInfo, show } = props;
  const sigils: number[] = [
    (cardInfo.sigils && cardInfo.sigils[0]) || -1,
    (cardInfo.sigils && cardInfo.sigils[1]) || -2,
    (cardInfo.sigils && cardInfo.sigils[2]) || -1,
    (cardInfo.sigils && cardInfo.sigils[3]) || -2
  ]

  return (
    <>
      {show && <>
        <span className="image-container">
          <p className={"card-image sigil_" + sigils[0]} />
          <p className={"card-image sigil_" + sigils[1]} />
        </span>
        <span className="image-container">
          <p className={"card-image sigil_" + sigils[2]} />
          <p className={"card-image sigil_" + sigils[3]} />
        </span>
      </>}
    </>
  );
}
