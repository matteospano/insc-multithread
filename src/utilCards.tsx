import { CardType } from "./cardReducer"

export const EMPTY_CARD: CardType = {
  cardID: -1, name: '', family: 'none', atk: 0, def: 0, sacr: 0,
  dropBlood: 0, dropBones: 0
}

/* BASE */
export const squirrel: CardType = {
    name: "squirrel",
    family: "squirrel",
    cardID: -1,
    atk: 0,
    def: 1,
    sacr: 0,
    bone: 0,
    dropBlood: 1,
    dropBones: 1
  }
  export const rock: CardType = {
    name: "rock",
    family: "terrain",
    cardID: -1,
    atk: 0,
    def: 4,
    sacr: 0,
    bone: 0,
    dropBlood: -1,
    dropBones: 0,
    sigils:[205]
  }

  /* SUPPORTO */
  //coda, diga, campana
  export const egg: CardType = {
    name: "raven egg",
    family: "avian",
    cardID: -1,
    atk: 0,
    def: 2,
    sacr: 0,
    bone: 0,
    dropBlood: -1,
    dropBones: 0,
    sigils: [401]
  }

  /* EVENTI */
  export const hunter: CardType = {
    name: "Bounty Hunter",
    family: "none",
    cardID: -1,
    atk: 3,
    def: 4,
    sacr: 0,
    bone: 0,
    dropBlood: 1,
    dropBones: 1,
    sigils: [900]
  }