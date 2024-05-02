import React, { useState } from "react";
import { Sidebar } from 'primereact/sidebar';
import { Dropdown } from 'primereact/dropdown';
import { useAppDispatch, useAppSelector } from "./hooks.ts";
import { CardType, setShowSidebarInfo } from "./cardReducer.tsx";
import { sigil_def } from "./const/families.tsx";

export default function SidebarCardInfo(props: {
  dialogOptions: { label: string; items: CardType[]; }[]
}): JSX.Element {
  const dispatch = useAppDispatch();
  const showSidebarInfo: boolean = useAppSelector((state) => state.card.showSidebarInfo);
  const [selCardInfo, setSelCardInfo] = useState<CardType>();

  const sigilDefinition = (sigil: string | undefined) => {
    if (sigil && sigil !== 'empty') {
      const trad = sigil_def.find((def) => def.name === sigil)?.trad
      return sigil + ': ' + trad;
    }
    return ''
  }

  return (
    <Sidebar
      visible={showSidebarInfo}
      position="right"
      header='Card info'
      onHide={() => { dispatch(setShowSidebarInfo(true)); setSelCardInfo(undefined) }}>
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
            <p>{sigilDefinition(selCardInfo.sigils[0])} </p>
            <p>{sigilDefinition(selCardInfo.sigils[1])} </p>
            <p>{sigilDefinition(selCardInfo.sigils[2])} </p>
            <p>{sigilDefinition(selCardInfo.sigils[3])} </p>
          </>}
        </> : <p>select a card from the upper menu first</p>
      }
    </Sidebar>
  );
}
