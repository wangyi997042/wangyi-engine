import React from 'react';

import {
  getStore,
  addStore,
} from './store';
import {
  EngineProps,
} from '../types';

export interface RootStoreProps {
  id: string;
  data: EngineProps;
  children?: React.ReactNode;
}

const RootStoreContext = React.createContext('data');

class RootStore extends React.Component<RootStoreProps, any> {
  render() {
    const { id, data, children } = this.props;
    let store = getStore(id);

    if (!store) {
      store = data;
      addStore(data, id);
    }

    return (
      <RootStoreContext.Provider value={store}>
        {children}
      </RootStoreContext.Provider>
    );
  }
}

export default RootStore;
