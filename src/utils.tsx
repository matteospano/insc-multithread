import {
  CardType, Field, P1UpdateDeck, P1DeckSQRNextID, P2UpdateDeck, P2DeckSQRNextID,
  RuleType, resetBoss, drawnHand, drawnFullHand
} from "./cardReducer.tsx";
import { sigil_def } from "./const/families.tsx";
import { EMPTY_CARD, angler, dinamite, hunter, necromancer, prospector, squirrel } from "./const/utilCards.tsx";

export const sigilDefinition = (sigilId: number) => {
  if (sigilId > 0) {
    const sigil = sigil_def.find((s) => s.id === sigilId)
    if (sigil?.name)
      return sigil?.name + ': ' + sigil?.trad + '.';
    return ''
  }
  return ''
}

export const DrawStart = (isP1Owner: boolean, deck: CardType[], P1SQRDeck: number, rules: RuleType, dispatch: any) => {
  let iterator = 5;
  let hand: CardType[] = [];
  let tempDeck: CardType[] = [...deck];

  while (iterator > 0) {
    let drawnCard = dinamite; //se il deck contiene già in origine <5 carte, peschi dinamite
    if (tempDeck.length > 0) {//todo imponi un min di 10 carte sulla scelta deck
      const rndInd = Math.floor(Math.random() * tempDeck.length);
      drawnCard = tempDeck[rndInd];
      tempDeck = [...tempDeck.filter((x) => x.name !== drawnCard.name)];
    }
    drawnCard = applySpawnSigil(drawnCard, rules.randomSigils,
      rules.useTotems.P1Head, rules.useTotems.P1Sigil, rules.useTotems.P2Head, rules.useTotems.P2Sigil);
    hand.push(drawnCard);
    iterator--;
  }

  isP1Owner ? dispatch(P1UpdateDeck(tempDeck)) : dispatch(P2UpdateDeck(tempDeck));
  dispatch(drawnFullHand({ isP1Owner, hand }));
  if (isP1Owner)
    DrawFromSQR(isP1Owner, P1SQRDeck, rules, dispatch); //pesca il primo scoiattolo
}

export const DrawFromDeck = (isP1Owner: boolean, deck: CardType[], rules: RuleType, dispatch: any) => {
  const randCardIndex = Math.floor(Math.random() * deck.length);
  let drawnCard = deck[randCardIndex];
  drawnCard = { ...drawnCard, cardXY: undefined };
  const tempDeck = [...deck];
  isP1Owner ? dispatch(P1UpdateDeck(tempDeck)) : dispatch(P2UpdateDeck(tempDeck));

  drawnCard = applySpawnSigil(drawnCard, rules.randomSigils,
    rules.useTotems.P1Head, rules.useTotems.P1Sigil, rules.useTotems.P2Head, rules.useTotems.P2Sigil);

  dispatch(drawnHand({ isP1Owner, drawnCard }));
}

export const DrawFromVirtualDeck = (isP1Owner: boolean, card: CardType, rules: RuleType, dispatch: any) => { //any deck-like draw
  let drawnCard: CardType = { ...card, cardXY: undefined, cardN: undefined }; //TODO indice cardN

  drawnCard = applySpawnSigil(drawnCard, rules.randomSigils,
    rules.useTotems.P1Head, rules.useTotems.P1Sigil, rules.useTotems.P2Head, rules.useTotems.P2Sigil);

  dispatch(drawnHand({ isP1Owner, drawnCard }));
}

export const DrawFromSQR = (isP1Owner: boolean, SQRLength: number, rules: RuleType, dispatch: any) => {
  const squirrelN = 1700 + (isP1Owner ? 0 : 1000) + SQRLength;
  let drawnCard: CardType = { ...squirrel, cardN: squirrelN };
  //non applica la randomSigil agli scoiattoli
  drawnCard = applySpawnSigil(drawnCard, false,
    rules.useTotems.P1Head, rules.useTotems.P1Sigil, rules.useTotems.P2Head, rules.useTotems.P2Sigil);

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
  dispatch(drawnHand({ isP1Owner, drawnCard: { ...boss, cardN: 999 + (isP1Owner ? 1000 : 2000), cardXY: undefined } }));
}

export const applySpawnSigil = (drawnCard: CardType, randomSigils: boolean,
  P1Head: string | undefined, P1Sigil: number | undefined,
  P2Head: string | undefined, P2Sigil: number | undefined): CardType => {
  let modifCard: CardType = drawnCard;

  const hasRandomSigil = drawnCard.sigils?.includes(900);
  if (randomSigils || hasRandomSigil)
    modifCard = replaceRandomSigil(drawnCard, hasRandomSigil);
  if (P1Head === drawnCard.family && P1Sigil)
    modifCard = addTotemSigil(drawnCard, P1Sigil);
  if (P2Head === drawnCard.family && P2Sigil)
    modifCard = addTotemSigil(drawnCard, P2Sigil);

  /* applica sigilli onDraw */
  if (drawnCard.sigils?.includes(999)) //looter
    modifCard = { ...modifCard, dropBlood: -1 }
  if (drawnCard.sigils?.includes(998)) //worthy
    modifCard = { ...modifCard, dropBlood: 3 }
  return modifCard;
}

export const addTotemSigil = (drawnCard: CardType, newSigil: number): CardType => {
  let modifCard: CardType = drawnCard;

  if (drawnCard.sigils?.includes(newSigil)) {
    return modifCard //already present
  }

  let tempSigils: number[] = drawnCard.sigils || [];

  /* useless sigils, they cancel each other: */
  if ((modifCard.sigils?.includes(170) && newSigil === 171))
    modifCard.sigils.splice(modifCard.sigils.indexOf(170), 1);
  else if (modifCard.sigils?.includes(171) && newSigil === 170)
    modifCard.sigils.splice(modifCard.sigils.indexOf(171), 1);
  else
    tempSigils = tempSigils.concat([newSigil]);

  return { ...modifCard, sigils: tempSigils }
}

export const handleClock = (fieldCards: Field, isClockwise: boolean): Field => {
  function changeId(card: CardType, newpos: number, P1Owner: boolean): CardType {
    if (!(card.cardN)) return card;
    const newID = P1Owner ? 1000 + newpos : 2000 + newpos;
    return { ...card, cardXY: newID };
  }

  return isClockwise
    ? {
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
        changeId(fieldCards.P2side[3], 4, false)],
    }
    : {
      P1side: [
        changeId(fieldCards.P2side[0], 0, true),
        changeId(fieldCards.P1side[0], 1, true),
        changeId(fieldCards.P1side[1], 2, true),
        changeId(fieldCards.P1side[2], 3, true),
        changeId(fieldCards.P1side[3], 4, true),
      ],
      P2side: [
        changeId(fieldCards.P2side[1], 0, false),
        changeId(fieldCards.P2side[2], 1, false),
        changeId(fieldCards.P2side[3], 2, false),
        changeId(fieldCards.P2side[4], 3, false),
        changeId(fieldCards.P1side[4], 4, false),
      ],
    };
};

export const fillEmptySpots = (spots: CardType[], n_cards: number, dataSet: CardType[]) => {
  const emptySpotsIndex: number[] = spots.map((val, index) => ({ val, index }))
    .filter(({ val, index }) => val.cardXY === undefined).map(({ val, index }) => index);
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

export const replaceRandomSigil = (card: CardType, hasRandomSigil: boolean | undefined): CardType => {
  const randIndex = Math.floor(Math.random() * (sigil_def.length - 1));
  //todo escludi quelli che vanno in conflitto (es. smell&alarm)
  if (card.sigils) {
    if (hasRandomSigil) {
      const tempSigils: number[] = card.sigils.map((id) =>
        id === 900 ? sigil_def[randIndex]?.id : id) || [];
      return { ...card, sigils: tempSigils }
    }
    else { //add random sigil
      const tempSigils: number[] = [...card.sigils, sigil_def[randIndex]?.id];
      return { ...card, sigils: tempSigils }
    }
  }
  return { ...card, sigils: [sigil_def[randIndex]?.id] }
}