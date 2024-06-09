import React, { useEffect, useState } from "react";
import "./css/Card.scss";
import { CardType, deleteHand, setDragCardInfo, setWarning } from "./cardReducer.tsx";
import { useAppSelector, useAppDispatch } from "./hooks.ts";
import RenderCardSigils from "./RenderCardSigils.tsx";
import { EMPTY_CARD } from "./utilCards.tsx";

export default function Card(props: {
  cardInfo: CardType
}): JSX.Element {
  const { cardID, name, atk, def, sacr, bone, dropBlood } = props.cardInfo || EMPTY_CARD;

  const dispatch = useAppDispatch();
  const currPlayer: number = useAppSelector((state) => state.card.currPlayer);
  const deleteCardHandID = useAppSelector((state) => state.card.deleteCardHand?.cardID);
  const isValidCard = cardID >= 100;
  const isP1Owner = cardID < 200;
  const canPlayerDraw = useAppSelector((state) => isP1Owner ?
    state.card.canP1draw : state.card.canP2draw);
  const [localSelected, setLocalSelected] = useState<boolean>(false);

  const show: boolean = (isP1Owner ? 1 : 2) === currPlayer;
  // const handleStop = (e) => {
  //   const coord = e as MouseEvent;
  //   //console.log(coord.x, coord.y)
  //   dispatch(setMovedCardInfo({ ...props.cardInfo, coord: { x: +coord.x, y: +coord.y } }));
  //   setPos({ x: 0, y: 0 })
  // }

  const handleClick = () => {
    if (show) {
      if (canPlayerDraw)
        dispatch(setWarning({
          message: 'must_draw',
          subject: 'Player ' + currPlayer,
          severity: 'error'
        }))
      else {
        if (localSelected) {
          setLocalSelected(false);
          dispatch(setDragCardInfo(EMPTY_CARD));
        }
        else {
          setLocalSelected(true);
          dispatch(setDragCardInfo({ ...props.cardInfo, selected: true }));
        }
      }
    }
  }

  useEffect(() => {
    if (cardID === deleteCardHandID) {
      dispatch(deleteHand({isP1Owner, deleteCardHandID}));
      setLocalSelected(false);
    }
  }, [deleteCardHandID]);


  return (
    <>
      {isValidCard &&
        // <Draggable
        //   axis={(pos?.y > 170 && pos.y < 180) ? 'x' : 'both'}
        //   handle=".handle"
        //   defaultPosition={{ x: 0, y: 0 }}
        //   position={pos}
        //   scale={1}
        //   onStart={handleStart}
        //   //onDrag={handleDrag}
        //   onStop={handleStop}
        //   bounds={{
        //     top: (isP1Owner ? -180 : 0),
        //     bottom: (isP1Owner ? 0 : 180)
        //   }}
        //   disabled={!show}>

        <div onClick={handleClick}
          className={show ? dropBlood < 0 ? "rock-shape" + (localSelected ? " selected" : "") :
            "card-shape" + (localSelected ? " selected" : "") : "card-back"} key={cardID}>
          <span className="mt-01 flex">
            <div className="col-10 crop-text pl-1">{show && name}</div>
            <div className={sacr ? "col-2 pr-05 card-text-sacr" : "col-2 pr-05 card-text-bones"}>
              {show && (sacr || bone || ' ')}</div>
          </span>
          {RenderCardSigils({ cardInfo: props.cardInfo, show })}
          <span className="card-atk-def">
            <div>{show && dropBlood && atk || ' '}</div>
            <div>{show && def}</div>
          </span>
        </div>
        // </Draggable >
      }
    </>
  );
}
