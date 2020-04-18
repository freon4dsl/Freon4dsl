import { App } from "../projectit-webapp/App";
import * as ReactDOM from 'react-dom';
import * as React from 'react';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});
