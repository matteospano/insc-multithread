import { CardType } from "./cardReducer"

/* BASE */
export const squirrel: CardType = {
    name: "scoiattolo",
    family: "scoiattoli",
    cardID: -1,
    atk: 0,
    def: 1,
    sacr: 0,
    bone: 0,
    dropBlood: 1,
    dropBones: 1
  }
  export const rock: CardType = {
    name: "roccia",
    family: "rocce",
    cardID: -1,
    atk: 0,
    def: 4,
    sacr: 0,
    bone: 0,
    dropBlood: -1,
    dropBones: 0
  }

  /* SUPPORTO */
  //coda, diga, campana
  export const egg: CardType = {
    name: "uovo",
    family: "uccelli",
    cardID: -1,
    atk: 0,
    def: 2,
    sacr: 0,
    bone: 0,
    dropBlood: -1,
    dropBones: 0,
    sigils: ['evolve']
  }

  /* EVENTI */
  export const hunter: CardType = {
    name: "Bounty Hunter",
    family: "nessuna",
    cardID: -1,
    atk: 3,
    def: 4,
    sacr: 0,
    bone: 0,
    dropBlood: 1,
    dropBones: 1
  }