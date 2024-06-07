import {
  CardType, Field, P1DeckNextID, P1DeckSQRNextID, P2DeckNextID, P2DeckSQRNextID,
  RuleType, resetBoss, turnClock, drawnHand
} from "./cardReducer.tsx";
import { sigil_def } from "./const/families.tsx";
import { EMPTY_CARD, angler, dinamite, hunter, necromancer, prospector, squirrel } from "./utilCards.tsx";

export const sigilDefinition = (sigilId: number) => {
  if (sigilId > 0) {
    const sigil = sigil_def.find((s) => s.id === sigilId)
    return sigil?.name + ': ' + sigil?.trad;
  }
  return ''
}

export const DrawFromDeck = (isP1Owner: boolean, deck: CardType[], rules: RuleType, dispatch: any) => {
  const randCardIndex = Math.floor(Math.random() * deck.length);
  let drawnCard = deck[randCardIndex];
  if (rules.randomSigils)
    drawnCard = addTotemSigil(drawnCard, 900);
  else if (rules.useTotems.P1Head === drawnCard.family && rules.useTotems.P1Sigil)
    drawnCard = addTotemSigil(drawnCard, rules.useTotems.P1Sigil);
  else if (rules.useTotems.P2Head === drawnCard.family && rules.useTotems.P2Sigil)
    drawnCard = addTotemSigil(drawnCard, rules.useTotems.P2Sigil);
  drawnCard = replaceRandomSigil(drawnCard);
  const tempDeck = [...deck].filter((c) => c.cardID !== drawnCard.cardID);
  isP1Owner ? dispatch(P1DeckNextID(tempDeck)) : dispatch(P2DeckNextID(tempDeck));

  dispatch(drawnHand({ isP1Owner, drawnCard }));
}

export const DrawFromSQR = (isP1Owner: boolean, rules: RuleType, dispatch: any) => {
  let drawnCard = squirrel;
  if (rules.useTotems.P1Head === drawnCard.family && rules.useTotems.P1Sigil)
    drawnCard = addTotemSigil(drawnCard, rules.useTotems.P1Sigil);
  if (rules.useTotems.P2Head === drawnCard.family && rules.useTotems.P2Sigil)
    drawnCard = addTotemSigil(drawnCard, rules.useTotems.P2Sigil);
  debugger
  dispatch(drawnHand({ isP1Owner, drawnCard }))
  isP1Owner ? dispatch(P1DeckSQRNextID()) : dispatch(P2DeckSQRNextID());
}

export const DrawFromBoss = (isP1Owner: boolean, rules: RuleType, dispatch: any) => {
  dispatch(resetBoss());
  const boss = rules.boss === 'prospector' ? prospector
    : rules.boss === 'hunter' ? hunter
      : rules.boss === 'angler' ? angler
        : rules.boss === 'necromancer' ? necromancer
          : squirrel //altri...
  dispatch(drawnHand({ isP1Owner, drawnCard: boss }));
}

export const DrawFromDinamite = (isP1Owner: boolean, dispatch: any) => {
  let drawnCard = dinamite;
  dispatch(drawnHand({ isP1Owner, drawnCard }))
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
  function changeId(card: CardType, newpos: number, P1Owner: boolean): CardType {
    if (card.cardID === -1)
      return card
    const newID = P1Owner ? 100 + newpos : 200 + newpos;
    return { ...card, cardID: newID }
  }

  const turnedField: Field = isClockwise ?
    {
      P1side: [
        changeId(fieldCards.P1side[1], 0, true),
        changeId(fieldCards.P1side[2], 1, true),
        changeId(fieldCards.P1side[3], 2, true),
        changeId(fieldCards.P1side[4], 3, true),
        changeId(fieldCards.P2side[4], 4, true)],
      P2side: [
        changeId(fieldCards.P1side[0], 0, false),
        changeId(fieldCards.P2side[0], 1, false),
        changeId(fieldCards.P2side[1], 2, false),
        changeId(fieldCards.P2side[2], 3, false),
        changeId(fieldCards.P2side[3], 4, false)]
    } :
    {
      P1side: [
        changeId(fieldCards.P2side[0], 0, true),
        changeId(fieldCards.P1side[0], 1, true),
        changeId(fieldCards.P1side[1], 2, true),
        changeId(fieldCards.P1side[2], 3, true),
        changeId(fieldCards.P1side[3], 4, true)],
      P2side: [
        changeId(fieldCards.P2side[1], 0, false),
        changeId(fieldCards.P2side[2], 1, false),
        changeId(fieldCards.P2side[3], 2, false),
        changeId(fieldCards.P2side[4], 3, false),
        changeId(fieldCards.P1side[4], 4, false)]
    };
  usedWatches ? dispatch(turnClock({ turnedField, usedWatches })) : dispatch(turnClock({ turnedField }));
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