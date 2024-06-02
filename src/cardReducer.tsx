import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import initialField from './defaultSettings/initialField.json';
import initialHand from './defaultSettings/initialHand.json';
import deck_P1 from './defaultSettings/P1Deck.json';
import deck_P2 from './defaultSettings/P2Deck.json';
const defaultHand = initialHand as Field
const defaultField = initialField as Field

export interface Coordinate { x: number, y: number }
export interface CardType {
  /* identificativi */
  cardID: number, name: string, family: string
  /* stats */
  atk: number, def: number,
  /* evocazione */
  sacr: number, bone?: number,
  /* sacrificio */
  dropBlood: number, dropBones: number,
  /* 4 slot sigilli */
  sigils?: number[]
  /* card move */
  coord?: Coordinate //TODO da togliere
  /* select card for sacrifice */
  selected? : boolean
  /* in atk o def */
  fight? : boolean
}
export interface RuleType {
  isMultiplayer: number,
  useBones: boolean,
  useLeshiLine: boolean,
  use4slots: boolean,
  useHammer: boolean,
  useBelts: boolean,
  useWatches: { P1: boolean, P2: boolean }
  useCandles: { P1: boolean, P2: boolean, activeEvent?: string }
  prospector: boolean,
  bountyHunter: boolean,
  randomSigils: boolean,
  useTotems: {
    P1Head: string | undefined,
    P1Sigil: number | undefined,
    P2Head: string | undefined,
    P2Sigil: number | undefined
  }
}
const DEFAULT_RULES: RuleType = {
  isMultiplayer: 0,
  useBones: true,
  useLeshiLine: false,
  use4slots: false,
  useHammer: false,
  useBelts: false,
  useWatches: {
    P1: false,
    P2: false
  },
  useCandles: {
    P1: false,
    P2: false
  },
  prospector: false,
  bountyHunter: false,
  useTotems: {
    P1Head: undefined,
    P1Sigil: undefined,
    P2Head: undefined,
    P2Sigil: undefined
  },
  randomSigils: false
}
export interface Field {
  P1side: CardType[],
  P2side: CardType[]
}
export const EMPTY_CARD: CardType = {
  cardID: -1, name: '', family: 'nessuna', atk: 0, def: 0, sacr: 0,
  dropBlood: 0, dropBones: 0
}
export const EMPTY_FIELD: Field = {
  P1side: [EMPTY_CARD, EMPTY_CARD, EMPTY_CARD, EMPTY_CARD, EMPTY_CARD],
  P2side: [EMPTY_CARD, EMPTY_CARD, EMPTY_CARD, EMPTY_CARD, EMPTY_CARD]
}

export interface warningToast {
  message: string,
  subject?: string,
  props?: string,
  severity: string, //warning, error, details, info, close
  expire?: number
}
export const EMPTY_TOAST: warningToast = {
  message: '',
  severity: 'close'
}

interface CardState {
  currPlayer: number;
  currPhase: number;
  showRules: boolean | undefined; //undefined prima di giocare, editabile
  rules: RuleType;
  handCards: Field;
  leshiField: Field;
  fieldCards: Field;
  dragCardInfo: CardType; //card being dragged to the field
  deleteCardHand: CardType;//dragCardInfo after drag completed
  P1Deck: CardType[];
  P1SQRDeck: number;
  P2Deck: CardType[];
  P2SQRDeck: number;
  P1Live: number;
  P2Live: number;
  P1Bones: number;
  P2Bones: number;
  canP1draw: boolean;
  canP2draw: boolean;
  pendingSacr: number;
  warningToast: warningToast,
  hammer: boolean,
  secretName: string,
  showSidebarInfo: boolean
}

const initialState: CardState = {
  currPlayer: 1,
  currPhase: 12, // 10: P1 ready, 11: P1 turn, 12: battle phase, 19: evolution phase
  showRules: undefined,
  rules: DEFAULT_RULES,
  handCards: defaultHand,
  leshiField: EMPTY_FIELD,
  fieldCards: defaultField,
  dragCardInfo: EMPTY_CARD,
  deleteCardHand: EMPTY_CARD,
  P1Deck: [...deck_P1] as CardType[],
  P1SQRDeck: 20,
  P2Deck: [...deck_P2] as CardType[],
  P2SQRDeck: 20,
  P1Live: 5,
  P2Live: 5,
  P1Bones: 0,
  P2Bones: 0,
  canP1draw: false,
  canP2draw: false,
  pendingSacr: 0,
  warningToast: EMPTY_TOAST,
  hammer: false,
  secretName: '',
  showSidebarInfo: false
};

const cardSlice = createSlice({
  name: 'card',
  initialState,
  reducers: {
    setCurrPlayer: (state, action: PayloadAction<number>) => ({
      ...state,
      currPlayer: action.payload
    }),
    setCurrPhase: (state, action: PayloadAction<number>) => ({
      ...state,
      currPhase: action.payload
    }),
    setDragCardInfo: (state, action: PayloadAction<CardType>) => ({
      ...state,
      dragCardInfo: action.payload
    }),
    setDeleteCardHand: (state, action: PayloadAction<CardType>) => ({
      ...state,
      dragCardInfo: EMPTY_CARD,
      deleteCardHand: action.payload
    }),
    increaseP1Live: (state, action: PayloadAction<number>) => ({
      ...state,
      P1Live: state.P1Live + action.payload,
      P2Live: state.P2Live - action.payload
    }),
    resetLive: (state, action: PayloadAction<{ P1: boolean, P2: boolean, activeEvent?: string }>) => ({
      ...state,
      P1Live: 5,
      P2Live: 5,
      rules: { ...state.rules, useCandles: action.payload }
    }),
    resetActiveEvent: (state) => ({
      ...state,
      rules: {
        ...state.rules,
        useCandles: {
          ...state.rules.useCandles,
          activeEvent: undefined
        }
      }
    }),
    P1DeckNextID: (state, action: PayloadAction<CardType[]>) => ({
      ...state,
      P1Deck: [...action.payload]
    }),
    P1DeckSQRNextID: (state) => ({
      ...state,
      P1SQRDeck: state.P1SQRDeck - 1
    }),
    P2DeckNextID: (state, action: PayloadAction<CardType[]>) => ({
      ...state,
      P2Deck: [...action.payload]
    }),
    P2DeckSQRNextID: (state) => ({
      ...state,
      P2SQRDeck: state.P2SQRDeck - 1
    }),
    updateP1draw: (state, action: PayloadAction<boolean>) => ({
      ...state,
      canP1draw: action.payload
    }),
    updateP2draw: (state, action: PayloadAction<boolean>) => ({
      ...state,
      canP2draw: action.payload
    }),
    addP1bones: (state, action: PayloadAction<number>) => ({
      ...state,
      P1Bones: state.P1Bones + action.payload
    }),
    addP2bones: (state, action: PayloadAction<number>) => ({
      ...state,
      P2Bones: state.P2Bones + action.payload
    }),
    updateHand: (state, action: PayloadAction<Field>) => ({
      ...state,
      handCards: action.payload,
      movedCardID: undefined
    }),
    updateLeshiField: (state, action: PayloadAction<Field>) => ({
      ...state,
      leshiField: action.payload
    }),
    updateField: (state, action: PayloadAction<Field>) => ({
      ...state,
      fieldCards: action.payload
    }),
    updateSacrificeCount: (state, action: PayloadAction<number>) => ({
      ...state,
      pendingSacr: action.payload !== 0 ? state.pendingSacr + action.payload : 0,
    }),
    setShowRules: (state, action: PayloadAction<boolean>) => ({
      ...state,
      showRules: action.payload,
    }),
    setRules: (state, action: PayloadAction<RuleType>) => ({
      ...state,
      rules: action.payload,
    }),
    setWarning: (state, action: PayloadAction<warningToast>) => ({
      ...state,
      warningToast: action.payload,
    }),
    filterBones: (state) => ({
      ...state,
      P1Deck: [...state.P1Deck].filter((c) => c.bone === 0),
      P2Deck: [...state.P2Deck].filter((c) => c.bone === 0),
    }),
    turnClock: (state, action: PayloadAction<{ turnedField: Field, usedWatches?: any }>) => ({
      ...state,
      rules: {
        ...state.rules,
        useWatches: action.payload.usedWatches || state.rules.useWatches
      },
      fieldCards: action.payload.turnedField
    }),
    setHammer: (state) => ({
      ...state,
      hammer: !state.hammer,
    }),
    setSecretName: (state, action: PayloadAction<string>) => ({
      ...state,
      secretName: action.payload,
    }),
    setShowSidebarInfo: (state, action: PayloadAction<boolean>) => ({
      ...state,
      showSidebarInfo: action.payload,
    }),
  }
});

export const { setCurrPlayer, setCurrPhase,
  P1DeckNextID, P1DeckSQRNextID, P2DeckNextID, P2DeckSQRNextID,
  updateP1draw, updateP2draw,
  increaseP1Live, resetLive, resetActiveEvent,
  addP1bones, addP2bones,
  setDragCardInfo, setDeleteCardHand, updateSacrificeCount,
  updateHand, updateLeshiField, updateField,
  setShowRules, setRules, setWarning,
  filterBones, turnClock, setHammer,
  setSecretName, setShowSidebarInfo } = cardSlice.actions;

export default cardSlice.reducer;
