import {ElementsSet} from '../models';

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
    line.holes.forEach(holeID => removeHole(elements, holeID)); // TODO: Implement removeHole
    elements.deleteIn(['lines', line.id]);
    line.vertices.forEach(vertexID => removeVertex(elements, vertexID, 'lines', line.id)); // TODO: Implement removeVertex
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

