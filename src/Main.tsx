import { useState } from "react";
import "./css/App.scss";
import { Button } from "primereact/button";
import LifeCounter from "./LifeCounter.tsx";
import React from "react";
import { useAppSelector, useAppDispatch } from "./hooks.ts";
import {
  CardType,
  Field,
  setHammer,
  setShowRules,
  setShowSidebarInfo,
  setWarning
} from "./cardReducer.tsx";
import Deck from "./Deck.tsx";
import { CustomToastSacr } from "./CustomToast.tsx";
import RuleDialog from "./RuleDialog.tsx";
import InfoSidebar from "./InfoSidebar.tsx";
import PlayerTurn from "./PlayerTurn.tsx";
import CardSlots from "./wrappers/CardSlots.tsx";
import LeshiLines from "./wrappers/LeshiLines.tsx";
import PlayerCards from "./wrappers/PlayerCards.tsx";

export interface Evolution {
  cardName: string,
  into: CardType
}

function Main() {
  const dispatch = useAppDispatch();
  const handCards: Field = useAppSelector((state) => state.card.handCards);
  const currPlayer: number = useAppSelector((state) => state.card.currPlayer);
  const P1Bones: number = useAppSelector((state) => state.card.P1Bones);
  const P2Bones: number = useAppSelector((state) => state.card.P2Bones);
  const fieldCards: Field = useAppSelector((state) => state.card.fieldCards);
  const rules = useAppSelector((state) => state.card.rules);
  const showRules = useAppSelector((state) => state.card.showRules);
  const hammer = useAppSelector((state) => state.card.hammer);

  const [dialogOptions, setDialogOptions] = useState<{ label: string; items: any[]; }[]>([]);

  const onDialodOpen = () => {
    let basicOptions = [
      { label: "P2 field side:", items: [...fieldCards.P2side.filter((c) => c.name)] },
      { label: "P1 field side:", items: [...fieldCards.P1side.filter((c) => c.name)] }]
    dispatch(setShowSidebarInfo(true));
    if (currPlayer === 2)
      basicOptions.unshift({ label: "P2 hand side:", items: [...handCards.P2side] })
    else if (currPlayer === 1)
      basicOptions.push({ label: "P1 hand side:", items: [...handCards.P1side] })
    setDialogOptions(basicOptions)
  }

  return (
    <div className="App">
      {showRules !== false && <RuleDialog />}
      <div className="player-side">
        <div className="player-cards-area pt-1">
          <div className="decks-area ml-2">
            <Deck owner={2} />
          </div>
          {rules.isMultiplayer > 0 ? <LeshiLines owner={2} /> : <PlayerCards owner={2} />}
          <CustomToastSacr />
        </div>
      </div>
      <div className="board">
        <div className="side-stats ml-1">
          <>
            <LifeCounter owner={2} />
            {(rules.useCandles.P1 || rules.useCandles.P2)
              && <h3 className="m-0">{"Lit candles: " + (rules.useCandles.P2 ? '1' : '0')}</h3>}
            {rules.useBones && <h3 className="m-0">{"Bones: " + P2Bones}</h3>}
          </>
          <PlayerTurn />
          <>
            {rules.useBones && <h3 className="m-0">{"Bones: " + P1Bones}</h3>}
            {(rules.useCandles.P1 || rules.useCandles.P2)
              && <h3 className="m-0">{"Lit candles: " + (rules.useCandles.P1 ? '1' : '0')}</h3>}
            <LifeCounter owner={1} />
          </>
        </div>
        <div className="board-grids">
          <CardSlots owner={2} />
          <CardSlots owner={1} />
        </div>
        <div className="flex side-info">
          <Button
            aria-label='cards info'
            label='cards info'
            onClick={onDialodOpen} />

          {rules.useWatches.P2 && <div className="clock-image"
            onClick={() => currPlayer === 2 ?
              dispatch(setWarning({
                message: 'use_clock',
                subject: 'Player' + currPlayer,
                severity: 'action'
              })) :
              dispatch(setWarning({
                message: 'not_your_clock',
                subject: currPlayer ? 'Player' + currPlayer : 'Pause phase',
                severity: 'error'
              }))} />}

          {rules.useHammer && <div className={"hammer-image"
            + (hammer ? " hammer-selected" : '')}
            onClick={() => {
              currPlayer ? hammer ?
                dispatch(
                  setWarning({
                    message: 'close_hammer', //close dialog
                    subject: 'Player' + currPlayer,
                    severity: 'close'
                  })) :
                dispatch(
                  setWarning({
                    message: 'use_hammer',
                    subject: 'Player' + currPlayer,
                    severity: 'warning'
                  })) :
                dispatch(
                  setWarning({
                    message: 'action_pause_phase',
                    subject: 'Pause phase',
                    severity: 'error'
                  }));
              currPlayer && dispatch(setHammer())
            }} />}

          {rules.useWatches.P1 && <div className="clock-image"
            onClick={() => currPlayer === 1 ?
              dispatch(setWarning({
                message: 'use_clock',
                subject: 'Player' + currPlayer,
                severity: 'action'
              })) :
              dispatch(setWarning({
                message: 'not_your_clock',
                subject: currPlayer ? 'Player' + currPlayer : 'Pause phase',
                severity: 'error'
              }))
            } />}

          <Button
            aria-label='rules info'
            label='rules info'
            onClick={() => dispatch(setShowRules(true))} />
        </div>
      </div>
      <div className="player-side">
        <div className="player-cards-area pt-1">
          <PlayerCards owner={1} />
          <div className="decks-area">
            <Deck owner={1} />
          </div>
        </div>
      </div>
      <InfoSidebar dialogOptions={dialogOptions} />
    </div>
  );
}

export default Main;
