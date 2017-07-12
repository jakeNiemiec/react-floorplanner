import {ElementsSet, Vertex} from '../models';
import {IDBroker} from "./id-broker";
import * as Geometry from './geometry';

/**
 * Unselect all elements inside the ElementsSet
 * @param elements {ElementsSet} the ElementsSet of the application
 * @returns {ElementsSet} Returns the updated ElementsSet
 */
export function unselectAllElements(elements) {
  return elements.withMutations(elements => {
    unselectAllVertices(elements);
    unselectAllLines(elements);
    unselectAllHoles(elements);
    unselectAllAreas(elements);
    unselectAllItems(elements);
    elements.set('selected', new ElementsSet())
  });

}

/**
 * Unselect all vertices inside the ElementsSet
 * @param elements {ElementsSet} the current ElementsSet
 * @returns {ElementsSet} Returns the updated ElementsSet
 */
export function unselectAllVertices(elements) {
  return elements.withMutations(elements => {
    elements.vertices.forEach(vertex => {
      vertex.set('selected', false);
    });
  });
}

/**
 * Unselect all line inside the ElementsSet
 * @param elements {ElementsSet} the current ElementsSet
 * @returns {ElementsSet} Returns the updated ElementsSet
 */
export function unselectAllLines(elements) {
  return elements.withMutations(elements => {
    elements.lines.forEach(line => {
      line.set('selected', false);
    });
  });
}

/**
 * Unselect all holes inside the ElementsSet
 * @param elements {ElementsSet} the current ElementsSet
 * @returns {ElementsSet} Returns the updated ElementsSet
 */
export function unselectAllHoles(elements) {
  return elements.withMutations(elements => {
    elements.holes.forEach(hole => {
      hole.set('selected', false);
    });
  });
}

/**
 * Unselect all areas inside the ElementsSet
 * @param elements {ElementsSet} the current ElementsSet
 * @returns {ElementsSet} Returns the updated ElementsSet
 */
export function unselectAllAreas(elements) {
  return elements.withMutations(elements => {
    elements.areas.forEach(area => {
      area.set('selected', false);
    });
  });
}

/**
 * Unselect all items inside the ElementsSet
 * @param elements {ElementsSet} the current ElementsSet
 * @returns {ElementsSet} Returns the updated ElementsSet
 */
export function unselectAllItems(elements) {
  return elements.withMutations(elements => {
    elements.items.forEach(item => {
      item.set('selected', false);
    });
  });
}

/**
 * Unselect a generic element inside the ElementsSet
 * @param elements {ElementsSet} the current ElementsSet
 * @param prototype {String} the type of the element we want to unselect
 * @param ID {String} The ID of the element we want to unselect
 * @returns {ElementsSet} Returns the updated ElementsSet
 */
function unselectElement(elements, prototype, ID) {
  let ids = elements.getIn(['selected', prototype]);
  ids = ids.remove(ids.indexOf(ID));
  let selected = ids.some(key => key === ID);
  elements.setIn(['selected', prototype], ids);
  elements.setIn([prototype, ID, 'selected'], selected);
}

/*** REMOVE FUNCTIONS **/

/**
 * Remove a line from the ElementsSet
 * @param elements {ElementsSet} The current ElementsSet
 * @param lineID {String} the ID of the line we want to remove
 * @return {{elements: ElementsSet, line: Line}} Returns the updated ElementsSet and the removed line
 */
export function removeLine(elements, lineID) {

  let line = elements.getIn(['lines', lineID]);
  elements = elements.withMutations(elements => {
    unselectElement(elements, 'lines', lineID);
    line.holes.forEach(holeID => removeHole(elements, holeID));
    elements.deleteIn(['lines', line.id]); // TODO: We need this? (Check removeVertex)
    line.vertices.forEach(vertexID => removeVertex(elements, vertexID, 'lines', line.id));
  });

  return {elements, line};
}

/**
 * Remove an hole from the ElementsSet
 * @param elements {ElementsSet} The current ElementsSet
 * @param holeID {String} the ID of the hole we want to remove
 * @return {{elements: ElementsSet, hole: Hole}} Returns the updated ElementsSet and the removed hole
 */
export function removeHole(elements, holeID) {
  let hole = elements.getIn(['holes', holeID]);
  elements = elements.withMutations(elements => {
    unselectElement(elements, 'holes', holeID);
    elements.deleteIn(['holes', hole.id]);
    elements.updateIn(['lines', hole.line, 'holes'], holes => {
      let index = holes.findIndex(ID => holeID === ID);
      return holes.remove(index);
    });
  });

  return {elements, hole};
}

/**
 * Remove a vertex from the ElementsSet
 * @param elements {ElementsSet} The current ElementsSet
 * @param vertexID {String} the ID of the vertex we want to remove
 * @param relatedPrototype {String} The relatedPrototype which has asked to remove the vertex
 * @param relatedID {String} The ID of the related object which has asked the vertex removal
 * @return {{elements: ElementsSet, vertex: Vertex}} Returns the updated ElementsSet and the removed vertex
 */
export function removeVertex(elements, vertexID, relatedPrototype, relatedID) {
  let vertex = elements.vertices.get(vertexID);
  vertex = vertex.update(relatedPrototype, related => {
    let index = related.findIndex(ID => relatedID === ID);
    return related.delete(index);
  });

  if (vertex.areas.size + vertex.lines.size === 0) {
    elements = elements.deleteIn(['vertices', vertex.id]);
  } else {
    elements = elements.setIn(['vertices', vertex.id], vertex);
  }
  return {elements, vertex};
}

/**
 * Remove an area from the ElementsSet
 * @param elements {ElementsSet} The current ElementsSet
 * @param areaID {String} the ID of the area we want to remove
 * @return {{elements: ElementsSet, area: Area}} Returns the updated ElementsSet and the removed area
 */
export function removeArea(elements, areaID) {
  let area = elements.getIn(['areas', areaID]);

  elements = elements.withMutations(elements => {
    unselectElement(elements, 'areas', areaID);
    elements.deleteIn(['areas', area.id]); // TODO: We need this? (Check removeVertex)
    area.vertices.forEach(vertexID => removeVertex(elements, vertexID, 'areas', area.id));
  });

  return {elements, area};
}

/**
 * Remove an item from the ElementsSet
 * @param elements {ElementsSet} The current ElementsSet
 * @param itemID {String} the ID of the item we want to remove
 * @return {{elements: ElementsSet, item: Item}} Returns the updated ElementsSet and the removed item
 */
export function removeItem(elements, itemID) {
  let item = elements.getIn(['items', itemID]);
  elements = elements.withMutations(elements => {
    unselect(elements, 'items', itemID);
    elements.deleteIn(['items', item.id]);
  });

  return {elements, item};
}

/*** ADD FUNCTIONS **/

/**
 * Add a new vertex to the ElementsSet
 * @param elements {ElementsSet} The current ElementsSet
 * @param x {int} The x-coordinate for the vertex
 * @param y {int} The y-coordinate for the vertex
 * @param relatedPrototype {String} The type of element which has requested the vertex insertion
 * @param relatedID {String} The ID of the element which has requested the vertex insertion
 * @return {{elements: ElementsSet, vertex: Vertex}} Returns the updated ElementsSet and the added vertex
 */
export function addVertexToElements(elements, x, y, relatedPrototype, relatedID) {
  let vertex = elements.vertices.find(vertex => Geometry.samePoints(vertex, {x, y}));
  if (vertex) {
    vertex = vertex.update(relatedPrototype, related => related.push(relatedID));
  } else {
    vertex = new Vertex({
      id: IDBroker.acquireID(),
      x, y,
      [relatedPrototype]: new List([relatedID])
    });
  }
  elements = elements.setIn(['vertices', vertex.id], vertex);
  return {elements, vertex};
}

/**
 * Add a new line inside the elements set
 * @param elements {ElementsSet} the elements set we want to update
 * @param type {String} The line type
 * @param vertex0 {Vertex} The first vertex of the line
 * @param vertex1 {Vertex} The second vertex of the line
 * @param catalog {Catalog} The catalog object used in the application
 * @param properties {Object} The list of property values we want to add for the line (default is empty object)
 * @returns {{elements: ElementsSet, line: Line}} Returns the updated elements set and the newly added line
 */
export function addLineToElements(elements, type, vertex0, vertex1, catalog, properties = {}) {
  let line;

  elements = elements.withMutations(elements => {
    let lineID = IDBroker.acquireID();

    line = catalog.factoryElement(type, {
      id: lineID,
      vertices: new List([vertex0.id, vertex1.id]),
      type
    }, properties);

    elements.setIn(['lines', lineID], line);
  });

  return {elements, line};
}

/**
 * Add a new area to the current ElementsSet
 * @param elements {ElementsSet} The current ElementsSet
 * @param type {String} The type of the area
 * @param verticesCoords {List} The coordinates of the area points
 * @param catalog {Catalog} The current catalog
 * @return {{elements: *, area: Area}} Returns the updated elements set and the newly added area
 */
export function addAreaToElements(elements, type, verticesCoords, catalog) {
  let area;

  elements = elements.withMutations(elements => {
    let areaID = IDBroker.acquireID();

    let vertices = [];
    verticesCoords.forEach(({x, y}) => {
      let {vertex} = addVertexToElements(elements, x, y, 'areas', areaID);
      vertices.push(vertex.id);
    });

    area = catalog.factoryElement(type, {
      id: areaID,
      type,
      prototype: "areas",
      vertices: new List(vertices)
    });

    elements.setIn(['areas', areaID], area);
  });

  return {elements, area};
}

/**
 * Add a new hole to the current ElementsSet
 * @param elements {ElementsSet} The current ElementsSet
 * @param type {String} The type of the hole
 * @param lineID {String} The id of the line which has the hole
 * @param offset {int} The offset of the hole
 * @param catalog {Catalog} The current catalog
 * @return {{elements: *, hole: Hole}} Returns the updated elements set and the newly added hole
 */
export function addHoleToElements(elements, type, lineID, offset, catalog, properties = {}) {
  let hole;

  elements = elements.withMutations(elements => {
    let holeID = IDBroker.acquireID();

    hole = catalog.factoryElement(type, {
      id: holeID,
      type,
      offset,
      line: lineID
    }, properties);

    elements.setIn(['holes', holeID], hole);
    elements.updateIn(['lines', lineID, 'holes'], holes => holes.push(holeID));
  });

  return {elements, hole};
}

/**
 * Add a new item to the current ElementsSet
 * @param elements {ElementsSet} The current ElementsSet
 * @param type {String} The type of the item
 * @param x {int} The x-coordinate of the center of the item
 * @param y {int} The y-coordinate of the center of the item
 * @param width {int} The width of the item bounding box
 * @param height {int} The height of the item bounding box
 * @param rotation {int} The rotation of the item bounding box
 * @param catalog {Catalog} The current catalog
 * @return {{elements: *, item: Hole}} Returns the updated elements set and the newly added hole
 */
export function addItemToElements(elements, type, x, y, width, height, rotation, catalog) {
  let item;

  elements = elements.withMutations(elements => {
    let itemID = IDBroker.acquireID();

    item = catalog.factoryElement(type, {
      id: itemID,
      type,
      height,
      width,
      x,
      y,
      rotation
    });

    elements.setIn(['items', itemID], item);
  });

  return {elements, item};
}
