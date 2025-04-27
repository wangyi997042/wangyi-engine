import { useEffect, } from 'react';
import { isObject } from '../../utils/tools';

export default function useSubScription({
  embed,
  formMoment,
  formWithMoment,
  staticDataMoment,
  initialFormDataMoment,
  setInitialFormData,
  setFormData,
  setFormWithData,
  setStaticData,
}: {
  embed: boolean;
  formMoment: { current: object; };
  formWithMoment: { current: object; };
  staticDataMoment: { current: object; };
  initialFormDataMoment: { current: object; };
  setInitialFormData: (data: object) => void;
  setFormData: (data: object) => void;
  setFormWithData: (data: object) => void;
  setStaticData: (data: object) => void;
}) {
  // 子应用订阅formData变化
  useEffect(() => {
    if (embed && isObject(formMoment.current)) {
      setFormData(formMoment.current);
    }
  }, [formMoment.current]);

  // 子应用订阅formData变化
  useEffect(() => {
    if (embed && isObject(formWithMoment.current)) {
      setFormWithData(formWithMoment.current);
    }
  }, [formWithMoment.current]);

  // 子应用订阅formData变化
  useEffect(() => {
    if (embed && isObject(staticDataMoment.current)) {
      setStaticData(staticDataMoment.current);
    }
  }, [staticDataMoment.current]);

  // 子应用订阅formData变化
  useEffect(() => {
    if (embed && isObject(initialFormDataMoment.current)) {
      setInitialFormData(staticDataMoment.current);
    }
  }, [initialFormDataMoment.current]);
}