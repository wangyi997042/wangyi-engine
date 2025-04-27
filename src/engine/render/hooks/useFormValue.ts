import { useContext, useMemo } from 'react';
import { AnalysisEngineContext } from '../store';
import { TDataSource } from '../types';

export default function useFormValue({ dataSource, embed, localReuse }: { dataSource: TDataSource; embed: boolean; localReuse?: boolean; }) {
  const parentData = useContext(AnalysisEngineContext);
  const formValue = useMemo(() => {
    if (embed && !localReuse) {
      return parentData.formValue;
    }

    return {};
  }, [dataSource, embed, localReuse]);

  return formValue;
}