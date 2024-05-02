import React, { useState } from "react";
import "./Deck.scss";
import { updateHand, P1DeckNextID, P2DeckNextID, updateP1draw, updateP2draw, CardType, squirrel, setWarning, resetActiveEvent, hunter } from "./cardReducer.tsx";
import { useAppSelector, useAppDispatch } from "./hooks.ts";
import { sigils } from "./const/families.tsx";

export default function Deck(props: { owner: number }): JSX.Element {
  const { owner } = props;
  const dispatch = useAppDispatch();
  const isP1Owner: boolean = (owner === 1);
  const deck: CardType[] = useAppSelector((state) => isP1Owner ? state.card.P1Deck : state.card.P2Deck);
  const handCards = useAppSelector((state) => state.card.handCards);
  const canPlayerDraw = useAppSelector((state) => isP1Owner ? state.card.canP1draw : state.card.canP2draw);
  const currPlayer = useAppSelector((state) => state.card.currPlayer);
  const rules = useAppSelector((state) => state.card.rules);
  const [SQR, RemoveSQL] = useState<number>(20); //deckSQR.length

  const addTotemSigil = (drawnCard: CardType, newSigil: string) => {
    let sigils = ['', '', '', ''];
    if (!drawnCard.sigils)
      sigils = [newSigil, '', 'empty', '']
    else if (drawnCard.sigils && drawnCard.sigils[1])
      sigils = [drawnCard.sigils[0], newSigil, 'empty', '']
    else if (drawnCard.sigils && drawnCard.sigils[2] === 'empty')
      sigils = [drawnCard.sigils[0], drawnCard.sigils[1], newSigil, '']
    else if (drawnCard.sigils && drawnCard.sigils[3])
      sigils = [drawnCard.sigils[0],
      drawnCard.sigils[1],
      drawnCard.sigils[2],
        newSigil]
    return { ...drawnCard, sigils }
  }

  const onDeckClick = () => {
    if ((currPlayer === owner) && canPlayerDraw) {
      isP1Owner ? dispatch(updateP1draw(false)) : dispatch(updateP2draw(false));
      let tempSide = isP1Owner ? handCards.P1side : handCards.P2side;
      const randCardIndex = Math.floor(Math.random() * deck.length);
      let drawnCard = deck[randCardIndex];

      if (rules.useCandles.activeEvent) { //solo il primo sconfitto ha diritto al vantaggio
        dispatch(resetActiveEvent());
        const randSigilIndex = Math.floor(Math.random() * (sigils.length - 1));
        const tempSigils: string[] = [sigils[randSigilIndex], 'empty', '', 'empty'];
        drawnCard = { ...hunter, sigils: tempSigils, cardID: isP1Owner ? 1500 : 2500 }
      }
      debugger
      //TODO bug, non appare il bounty hunter

      if (rules.randomSigils)
        drawnCard = addTotemSigil(drawnCard, 'random');
      else if (rules.useTotems.P1Head === drawnCard.family && rules.useTotems.P1Sigil)
        drawnCard = addTotemSigil(drawnCard, rules.useTotems.P1Sigil);
      else if (rules.useTotems.P2Head === drawnCard.family && rules.useTotems.P2Sigil)
        drawnCard = addTotemSigil(drawnCard, rules.useTotems.P2Sigil);
      tempSide = [...tempSide, drawnCard];
      dispatch(updateHand({
        P1side: isP1Owner ? tempSide : handCards.P1side,
        P2side: isP1Owner ? handCards.P2side : tempSide
      }))
      const tempDeck = [...deck].filter((c) => c.cardID !== drawnCard.cardID);
      isP1Owner ? dispatch(P1DeckNextID(tempDeck)) : dispatch(P2DeckNextID(tempDeck));
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
      let tempSide = isP1Owner ? handCards.P1side : handCards.P2side;
      const SQR_ID = isP1Owner ? 1900 + SQR : 2900 + SQR;
      if (rules.useTotems.P1Head === 'scoiattoli' && rules.useTotems.P1Sigil) {
        tempSide = [...tempSide, {
          ...squirrel, cardID: SQR_ID,
          sigils: [rules.useTotems.P1Sigil, '', 'empty', '']
        }];
      }
      else if (rules.useTotems.P2Head === 'scoiattoli' && rules.useTotems.P2Sigil) {
        tempSide = [...tempSide, {
          ...squirrel, cardID: SQR_ID,
          sigils: [rules.useTotems.P2Sigil, '', 'empty', '']
        }];
      }
      else
        tempSide = [...tempSide, { ...squirrel, cardID: SQR_ID }];
      dispatch(updateHand({
        P1side: isP1Owner ? tempSide : handCards.P1side,
        P2side: isP1Owner ? handCards.P2side : tempSide
      }))
      RemoveSQL(SQR - 1);
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
      {deck.length > 0 &&
        <div className={canPlayerDraw ? "deck-shape" : "deck-shape-disabled"}
          key={'deck'}
          onClick={onDeckClick}>
        </div>}
      {
        SQR > 0 && <div className={canPlayerDraw ? "deck-sqr-shape" : "deck-sqr-shape-disabled"}
          key={'deckSQR'}
          onClick={onDeckSQRClick}>
        </div>
      }
    </div >
  );
}
