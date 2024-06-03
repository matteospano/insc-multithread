export const families = [ //TODO {nome: cervi, name: deers}
  'cervi',
  'lupi',
  'insetti',
  'rettili',
  'uccelli',
  'robots',
  'scoiattoli',
  'rocce',
  'nessuna'
];

export interface SigilDefType {
  id: number, /*phase nella prima cifra: 0/1 spawn, 1/2/3 death, 3/4 evolve, 5 atk, 6 def, 8 turn over, 9 solo listener
              listerers nella seconda cifra: 5/6 fr_spawn, 6/7 en_spawn  9 en_atk*/
  name: string,
  totem?: boolean, /* flag valid for totem */
  trad: string
}

export const sigil_def: SigilDefType[] = [
  { id: 170, name: 'alarm', totem: true, trad: 'Enemy placed (or already placed) in front of this card: it gaigns 1 atk' }, //onSpawn, onDeath, listen: 'en_spawn'
  { id: 200, name: 'apple', trad: 'Sacrificed: the new card gaigns its atk and def' }, //onDeath
  { id: 500, name: 'atk2', trad: 'Atk enemies on its sides if available' }, //onAtk
  { id: 501, name: 'atk3', trad: 'Atk enemies in front and on its sides if available' }, //onAtk
  { id: 100, name: 'bells', trad: 'Spawn bells on its sides, they die with him' }, //onSpawn, onDeath
  { id: 600, name: 'blockFly', totem: true, trad: 'Blocks front enemy fly attak' }, //onDef
  //{ name: 'bloodLust', trad: 'aaa' },
  { id: 201, name: 'bomb', trad: 'Death: it will explode and cause damage to its front enemy and side cards' }, // onDeath
  { id: 400, name: 'boneDigger', trad: 'Every new turn it makes you gaign bone' }, //onEvolve
  { id: 601, name: 'burrower', totem: true, trad: 'It moves to any empty space that is attacked by an enemy to block it' }, //onDef
  { id: 202, name: 'degnoSacr', trad: 'Sacrificed: it counts as 3 blood' }, //onDeath
  //{ name: 'doubleDeath', trad: 'aaa' },
  { id: 300, name: 'dinamite', trad: 'Next turn (or on its death) it will explode and cause damage to its front enemy and side cards (even if it is still in your hand)' }, //onDeath, onEvolve
  { id: 1, name: 'egg', trad: 'If enemy field is empty add an egg that may become a bird' }, //onSpawn
  { id: 401, name: 'evolve', totem: true, trad: 'Evolves itself in a stronger form at the start of its next turn' }, // onEvolve
  { id: 502, name: 'fly', trad: 'It can attack directly the opponent (but still be blocked by the block sigil)' }, //onAtk
  { id: 402, name: 'fragile', trad: 'Destroy itself at the start of its next turn' }, //onEvolve
  //{ name: 'gemme', trad: 'aaa' },
  //{ name: 'ghost', trad: 'aaa' },
  { id: 970, name: 'guardian', totem: true, trad: 'It moves in front of the last enemy spawn' }, //listen: 'en_spawn'
  { id: 602, name: 'helper', trad: 'if enemy attaks, the spawner of this card will strike back' },//onDef todo sigillo proprio delle campane
  { id: 203, name: 'immortal', trad: 'When this card perishes in a battle, a copy of it enters your hand' }, //onDeath
  { id: 204, name: 'infSacrifice', trad: 'When this card is sacrificed, it does not perish' }, //onDeath
  { id: 150, name: 'leader', trad: 'Creatures adjacent to this card gain 1 def' }, //onSpawn, onDeath, listen: 'fr_spawn'
  { id: 205, name: 'looter', trad: 'This card is not a valid sacrifice' }, //onDeath
  //{ name: 'magicHand', trad: 'aaa' },
  { id: 800, name: 'push', totem: true, trad: 'At the end of each turn, it inverts its position with the card at its right' }, //onTurnOver
  { id: 900, name: 'random', totem: true, trad: 'This sigil is replaced by a random sigil' },
  { id: 971, name: 'regression', totem: true, trad: 'Blocks enemies on the ground and the spawned ones from evolving' }, //listen: 'en_spawn',
  //{ id: 999, name: 'scavenger', trad: 'aaa' },
  { id: 206, name: 'shield', trad: 'It absorbs the first damage dealt' }, //onDef
  { id: 70, name: 'smell', totem: true, trad: 'It decrease opposing enemy atk by one' }, //onSpawn: true, listen: 'en_spawn'
  { id: 207, name: 'snakeBomb', trad: 'Death: gifts 3 cards from your deck to your opponent' }, //onDeath
  { id: 503, name: 'sniper', trad: 'Chooses which opposing spaces to strike' }, //onAtk
  { id: 603, name: 'spikes', totem: true, trad: 'When being attacked, inflicts 1 damage to the attacker' }, //onDef
  { id: 209, name: 'tail', trad: 'When this card is going to die, it moves on the right (if possible) and drops a tail' }, //onDeath: true
  { id: 208, name: 'trap', trad: 'When this card dies, the card opposing it also dies' }, //onDeath: true
  { id: 972, name: 'turret', trad: 'From now on, when an enemy is spawn in fron of it, it takes 1 damage' }, //listen: 'en_spawn'
  //{ name: 'vampire', trad: 'aaa' },
  { id: 801, name: 'water', totem: true, trad: 'At the end of each turn, this card submerge and leave an empty space' } //onTurnOver
];