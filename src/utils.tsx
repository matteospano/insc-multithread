import {
  CardType, Field, P1DeckNextID, P1DeckSQRNextID, P2DeckNextID, P2DeckSQRNextID,
  RuleType, resetActiveEvent, turnClock, updateHand
} from "./cardReducer.tsx";
import { sigil_def } from "./const/families.tsx";
import { EMPTY_CARD, hunter, squirrel } from "./utilCards.tsx";

export const sigilDefinition = (sigilId: number) => {
  if (sigilId > 0) {
    const sigil = sigil_def.find((s) => s.id === sigilId)
    return sigil?.name + ': ' + sigil?.trad;
  }
  return ''
}

export const DrawFromDeck = (isP1Owner: boolean, deck: CardType[], handCards: Field, rules: RuleType, dispatch: any) => {
  let tempSide = isP1Owner ? handCards.P1side : handCards.P2side;
  const randCardIndex = Math.floor(Math.random() * deck.length);
  let drawnCard = deck[randCardIndex];

  if (rules.useCandles.activeEvent) { //solo il primo sconfitto ha diritto al vantaggio
    dispatch(resetActiveEvent());
    drawnCard = replaceRandomSigil({ ...hunter, cardID: isP1Owner ? 1500 : 2500 });
  }
  //debugger
  //TODO bug, non appare il bounty hunter

  if (rules.randomSigils)
    drawnCard = addTotemSigil(drawnCard, 900);
  else if (rules.useTotems.P1Head === drawnCard.family && rules.useTotems.P1Sigil)
    drawnCard = addTotemSigil(drawnCard, rules.useTotems.P1Sigil);
  else if (rules.useTotems.P2Head === drawnCard.family && rules.useTotems.P2Sigil)
    drawnCard = addTotemSigil(drawnCard, rules.useTotems.P2Sigil);

  drawnCard = replaceRandomSigil(drawnCard);
  tempSide = [...tempSide, drawnCard];
  dispatch(updateHand({
    P1side: isP1Owner ? tempSide : handCards.P1side,
    P2side: isP1Owner ? handCards.P2side : tempSide
  }))
  const tempDeck = [...deck].filter((c) => c.cardID !== drawnCard.cardID);
  isP1Owner ? dispatch(P1DeckNextID(tempDeck)) : dispatch(P2DeckNextID(tempDeck));
}

export const DrawFromSQR = (isP1Owner: boolean, SQR: number, handCards: Field, rules: RuleType, dispatch: any) => {
  let tempSide = isP1Owner ? handCards.P1side : handCards.P2side;
  const SQR_ID = isP1Owner ? 1900 + SQR : 2900 + SQR; //scoiattili con ID da 1920 a 1901
  if (rules.useTotems.P1Head === 'scoiattoli' && rules.useTotems.P1Sigil) {
    tempSide = [...tempSide, {
      ...squirrel, cardID: SQR_ID,
      sigils: [rules.useTotems.P1Sigil]
    }];
  }
  else if (rules.useTotems.P2Head === 'scoiattoli' && rules.useTotems.P2Sigil) {
    tempSide = [...tempSide, {
      ...squirrel, cardID: SQR_ID,
      sigils: [rules.useTotems.P2Sigil]
    }];
  }
  else
    tempSide = [...tempSide, { ...squirrel, cardID: SQR_ID }];
  dispatch(updateHand({
    P1side: isP1Owner ? tempSide : handCards.P1side,
    P2side: isP1Owner ? handCards.P2side : tempSide
  }))
  isP1Owner ? dispatch(P1DeckSQRNextID()) : dispatch(P2DeckSQRNextID());
}

export const addTotemSigil = (drawnCard: CardType, newSigil: number): CardType => {
  if (drawnCard.sigils?.includes(newSigil))
    return drawnCard //already present
  let tempSigils: number[] = drawnCard.sigils || [];
  tempSigils = tempSigils.concat([newSigil]);
  if (newSigil === 999)
    return { ...drawnCard, sigils: tempSigils, dropBlood: -1 }
  return { ...drawnCard, sigils: tempSigils }
}

export const handleClock = (fieldCards: Field, isClockwise: boolean, dispatch: any, usedWatches?: any) => {
  const turnedField: Field = isClockwise ?
    {
      P1side: [
        fieldCards.P1side[1],
        fieldCards.P1side[2],
        fieldCards.P1side[3],
        fieldCards.P1side[4],
        fieldCards.P2side[4]],
      P2side: [
        fieldCards.P1side[0],
        fieldCards.P2side[0],
        fieldCards.P2side[1],
        fieldCards.P2side[2],
        fieldCards.P2side[3]]
    } :
    {
      P1side: [
        fieldCards.P2side[0],
        fieldCards.P1side[0],
        fieldCards.P1side[1],
        fieldCards.P1side[2],
        fieldCards.P1side[3],
      ],
      P2side: [
        fieldCards.P2side[1],
        fieldCards.P2side[2],
        fieldCards.P2side[3],
        fieldCards.P2side[4],
        fieldCards.P1side[4]]
    };
  usedWatches ? dispatch(turnClock({ turnedField, usedWatches })) : dispatch(turnClock({ turnedField }));
  //TODO non fa l'update del field
}

export const fillEmptySpots = (spots: CardType[], n_cards: number, dataSet: CardType[]) => {
  debugger
  let emptySpotsIndex: number[] = spots.map((val, index) => ({ val, index }))
    .filter(({ val, index }) => val.cardID === -1).map(({ val, index }) => index);
  let updatedSpots: CardType[] = [...spots];

  for (let i = 0; i < n_cards && emptySpotsIndex.length > 0; i++) {
    const randIndex: number = Math.floor(Math.random() * emptySpotsIndex.length);
    updatedSpots[emptySpotsIndex[randIndex]] = { ...dataSet[0] }; //TODO randomCard = (dataSet)
    emptySpotsIndex.splice(randIndex, 1);
  }
  return updatedSpots;
}

export const randomCard = (dataSet: CardType[]) => {
  if (dataSet.length === 0) return EMPTY_CARD;
  const randCardIndex: number = Math.floor(Math.random() * dataSet.length);
  return dataSet[randCardIndex];
}

export const replaceRandomSigil = (card: CardType): CardType => {
  if (card.sigils?.includes(900)) {
    const randIndex = Math.floor(Math.random() * (sigil_def.length - 1));
    const tempSigils: number[] = card.sigils.map((id) =>
      id === 900 ? sigil_def[randIndex]?.id : id);
    return { ...card, sigils: tempSigils }
  }
  return card
} 