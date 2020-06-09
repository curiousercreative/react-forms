import React from 'react';

import FormCollectionDirect from './components/FormCollectionDirect.jsx';
import FormCollectionExtended from './components/FormCollectionExtended.jsx';
import FormComplex from './components/FormComplex.jsx';
import FormDirect from './components/FormDirect.jsx';
import FormExtended from './components/FormExtended.jsx';

import '@curiouser/react-forms/dist/index.css'

let collectionValues = [{
  username: 'chuck',
  password: 'berry',
  id: 9,
}];



class App extends React.Component {
  state = {
    collectionValues: [{
      username: 'chuck',
      password: 'berry',
      id: 9,
    }],
  };

  deleteCollectionItem = (data) => {
    this.setState({
      collectionValues: collectionValues.filter(({ id }) => id !== data.id),
    });

    return Promise.resolve();
  }

  render () {
    const collectionProps = {
      delete: this.deleteCollectionItem,
      values: this.state.collectionValues,
    };

    return (
      <div>
        <h2>Simple Form extended</h2>
        <FormExtended />
        <h2>Simple Form direct render</h2>
        <FormDirect />
        <h2>Simple Form collection extended</h2>
        <FormCollectionExtended {...collectionProps} />
        <h2>Simple Form collection direct</h2>
        <FormCollectionDirect {...collectionProps} />
        <h2>Complex Form with nested collection</h2>
        <FormComplex collectionProps={collectionProps} />
      </div>
    );
  }
}

export default App
