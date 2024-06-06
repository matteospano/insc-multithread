import React, { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { useAppDispatch, useAppSelector } from "./hooks.ts";
import './css/CustomToast.scss'
import { EMPTY_TOAST, Field, setWarning, updateSacrificeCount } from './cardReducer.tsx';
import { handleClock } from './utils.tsx';

export const CustomToastSacr = () => {
  const dispatch = useAppDispatch();
  const warningToast = useAppSelector((state) => state.card.warningToast);

  const pendingSacr = useAppSelector((state) => state.card.pendingSacr);
  const currentWatches = useAppSelector((state) => state.card.rules.useWatches);
  const fieldCards: Field = useAppSelector((state) => state.card.fieldCards);

  const moveClock = (isClockwise: boolean, canTurn: boolean) => {
    if (canTurn) {
      const usedWatches = warningToast.subject === 'Player1' ?
        { P1: false, P2: currentWatches.P2 } : { P1: currentWatches.P1, P2: false };
      handleClock(fieldCards, isClockwise, dispatch, usedWatches);
    }
  }

  const handleToastClose = () => {
    if (warningToast.message === 'sacrifices')
      dispatch(updateSacrificeCount(0))
    dispatch(setWarning(EMPTY_TOAST));
  };

  const toastBody = (): string => {
    //console.log(warningToast.subject, warningToast.message)
    switch (warningToast.message) {
      case ('must_draw'):
        return "Don't rush, you must draw first!";
      case ('cant_draw'):
        return "You can't draw now!";
      case ('action_pause_phase'):
        return "You can't perform this action during pause phase";
      case ('sacrifices'):
        return 'Pending sacrifices: ' + pendingSacr;//o mettilo in un paraetro facoltativo warningToast.props
      case ('sacrifices_needed'):
        return "You need more blood to spawn " + warningToast.props;
      case ('bones_needed'):
        return "You need more bones to spawn " + warningToast.props;
      case ('lost_candle'):
        return 'Lost its candle!';
      case ('fly_attack'):
        return 'Fly attacks';
      case ('dies'):
        return 'dies';
      case ('fragile'):
        return 'Dies because it was too fragile';
      case ('evolves'):
        return 'Evolves into ' + warningToast.props;
      case ('direct_attack'):
        return 'Attacks directly the opponent';
      case ('not_your_clock'):
        return "You are not allowed to touch your opponent's clock";
      case ('use_clock'):
        return 'How do you want to turn the field?';
      case ('use_hammer'):
        return 'Hold your hammer...';
      case ('secret_name'):
        return 'You are playing against ' + warningToast.props;

      default:
        return 'Generic error'
    }
  }

  //TODO icona modalità debug. Apre un form che setta tutte le stats e sigilli della carta selezionata

  return (
    <div className={'custom-toast' + (warningToast.severity !== 'close' ? 'show' : '')
      + (' toast-' + warningToast.severity)}>
      <div className="toast-title">
        {warningToast.subject && <h4 className='ml-1'>{warningToast.subject}</h4>}
        <Button label='x' className='rounded' onClick={handleToastClose} />
      </div>
      <h4 className="toast-detail">{toastBody()}</h4>
      {
        warningToast.message === 'use_clock' && <>
          <Button label='clockwise' className='rounded'
            onClick={() => {
              moveClock(true, warningToast.subject === 'Player1'
                ? currentWatches.P1 : currentWatches.P2); handleToastClose();
            }} />
          <Button label='anticlockwise' className='rounded'
            onClick={() => {
              moveClock(false, warningToast.subject === 'Player1'
                ? currentWatches.P1 : currentWatches.P2); handleToastClose();
            }} />
          <Button label='save it for later' className='rounded' onClick={handleToastClose} />
        </>
      }
    </div>
  );
};
