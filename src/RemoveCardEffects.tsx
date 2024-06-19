import "./css/Card.scss";
import {
  CardType,
  updateField
} from "./cardReducer.tsx";
import { useAppDispatch } from "./hooks.ts";
import { EMPTY_CARD } from "./const/utilCards.tsx";

export default function RemoveCardEffects(
  card: CardType, mySide: CardType[], avvSide: CardType[], movedTo: number): CardType {
  //const dispatch = useAppDispatch();
  //todo solve dispatch and
  //todo solve card onspawn rimane copia in mano

  const removeEffects = (): CardType => {
    if ((!card.sigils) || card.sigils.length === 0)
      return card
    const index = card.cardID < 200 ? card.cardID - 100 : card.cardID - 200;
    const hasAlarm = card.sigils.includes(170);
    const hasSmell = card.sigils.includes(171);
    const hasLeader = card.sigils.includes(150);
    let tempSide = [...mySide];
    let oppSide = [...avvSide];
    if (hasAlarm || hasSmell) {
      const delta = hasAlarm ? -1 : +1;
      oppSide[index] = { ...oppSide[index], atk: oppSide[index].atk + delta };
      if (movedTo >= 0 && oppSide[index].cardID !== -1)
        oppSide[movedTo] = { ...oppSide[movedTo], atk: oppSide[movedTo].atk - delta };
    }
    if (hasLeader) {
      if (index > 0)
        tempSide[index - 1] = { ...tempSide[index - 1], atk: tempSide[index - 1].atk - 1 };
      if (index < 4)
        tempSide[index + 1] = { ...tempSide[index + 1], atk: tempSide[index + 1].atk - 1 };
      if (movedTo >= 0) {
        if (movedTo > 0)
          tempSide[movedTo - 1] = { ...tempSide[movedTo - 1], atk: tempSide[movedTo - 1].atk + 1 };
        if (movedTo < 4)
          tempSide[movedTo + 1] = { ...tempSide[movedTo + 1], atk: tempSide[movedTo + 1].atk + 1 };
      }
    }
    if (hasAlarm || hasSmell || hasLeader) { //sono avvenuti cambiamenti
      const isP1: boolean = card.cardID < 200;
      if (movedTo === -2) //destroyed with hammer
        tempSide[index] = EMPTY_CARD;
      //todo l'indice della carta è sbagliato onSpawn.
      //todo il dispatch va messo fino alla ondeath( o spostala in un file a parte)
      debugger
      //dispatch(updateField({ P1side: isP1 ? tempSide : oppSide, P2side: isP1 ? oppSide : tempSide }))
    }
    return card
  }

  return removeEffects()
}
