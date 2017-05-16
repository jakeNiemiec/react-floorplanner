# react-planner

*react-planner* is a [React][react] component which can be used to draw model buildings. Drag & drop from a catalog of customizable and ready-to-use objects, you can start from 2D wireframes and land on 3D models. As a developer you can provide your users with new objects by adding them to the catalog.

[![npm][npm_label]][npm_link]
![javascript][js]
![react-version][react_version]

# Demo

[Demo][demo]

[![react-planner][preview_image]][demo]


# Usage

``` es6
import React from 'react';
import ReactDOM from 'react-dom';
import {Map} from 'immutable';
import {createStore} from 'redux';
import {Provider} from 'react-redux';

//download this demo catalog https://github.com/cvdlab/react-planner/tree/master/demo/src/catalog
import MyCatalog from './catalog/mycatalog';

import {
  Models as PlannerModels,
  reducer as PlannerReducer,
  ReactPlanner,
  Plugins as PlannerPlugins,
} from 'react-planner';


//define state
let AppState = Map({
  'react-planner': new PlannerModels.State()
});

//define reducer
let reducer = (state, action) => {
  state = state || AppState;
  state = state.update('react-planner', plannerState => PlannerReducer(plannerState, action));
  return state;
};

let store = createStore(reducer, null, window.devToolsExtension ? window.devToolsExtension() : f => f);

let plugins = [
  PlannerPlugins.Keyboard(),
  PlannerPlugins.Autosave('react-planner_v0'),
  PlannerPlugins.ConsoleDebugger(),
];

//render
ReactDOM.render(
  (
    <Provider store={store}>
      <ReactPlanner catalog={MyCatalog} width={800} height={600} plugins={plugins}
                    stateExtractor={state => state.get('react-planner')}
      />
    </Provider>
  ),
  document.getElementById('app')
);

```

# Docs

## &nbsp;&nbsp;&nbsp;&nbsp;*Catalog*

Catalog description
- **Catalog**: Class
  - **attributes**:
    - **elements**: Object listing all catalog elements
    - **propertyTypes**: Object listing all catalog properties
    - **unit**: String describing the linear unit
  - **methods**:
    - **getElement**: in Element `type`, out Element
    - **getPropertyType**: in Property `type`, out Property
    - **registerElement**: in Element
    - **registerPropertyType**: in Property
    - **registerMultiplePropertyType**: in Array of Properties
    - **validateElement**: in Element, out Boolean
    - **hasElement**: in Element `type`, out Boolean
- **Factories**: Folder
  - **Factory**: Elemento che descrive il tipo ( Area, Muro, … )
    - **Name**: String ( es. “area” )
    - **Prototype**: String ( es. “areas” )
    - **info**: Object
      - **title**: String ( es. “area” )
      - **tag**: Array ( es. [“area”] )
      - **group**: String ( es. “Horizontal Closure” )
      - **description**: String ( es. “Generic Room” )
      - **image**: String or webpack require image url
    - **properties**: Object; descrive le proprietà di una factory
      - **property key as “altitude”**
        - **label**: String ( es. “altitude” )
        - **type**: String rappresentante il tipo di proprietà ( es. “length-measure” )
        - **defaultValue**: Any, dipende dal ciò che si aspetta la relativa proprietà
        - **hook**: Promise, chiamata all’aggiornamento della proprietà
    - **render2D**: function, funzione di rendering 2d su svg; ritorno html in jsx
    - **render3D**: function, funzione di rendering 3d su canvas; ritorna una promise con all’interno un ThreeObject3D
  - **Factory 3D**: AKA render3D
- **Properties**: Folder
  - **Property**: React Component che descrive una proprietà assegnata al Catalogo ed utilizzabile dai componenti del catalogo stesso
    - **propTypes**
      - **value**: Any
      - **onUpdate**: function, callback on input update
      - **configs**: object, configurations for property
      - **sourceElement**: object, parent Component
      - **internalState**: object, internal state of component: used for get values from different property of the same Catalog Element

## &nbsp;&nbsp;&nbsp;&nbsp;*Actions*

This component let import all project’s Actions. The Action Objects are loaded by mapDispatchToProps function and dispatched to the reducer while catched.

- **areaActions**:
  - **selectArea**: in ( layer id, area id )
- **editingActions**:
  - **selectTooleEdit
  - **unselectAll
  - **selectLine**: in ( layer id, line id )
  - **selectHole**: in ( layer id, hole id )
  - **selectArea**: in ( layer id, area id )
  - **selectItem**: in ( layer id, item id )
  - **setProperties**: in `properties`
  - **remove**:
  - **undo**:
  - **rollback**:
- **holesActions**:
  - **selectHole**: in ( layer id, hole id )
  - **selectToolDrawingHole**: in `scene type`
  - **updateDrawingHole**: in ( layer id, x, y )
  - **endDrawingHole**: in ( layer id, x, y )
  - **beginDraggingHole**: in ( layer id, hole id, x, y )
  - **updateDraggingHole**: in ( x, y )
  - **endDraggingHole**: in ( x, y )
- **itemsActions**:
  - **selectItem**: in ( layer id, item id )
  - **selectToolDrawingItem**: in `scene type`
  - **updateDrawingItem**: in ( layer id, x, y )
  - **endDrawingItem**: in ( layer id, x, y )
  - **beginDraggingItem**: in ( layer id, item id, x, y )
  - **updateDraggingItem**: in ( x, y )
  - **endDraggingItem**: in ( x, y )
  - **beginRotatingItem**: in ( layer id, item id, x, y )
  - **updateRotatingItem**: in ( x, y )
  - **endRotatingItem**: in ( x, y )
- **linesActions**:
  - **selectLine**: in ( layer id, line id )
  - **selectToolDrawingLine**: in `scene type`
  - **beginDrawingLine**: in ( layer id, x, y, detect snap )
  - **updateDrawingLine**: in ( x, y, detect snap )
  - **endDrawingLine**: in ( x, y, detect snap )
  - **beginDraggingLine**: in ( layer id, line id, x, y, detect snap )
  - **updateDraggingLine**: in ( x, y, detect snap )
  - **endDraggingLine**: in ( x, y, detect snap )
- **projectActions**:
  - **loadProject**:
  - **newProject**:
  - **saveProject**:
  - **openCatalog**:
  - **selectToolEdit**:
  - **unselectAll**:
  - **setProperties**:
  - **setItemsAttributes**:
  - **setLinesAttributes**:
  - **setHolesAttributes**:
  - **remove**:
  - **undo**:
  - **rollback**:
  - **openProjectConfigurator**:
  - **setProjectProperties**:
  - **initCatalog**:
- **sceneActions**:
  - **selectLayer**:
  - **openLayerConfigurator**:
  - **addLayer**:
  - **setLayerProperties**:
  - **removeLayer**:
- **verticesActions**:
  - **beginDraggingVertex**:
  - **updateDraggingVertex**:
  - **endDraggingVertex**:
- **viewer2DActions**:
  - **updateCameraView**:
  - **selectToolPan**:
  - **selectToolZoomOut**:
  - **selectToolZoomIm**:
- **viewer3DActions**:
  - **selectTool4dView**:
  - **slectTool3DFirstPerson**:

## &nbsp;&nbsp;&nbsp;&nbsp;*Components*
- **Catalog View**: React component representing a list of catalog items
  - **propTypes**: TODO
    - **width**: TODO
    - **height**: TODO
    - **state**: TODO
  - **contextTypes**: TODO
    - **catalog**: TODO
    - **translator**: TODO
  - **CatalogItem**: statefull React component representing a catalog item as a cell of the catalog list
    propTypes**: TODO
      - **element**: TODO
    contextTypes**: TODO
      - **itemsActions**: TODO
      - **linesActions**: TODO
      - **holesActions**: TODO
    - **Methods**:
      - **select**: TODO
      - **render**: TODO
- **Configurator(s)**: TODO
  - **Layer Configurator**: TODO
  - **Project Configurator**: TODO
- **Sidebar**: TODO
- **Style**: TODO
- **Toolbar**: TODO
- **Viewer 2D**: TODO
- **Viewer 3D**: TODO

## &nbsp;&nbsp;&nbsp;&nbsp;*Plugins*
- **Autosave**: TODO
- **Console Debugger**: TODO
- **Keyboard**: TODO

## &nbsp;&nbsp;&nbsp;&nbsp;*Reducers*
  TODO

## &nbsp;&nbsp;&nbsp;&nbsp;*Translator*
Statefull React component allowing language translation

Methods:
- **translate**: in ( phrase, ...params ), out translated phrase
- **setLocale**: in locale language id string
- **registerTranslation**: in ( locale, translations )
- **getBrowserLanguage**: out locale language id string

Translation files are simply a key value object with:

	key: defaul word/s in english
	value: translation of the key in desired language

After registering a translation file with `registerTranslation` function, should be only called the `setLocale` function for enable that translation

# Contributing

Your contributions (issues and pull request) are very appreciated!

## Authors

- [chrvadala](https://github.com/chrvadala)
- [danilosalvati](https://github.com/danilosalvati)
- [enricomarino](https://github.com/enricomarino)
- [federicospini](https://github.com/federicospini)
- [alessiocarrafa](https://github.com/alessiocarrafa)

Developed @ [CVDLAB][cvdlab]

# License

MIT

[react]: https://facebook.github.io/react/
[npm_label]: https://img.shields.io/npm/v/react-planner.svg?maxAge=2592000?style=plastic
[npm_link]: https://www.npmjs.com/package/react-planner
[js]: https://img.shields.io/badge/javascript-ES6-fbde34.svg
[react_version]: https://img.shields.io/badge/react%20version-15.0.0%20or%20later-61dafb.svg
[preview_image]: https://raw.githubusercontent.com/cvdlab/react-planner/master/preview.png
[demo]: https://cvdlab.github.io/react-planner
[cvdlab]: http://cvdlab.org/
