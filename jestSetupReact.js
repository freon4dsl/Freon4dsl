/* eslint-disable import/no-extraneous-dependencies */
const React = require('react');
const Enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');

// jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

// React 16 Enzyme adapter
Enzyme.configure({ adapter: new Adapter() });

// Make Enzyme functions and React available in all test files without importing
global.React = React;
global.shallow = Enzyme.shallow;
global.render = Enzyme.render;
global.mount = Enzyme.mount;

// global mocks
/* eslint-disable-next-line */
window.alert = jest.fn(msg => console.log(msg));
/* eslint-disable-next-line */
global.alert = jest.fn(msg => console.log(msg));
