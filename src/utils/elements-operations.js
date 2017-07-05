import {ElementsSet, Vertex} from '../models';
import {IDBroker} from "./id-broker";
import * as Geometry from './geometry';

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

export function unselectAllVertices(elements) {
  return elements.withMutations(elements => {
    elements.vertices.forEach(vertex => {
      vertex.set('selected', false);
    });
  });
}

export function unselectAllLines(elements) {
  return elements.withMutations(elements => {
    elements.lines.forEach(line => {
      line.set('selected', false);
    });
  });
}

export function unselectAllHoles(elements) {
  return elements.withMutations(elements => {
    elements.holes.forEach(hole => {
      hole.set('selected', false);
    });
  });
}

export function unselectAllAreas(elements) {
  return elements.withMutations(elements => {
    elements.areas.forEach(area => {
      area.set('selected', false);
    });
  });
}

export function unselectAllItems(elements) {
  return elements.withMutations(elements => {
    elements.items.forEach(item => {
      item.set('selected', false);
    });
  });
}

function unselectElement(elements, prototype, ID) {
  let ids = elements.getIn(['selected', prototype]);
  ids = ids.remove(ids.indexOf(ID));
  let selected = ids.some(key => key === ID);
  elements.setIn(['selected', prototype], ids);
  elements.setIn([prototype, ID, 'selected'], selected);
}

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

export function removeArea(elements, areaID) {
  let area = elements.getIn(['areas', areaID]);

  elements = elements.withMutations(elements => {
    unselectElement(elements, 'areas', areaID);
    elements.deleteIn(['areas', area.id]); // TODO: We need this? (Check removeVertex)
    area.vertices.forEach(vertexID => removeVertex(elements, vertexID, 'areas', area.id));
  });

  return {elements, area};
}

export function removeItem(elements, itemID) {
  let item = elements.getIn(['items', itemID]);
  elements = elements.withMutations(elements => {
    unselect(elements, 'items', itemID);
    elements.deleteIn(['items', item.id]);
  });

  return {elements, item};
}

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

export function addLineToElements(elements, type, x0, y0, x1, y1, catalog, properties = {}) {
  let line;

  elements = elements.withMutations(elements => {
    let lineID = IDBroker.acquireID();

    let v0, v1;
    ({elements, vertex: v0} = addVertexToElements(elements, x0, y0, 'lines', lineID));
    ({elements, vertex: v1} = addVertexToElements(elements, x1, y1, 'lines', lineID));

    line = catalog.factoryElement(type, {
      id: lineID,
      vertices: new List([v0.id, v1.id]),
      type
    }, properties);

    elements.setIn(['lines', lineID], line);
  });

  return {elements, line};
}
