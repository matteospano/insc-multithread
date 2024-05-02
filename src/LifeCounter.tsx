import React from "react";
import "./LifeCounter.scss";
import { Dialog } from 'primereact/dialog';
import { useAppDispatch, useAppSelector } from "./hooks.ts";
import { resetLive, setWarning } from "./cardReducer.tsx";

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
  const bountyHunter = useAppSelector((state) => state.card.rules.bountyHunter);
  const prospector = useAppSelector((state) => state.card.rules.prospector);
  const playerLabel = secretName && owner === 2 ? secretName : "Player" + owner;

  const isGameOver = () => {
    if (+live <= 0) {
      if (myCandle !== true)
        return true
      else {
        let activeEvent: string | undefined = undefined;
        if (bountyHunter && oppCandle)//solo il primo sconfitto ha diritto al vantaggio
          activeEvent = 'bountyHunter'
        else if (prospector)
          activeEvent = 'prospector'
        const candles = {
          P1: owner === 1 ? false : oppCandle,
          P2: owner === 2 ? false : oppCandle,
          activeEvent
        }
        dispatch(setWarning({ message: 'P' + owner + ' has lost its candle!', severity: 'warning' }));
        dispatch(resetLive(candles));
      }
    }
    return false
  };
  const onRestart = () => {
    window.location.reload();
  };

  return (
    <>
      <h3 className={"live-counter-" + live + " m-0"}>{playerLabel + ": " + live}</h3>
      {/* <p className="pi pi-heart" /> */}
      <Dialog header="Game over!" visible={isGameOver()} className="game-over-dialog" onHide={onRestart}>
        <p className="m-0">
          {playerLabel + " has lost, close this popup to restart"}
        </p>
      </Dialog>
    </>
  );
}
