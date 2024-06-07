import React, { useState } from "react";
import "./css/LifeCounter.scss";
import { Dialog } from 'primereact/dialog';
import { useAppDispatch, useAppSelector } from "./hooks.ts";
import { resetLive, setWarning } from "./cardReducer.tsx";
import { Button } from "primereact/button";
import { DrawFromBoss } from "./utils.tsx";

export default function LifeCounter(props: {
  owner: number
}): JSX.Element {
  const dispatch = useAppDispatch();
  const { owner } = props;

  const secretName: string = useAppSelector((state) => state.card.secretName);
  const live: number = useAppSelector((state) =>
    owner === 1 ? state.card.P1Live : state.card.P2Live);
  const myCandle = useAppSelector((state) =>
    owner === 1 ? state.card.rules.useCandles.P1 : state.card.rules.useCandles.P2);
  const oppCandle = useAppSelector((state) =>
    owner === 1 ? state.card.rules.useCandles.P2 : state.card.rules.useCandles.P1);
  const rules = useAppSelector((state) => state.card.rules);
  const playerLabel = secretName && owner === 2 ? secretName : "Player" + owner;
  const [playerSurrender, setPlayerSurrender] = useState<boolean>(false);

  const isGameOver = () => {
    if (+live <= 0 || playerSurrender) {
      if (myCandle !== true)
        return true
      else {
        const candles = {
          P1: owner === 1 ? false : oppCandle,
          P2: owner === 2 ? false : oppCandle
        }
        dispatch(setWarning({ message: 'P' + owner + ' has lost its candle!', severity: 'warning' }));
        dispatch(resetLive(candles));
        DrawFromBoss(owner === 1, rules, dispatch);
      }
    }
    return false
  };
  const onRestart = () => {
    window.location.reload();
  };

  return (
    <>
      {rules.isMultiplayer < 4 ?
        <>
          <h3 className={"live-counter-" + live + " m-0"}>{playerLabel}</h3>
          <h3 className={"live-counter-" + live + " m-0"}>{'lives: ' + live + '♥'
            + ((rules.useCandles.P1 || rules.useCandles.P2) ?
              (' and ' + ((owner === 1 && rules.useCandles.P1) || (owner === 2 && rules.useCandles.P2))
                ? '1🕯' : '0🕯') : '')}</h3>
        </>
        : <Button className="surrender-button" label={'Surrender!'} onClick={() => setPlayerSurrender(true)} />
      }

      <Dialog header="Game over!" visible={isGameOver()} className="game-over-dialog" onHide={onRestart}>
        <p className="m-0">
          {playerLabel + " has lost, close this popup to restart"}
        </p>
      </Dialog>
    </>
  );
}
