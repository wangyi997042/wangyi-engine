export interface WindowProps extends Window {
  CRE_DATA: any;
  CRE_ACTION: any;
  wx: any;
}

export interface MethodProps {
  [propName: string]: (item?: any) => void;
}

export interface ObjectProps {
  [propName: string]: any;
}

// 链接
export interface UrlProps {
  url: string;
  // download
  name?: string;
  params?: { [key: string]: any };
  type?: string;
  // form
  method?: string;
  acceptCharset?: string;
}
