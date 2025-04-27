import { useContext, useRef } from 'react';
import { DataRenderContext, IDataRenderContext } from '../store';

export default function useDataRender({ embed, localReuse }: { embed: boolean; localReuse?: boolean; }): IDataRenderContext {
  const parentText = useContext(DataRenderContext);
  const objref = useRef({});

  if (embed) {
    if (localReuse) {
      return objref.current;
    }

    return parentText;
  }

  return objref.current;
}