import React from 'react';
import ReactDOM from 'react-dom';
import ContainerDimensions from 'react-container-dimensions';
import {Map} from 'immutable';
import {createStore} from 'redux';
import {Provider} from 'react-redux';

import MyCatalog from './catalog/mycatalog';

import ToolbarScreenshotButton from './ui/toolbar-screenshot-button';

import {
  Models as PlannerModels,
  reducer as PlannerReducer,
  ReactPlanner,
  Plugins as PlannerPlugins,
} from '../../index'; //react-floorplanner


//define state
let AppState = Map({
  'react-floorplanner': new PlannerModels.State()
});


//define reducer
let reducer = (state, action) => {
  state = state || AppState;
  state = state.update('react-floorplanner', plannerState => PlannerReducer(plannerState, action));
  return state;
};


//init store
let store = createStore(reducer, null, window.devToolsExtension ? window.devToolsExtension() : f => f);
let plugins = [
  PlannerPlugins.Keyboard(),
  PlannerPlugins.Autosave('react-floorplanner_v0'),
  PlannerPlugins.ConsoleDebugger(),
];

let toolbarButtons = [
  ToolbarScreenshotButton,
];

//render
ReactDOM.render(
  (
    <Provider store={store}>
      <ContainerDimensions>
        {({width, height}) =>
          <ReactPlanner catalog={MyCatalog} width={width} height={height} plugins={plugins}
                        toolbarButtons={toolbarButtons} stateExtractor={state => state.get('react-floorplanner')}
          />
        }
      </ContainerDimensions>
    </Provider>
  ),

  document.getElementById('app')
);

