import { deepCopy } from './tools';

/**
 *
 * @param str
 * @returns Boolean
 */
const shouldParse = (str: string) => {
  return /^{.*}$/.test(str);
};

/**
 *
 * @param {*} sourceData 需要格式化的layout数据
 */
const formatData = (sourceData: any): any => {
  try {
    const localData = localStorage.getItem('WANG_YI_EXTENSION_MOBILE');
    if (localData) {
      const { toggle, data } = JSON.parse(localData);
      // 如果启用localStorage且非生产环境，则进行格式化sourceData
      if (toggle) {
        const copyData = deepCopy(sourceData);
        const fn = (sD: any) => {
          const { widget, childrens, defaultValue, value, dataBind } = sD;
          // 如果没有初始值则考虑使用localStorage中的数据
          if (!value && (!defaultValue || typeof defaultValue === 'object')) {
            const mapI = data.find((i: any) => i.widget === widget && i.dataBind === dataBind);
            if (mapI) {
              const { value: mapIVal } = mapI;
              sD.defaultValue = shouldParse(mapIVal) ? JSON.parse(mapIVal) : mapIVal;
            }
          }
          if (Array.isArray(childrens)) {
            childrens.forEach((child) => {
              fn(child);
            });
          }
        };
        fn(copyData);
        return copyData;
      }
    }
  } catch (e) {
    console.error('extension formatData e:', e);
  }
  return sourceData;
};

export {
  shouldParse,
  formatData,
};
