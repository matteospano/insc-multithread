import React from "react";
import "./css/Deck.scss";
import { CardType, setWarning, updateP1draw, updateP2draw } from "./cardReducer.tsx";
import { useAppSelector, useAppDispatch } from "./hooks.ts";
import { DrawFromDeck, DrawFromDinamite, DrawFromSQR } from "./utils.tsx";

export default function Deck(props: { owner: number }): JSX.Element {
  const { owner } = props;
  const dispatch = useAppDispatch();
  const isP1Owner: boolean = (owner === 1);
  const deckLength: number = useAppSelector((state) => isP1Owner ? state.card.P1Deck?.length : state.card.P2Deck?.length);
  const SQRLength: number = useAppSelector((state) => isP1Owner ? state.card.P1SQRDeck : state.card.P2SQRDeck);
  const canPlayerDraw = useAppSelector((state) => isP1Owner ? state.card.canP1draw : state.card.canP2draw);
  const currPlayer = useAppSelector((state) => state.card.currPlayer);

  const deck: CardType[] = useAppSelector((state) => isP1Owner ? state.card.P1Deck : state.card.P2Deck);
  const rules = useAppSelector((state) => state.card.rules);
  const handLength: number = useAppSelector((state) => isP1Owner ? state.card.handCards.P1side.length : state.card.handCards.P2side.length);

  const onDeckClick = () => {
    if ((currPlayer === owner) && canPlayerDraw) {
      isP1Owner ? dispatch(updateP1draw(false)) : dispatch(updateP2draw(false));
      DrawFromDeck(isP1Owner, deck, rules, handLength, dispatch);
      dispatch(setWarning({
        message: 'must_draw',
        subject: 'Player ' + currPlayer,
        severity: 'close'
      }))
    }
    else
      dispatch(setWarning({
        message: 'cant_draw',
        subject: 'Player ' + owner,
        severity: 'error'
      }))
  }

  const onDeckSQRClick = () => {
    if ((currPlayer === owner) && canPlayerDraw) {
      isP1Owner ? dispatch(updateP1draw(false)) : dispatch(updateP2draw(false));
      DrawFromSQR(isP1Owner, handLength, rules, dispatch);
      dispatch(setWarning({
        message: 'must_draw',
        subject: 'Player ' + currPlayer,
        severity: 'close'
      }))
    }
    else
      dispatch(setWarning({
        message: 'cant_draw',
        subject: 'Player ' + owner,
        severity: 'error'
      }))
  }

  const onDeckTntClick = () => {
    if ((currPlayer === owner) && canPlayerDraw) {
      isP1Owner ? dispatch(updateP1draw(false)) : dispatch(updateP2draw(false));
      DrawFromDinamite(isP1Owner, handLength, dispatch);
      dispatch(setWarning({
        message: 'must_draw',
        subject: 'Player ' + currPlayer,
        severity: 'close'
      }))
    }
    else
      dispatch(setWarning({
        message: 'cant_draw',
        subject: 'Player ' + owner,
        severity: 'error'
      }))
  }

  return (
    <div className="decks-container">
      {deckLength > 0 &&
        <div className={canPlayerDraw ? "deck-shape" : "deck-shape-disabled"}
          key={'deck'}
          onClick={onDeckClick}>
        </div>}
      {SQRLength > 0 &&
        <div className={canPlayerDraw ? "deck-sqr-shape" : "deck-sqr-shape-disabled"}
          key={'deckSQR'}
          onClick={onDeckSQRClick}>
        </div>
      }
      {deckLength < 1 && SQRLength < 1 &&
        <div className={canPlayerDraw ? "deck-shape" : "deck-shape-disabled"}
          key={'deckDinamite'}
          onClick={onDeckTntClick}>
        </div>
      }
    </div >
  );
}
