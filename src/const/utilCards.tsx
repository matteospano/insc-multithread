import { CardType } from "../cardReducer"

export const EMPTY_CARD: CardType = {
  cardXY: -1, cardN: -1, name: '', family: 'none', atk: 0, def: 0, sacr: 0,
  dropBlood: 0, dropBones: 0,
}

/* BASE */
export const squirrel: CardType = {
  name: "squirrel",
  family: "squirrel",
  cardXY: -1, cardN: -1,
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
  cardXY: -1, cardN: -1,
  atk: 0,
  def: 4,
  sacr: 0,
  bone: 0,
  dropBlood: -1,
  dropBones: 0,
  sigils: [999]
}

/* SUPPORTO */
//coda, diga, campana
export const egg: CardType = {
  name: "raven egg",
  family: "bird",
  cardXY: -1, cardN: -1,
  atk: 0,
  def: 2,
  sacr: 0,
  bone: 0,
  dropBlood: -1,
  dropBones: 0,
  sigils: [401]
}
export const tail: CardType = {
  name: "tail of ",
  family: "none",
  cardXY: -1, cardN: -1,
  atk: 0,
  def: 2,
  sacr: 0,
  bone: 0,
  dropBlood: -1,
  dropBones: 0,
  sigils: [403]
}
export const bell: CardType = {
  name: "bell",
  family: "terrain",
  cardXY: -1, cardN: -1,
  atk: 0,
  def: 2,
  sacr: 0,
  bone: 0,
  dropBlood: -1,
  dropBones: 0,
  sigils: [605]
}
export const dinamite: CardType = {
  name: "dinamite",
  family: "terrain",
  cardXY: -1, cardN: -1,
  atk: 0,
  def: 1,
  sacr: 0,
  bone: 0,
  dropBlood: -1,
  dropBones: 0,
  sigils: [300]
}

/* BOSS ed EVENTI */
export const hunter: CardType = {
  name: "the Hunter",
  family: "none",
  cardXY: -1, cardN: -1,
  atk: 3,
  def: 4,
  sacr: 0,
  bone: 0,
  dropBlood: 1,
  dropBones: 1,
  sigils: [208, 971, 972, 600] //trap, regression, turret, blockFly
}
export const prospector: CardType = {
  name: "Prospector",
  family: "none",
  cardXY: -1, cardN: -1,
  atk: 2,
  def: 6,
  sacr: 0,
  bone: 0,
  dropBlood: 1,
  dropBones: 1,
  sigils: [208, 970, 600] //TODO sostituisci 208 con sigillo mulo in amno ad avv, guardian, blockFly
}
export const angler: CardType = {
  name: "the Angler",
  family: "none",
  cardXY: -1, cardN: -1,
  atk: 3,
  def: 1,
  sacr: 0,
  bone: 0,
  dropBlood: 1,
  dropBones: 1,
  sigils: [70, 640, 600] //water, smell, blockFly
}
export const necromancer: CardType = {
  name: "Necromancer",
  family: "none",
  cardXY: -1, cardN: -1,
  atk: 3,
  def: 1,
  sacr: 0,
  bone: 0,
  dropBlood: 1,
  dropBones: 1,
  sigils: [208, 600] //TODO fertilità zombie non 208, blockFly
}

//pirate(Limoncello) aggiungi sig lancia dinamite