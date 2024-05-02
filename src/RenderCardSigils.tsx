import React from "react";
import "./RenderCardSigils.scss";
import "./icons/Icons.scss";
import { CardType } from "./cardReducer.tsx";

export default function RenderCardSigils(props: {
  cardInfo: CardType,
  show: boolean
}): JSX.Element {
  const { cardInfo, show } = props;
  const sigils: string[] = [
    (cardInfo.sigils && cardInfo.sigils[0]) || 'empty',
    (cardInfo.sigils && cardInfo.sigils[1]) || '',
    (cardInfo.sigils && cardInfo.sigils[2]) || 'empty',
    (cardInfo.sigils && cardInfo.sigils[3]) || ''
  ]

  return (
    <>
      {show && <>
        <span className="image-container">
          <p className={"card-image " + sigils[0] + '-sigil'} />
          <p className={"card-image " + sigils[1] + '-sigil'} />
        </span>
        <span className="image-container">
          <p className={"card-image " + sigils[2] + '-sigil'} />
          <p className={"card-image " + sigils[3] + '-sigil'} />
        </span>
      </>}
    </>
  );
}
