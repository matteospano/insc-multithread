import React, { useEffect, useState } from "react";
import { Container, Draggable } from "react-smooth-dnd";
import "./Card.scss";
import { CardType, EMPTY_CARD, updateHand, setMovedCardInfo, setWarning } from "./cardReducer.tsx";
import { useAppSelector, useAppDispatch } from "./hooks.ts";
import RenderCardSigils from "./RenderCardSigils.tsx";

export default function Card(props: {
  cardInfo: CardType
}): JSX.Element {
  const { cardID, name, atk, def, sacr, bone, dropBlood } = props.cardInfo || EMPTY_CARD;

  const dispatch = useAppDispatch();
  const currPlayer: number = useAppSelector((state) => state.card.currPlayer);
  const movedCardID = useAppSelector((state) => state.card.movedCardID);
  const handCards = useAppSelector((state) => state.card.handCards);
  const isValidCard = cardID >= 1000;
  const isP1Owner = cardID < 2000;
  const canPlayerDraw = useAppSelector((state) => isP1Owner ?
    state.card.canP1draw : state.card.canP2draw);
  const [pos, setPos] = useState<any>(null);

  const show: boolean = (isP1Owner ? 1 : 2) === currPlayer;
  const handleStart = () => {
    if (canPlayerDraw)
      dispatch(setWarning({
        message: 'must_draw',
        subject: 'Player ' + currPlayer,
        severity: 'error'
      }))
  }
  const handleStop = (e) => {
    const coord = e as MouseEvent;
    //console.log(coord.x, coord.y)
    dispatch(setMovedCardInfo({ ...props.cardInfo, coord: { x: +coord.x, y: +coord.y } }));
    setPos({ x: 0, y: 0 })
  }

  useEffect(() => {
    if (cardID === movedCardID) {
      let tempSide = isP1Owner ? handCards.P1side : handCards.P2side;
      tempSide = tempSide.filter((c: CardType) => c.cardID !== movedCardID);

      dispatch(updateHand(
        {
          P1side: isP1Owner ? tempSide : handCards.P1side,
          P2side: isP1Owner ? handCards.P2side : tempSide
        }))
    }
  }, [movedCardID]);


  return (
    <>
      {isValidCard &&
        <Draggable
          axis={(pos?.y > 170 && pos.y < 180) ? 'x' : 'both'}
          handle=".handle"
          defaultPosition={{ x: 0, y: 0 }}
          position={pos}
          scale={1}
          onStart={handleStart}
          //onDrag={handleDrag}
          onStop={handleStop}
          bounds={{
            top: (isP1Owner ? -180 : 0),
            bottom: (isP1Owner ? 0 : 180)
          }}
          disabled={!show}>

          <div className={show ?
            dropBlood < 0 ? "rock-shape handle" : "card-shape handle" :
            "card-back"} key={cardID}>
            <div className="mt-01">{show && name + ' ' + (sacr || (bone ? bone + 'B' : ''))}</div>
            {RenderCardSigils({ cardInfo: props.cardInfo, show })}
            <span className="valori">
              <div>{show && dropBlood && atk}</div>
              <div>{show && def}</div>
            </span>
          </div>
        </Draggable >}
    </>
  );
}
