import { useContext, useMemo } from 'react';
import { ValidateUtils } from '../../utils/validates';
import { AnalysisEngineContext } from '../store';
import { TDataSource } from '../types';

export default function useDataRender({ dataSource, embed, localReuse }: { dataSource: TDataSource; embed: boolean; localReuse?: boolean; }) {
  const parentData = useContext(AnalysisEngineContext);
  const errorObject = useMemo(() => {
    if (embed && !localReuse && parentData.errorObject instanceof ValidateUtils) {
      return parentData.errorObject;
    }

    return new ValidateUtils();
  }, [dataSource, embed, localReuse]);

  return errorObject;
}