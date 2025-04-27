import { useEffect, useState, useContext, useCallback, useMemo } from 'react';
import { AnalysisEngineContext } from '../store';
import { TDataSource } from '../types';

export default function useDataRender({ dataSource, embed, localReuse }: { dataSource: TDataSource; embed: boolean; localReuse?: boolean; }): [object, () => void] {
  const parentData = useContext(AnalysisEngineContext);
  const [engineLoaded, setEngineLoaded] = useState({});
  const isEngineLoaded = useMemo(() => {
    if (embed && !localReuse) {
      return parentData.isEngineLoaded;
    }
    return engineLoaded;
  }, [engineLoaded, parentData.isEngineLoaded]);
  const update = useCallback(() => {
    if (embed && !localReuse) {
      if (typeof parentData.update === 'function') {
        parentData.update()
      } else {
        console.error('内嵌模式下未找到更新函数');
        setEngineLoaded({});
      }
    } else {
      setEngineLoaded({});
    }
  }, [embed, localReuse, parentData.update]);

  useEffect(() => {
    setEngineLoaded({});
  }, [dataSource]);

  return [
    isEngineLoaded,
    update,
  ]
}