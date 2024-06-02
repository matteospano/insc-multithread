import React, { useState } from "react";
import { Sidebar } from 'primereact/sidebar';
import { Dropdown } from 'primereact/dropdown';
import { useAppDispatch, useAppSelector } from "./hooks.ts";
import { CardType, setShowSidebarInfo } from "./cardReducer.tsx";
import { sigilDefinition } from "./utils.tsx";

export default function InfoSidebar(props: {
  dialogOptions: { label: string; items: CardType[]; }[]
}): JSX.Element {
  const dispatch = useAppDispatch();
  const showSidebarInfo: boolean = useAppSelector((state) => state.card.showSidebarInfo);
  const [selCardInfo, setSelCardInfo] = useState<CardType>();
  // TODO if isMultiplayer===4 la carta selezionata può essere editata di nome, costo, atk, def e sigilli

  return (
    <Sidebar
      visible={showSidebarInfo}
      position="right"
      header='Card info'
      onHide={() => { dispatch(setShowSidebarInfo(false)); setSelCardInfo(undefined) }}>
      <Dropdown
        value={selCardInfo}
        placeholder="select a card to view its details"
        options={props.dialogOptions}
        optionGroupLabel="label"
        optionGroupChildren="items"
        optionLabel="name"
        //filter
        onChange={(data) => setSelCardInfo(data.value)}
        className="mt-1"
      />
      {selCardInfo?.name ?
        <>
          <p>Cost: {selCardInfo?.sacr || selCardInfo?.bone}
            {selCardInfo?.bone ? ' bones' : ' sacrifices'}</p>
          <p>{'Family: ' + selCardInfo?.family}</p>
          {selCardInfo.sigils && <>
            <p>Sigils:</p>
            <p>{sigilDefinition(selCardInfo.sigils[0] || -1)} </p>
            <p>{sigilDefinition(selCardInfo.sigils[1] || -1)} </p>
            <p>{sigilDefinition(selCardInfo.sigils[2] || -1)} </p>
            <p>{sigilDefinition(selCardInfo.sigils[3] || -1)} </p>
          </>}
        </> : <p>select a card from the upper menu first</p>
      }
      {/* general info:
      {isMultiplayer===0 && ''} */}
    </Sidebar>
  );
}
