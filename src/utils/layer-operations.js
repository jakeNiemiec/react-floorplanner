import {Map, List, fromJS} from 'immutable';
import * as Geometry from './geometry';
import calculateInnerCyles from './graph-inner-cycles';

export function splitLine(layer, lineID, x, y, catalog) {
  let line0, line1;

  layer = layer.withMutations(layer => {
    let line = layer.getIn(['lines', lineID]);
    let {x: x0, y: y0} = layer.vertices.get(line.vertices.get(0));
    let {x: x1, y: y1} = layer.vertices.get(line.vertices.get(1));

    ({line: line0} = addLine(layer, line.type, x0, y0, x, y, catalog, line.properties));
    ({line: line1} = addLine(layer, line.type, x1, y1, x, y, catalog, line.properties));

    let splitPointOffset = Geometry.pointPositionOnLineSegment(x0, y0, x1, y1, x, y);

    line.holes.forEach(holeID => {
      let hole = layer.holes.get(holeID);

      let minVertex = Geometry.minVertex({x: x0, y: y0}, {x: x1, y: y1});

      let holeOffset = hole.offset;
      if (minVertex.x === x1 && minVertex.y === y1) {
        splitPointOffset = 1 - splitPointOffset;
        holeOffset = 1 - hole.offset;
      }

      if (holeOffset < splitPointOffset) {
        let offset = holeOffset / splitPointOffset;
        if (minVertex.x === x1 && minVertex.y === y1) {
          offset = 1 - offset;
        }
        addHole(layer, hole.type, line0.id, offset, catalog, hole.properties);
      } else {
        let offset = (holeOffset - splitPointOffset) / (1 - splitPointOffset);
        if (minVertex.x === x1 && minVertex.y === y1) {
          offset = 1 - offset;
        }
        addHole(layer, hole.type, line1.id, offset, catalog, hole.properties);
      }
    });

    removeLine(layer, lineID);
  });

  return {layer, lines: new List([line0, line1])};
}

export function addLineAvoidingIntersections(layer, type, x0, y0, x1, y1, catalog, oldProperties, oldHoles) {

  let points = [{x: x0, y: y0}, {x: x1, y: y1}];

  layer = layer.withMutations(layer => {
    let {lines, vertices} = layer;
    lines.forEach(line => {
      let [v0, v1] = line.vertices.map(vertexID => vertices.get(vertexID)).toArray();

      let hasCommonEndpoint =
        (Geometry.samePoints(v0, {x: x0, y: y0})
        || Geometry.samePoints(v0, {x: x1, y: y1})
        || Geometry.samePoints(v1, {x: x0, y: y0})
        || Geometry.samePoints(v1, {x: x1, y: y1}));


      let intersection = Geometry.intersectionFromTwoLineSegment(
        {x: x0, y: y0}, {x: x1, y: y1},
        v0, v1
      );

      if (intersection.type === "colinear") {
        if (!oldHoles) {
          oldHoles = [];
        }

        let orderedVertices = Geometry.orderVertices([{x: x0, y: y0}, {x: x1, y: y1}]);

        layer.lines.get(line.id).holes.forEach(holeID => {
          let hole = layer.holes.get(holeID);
          let oldLineLength = Geometry.pointsDistance(v0.x, v0.y, v1.x, v1.y);

          let alpha = Math.atan2(orderedVertices[1].y - orderedVertices[0].y,
            orderedVertices[1].x - orderedVertices[0].x);

          let offset = hole.offset;

          if (orderedVertices[1].x === line.vertices.get(1).x
            && orderedVertices[1].y === line.vertices(1).y) {
            offset = 1 - offset;
          }

          let xp = oldLineLength * offset * Math.cos(alpha) + v0.x;
          let yp = oldLineLength * offset * Math.sin(alpha) + v0.y;

          oldHoles.push({hole, offsetPosition: {x: xp, y: yp}});
        });

        removeLine(layer, line.id);
        points.push(v0, v1);
      }

      if (intersection.type === "intersecting" && (!hasCommonEndpoint)) {
        splitLine(layer, line.id, intersection.point.x, intersection.point.y, catalog);
        points.push(intersection.point);
      }

    });
    addLinesFromPoints(layer, type, points, catalog, oldProperties, oldHoles);
  });

  return {layer};
}

/** vertices features **/
export function mergeEqualsVertices(layer, vertexID) {

  //1. find vertices to remove
  let vertex = layer.getIn(['vertices', vertexID]);

  let doubleVertices = layer.vertices
    .filter(v => v.id !== vertexID)
    .filter(v => Geometry.samePoints(vertex, v));

  if (doubleVertices.isEmpty()) return layer;

  //2. remove double vertices
  let vertices, lines, areas;
  vertices = layer.vertices.withMutations(vertices => {
    lines = layer.lines.withMutations(lines => {
      areas = layer.areas.withMutations(areas => {

        doubleVertices.forEach(doubleVertex => {

          doubleVertex.lines.forEach(lineID => {
            let line = lines.get(lineID);
            line = line.update('vertices', vertices => vertices.map(v => v === doubleVertex.id ? vertexID : v));
            lines.set(lineID, line);
            vertices.updateIn([vertexID, 'lines'], l => l.push(lineID));
          });

          doubleVertex.areas.forEach(areaID => {
            let area = areas.get(areaID);
            area = area.update('vertices', vertices => vertices.map(v => v === doubleVertex.id ? vertexID : v));
            areas.set(areaID, area);
            vertices.updateIn([vertexID, 'areas'], area => area.push(areaID));
          });

          vertices.remove(doubleVertex.id);

        });
      });
    });
  });

  //3. update layer
  return layer.merge({
    vertices, lines, areas
  });
}

export function select(layer, prototype, ID) {
  return layer.withMutations(layer => {
    layer.setIn([prototype, ID, 'selected'], true);
    layer.updateIn(['selected', prototype], elements => elements.push(ID));
  });
}

export function unselect(layer, prototype, ID) {
  return layer.withMutations(layer => {
    let ids = layer.getIn(['selected', prototype]);
    ids = ids.remove(ids.indexOf(ID));
    let selected = ids.some(key => key === ID);
    layer.setIn(['selected', prototype], ids);
    layer.setIn([prototype, ID, 'selected'], selected);
  });
}

function opSetProperties(layer, prototype, ID, properties) {
  properties = fromJS(properties);
  layer.mergeIn([prototype, ID, 'properties'], properties);
}

function opSetItemsAttributes(layer, prototype, ID, itemsAttributes) {
  itemsAttributes = fromJS(itemsAttributes);
  layer.mergeIn([prototype, ID], itemsAttributes);
}

function opSetLinesAttributes(layer, prototype, ID, linesAttributes, catalog) {

  let {vertexOne, vertexTwo} = linesAttributes.toJS();

  layer.withMutations(layer => {

    layer
      .mergeIn(['vertices', vertexOne.id], {x: vertexOne.x, y: vertexOne.y})
      .mergeIn(['vertices', vertexTwo.id], {x: vertexTwo.x, y: vertexTwo.y})
      .mergeDeepIn([prototype, ID, 'misc'], new Map({'_unitLength': linesAttributes.get('lineLength').get('_unit')}));

    mergeEqualsVertices(layer, vertexOne.id);
    //check if second vertex has different coordinates than the first
    if (vertexOne.x !== vertexTwo.x && vertexOne.y !== vertexTwo.y) mergeEqualsVertices(layer, vertexTwo.id);

  });

  detectAndUpdateAreas(layer, catalog);
}

function opSetHolesAttributes(layer, prototype, ID, holesAttributes) {

  let offset = holesAttributes.get('offset');

  let misc = new Map({
    _unitA: holesAttributes.get('offsetA').get('_unit'),
    _unitB: holesAttributes.get('offsetB').get('_unit')
  });

  layer.mergeDeepIn([prototype, ID], new Map({
    offset,
    misc
  }));
}


export function setPropertiesOnSelected(layer, properties) {
  return layer.withMutations(layer => {
    let selected = layer.selected;
    selected.lines.forEach(lineID => opSetProperties(layer, 'lines', lineID, properties));
    selected.holes.forEach(holeID => opSetProperties(layer, 'holes', holeID, properties));
    selected.areas.forEach(areaID => opSetProperties(layer, 'areas', areaID, properties));
    selected.items.forEach(itemID => opSetProperties(layer, 'items', itemID, properties));
  });
}

export function setAttributesOnSelected(layer, attributes, catalog) {
  return layer.withMutations(layer => {
    let selected = layer.selected;
    selected.lines.forEach(lineID => opSetLinesAttributes(layer, 'lines', lineID, attributes, catalog));
    selected.holes.forEach(holeID => opSetHolesAttributes(layer, 'holes', holeID, attributes, catalog));
    selected.items.forEach(itemID => opSetItemsAttributes(layer, 'items', itemID, attributes, catalog));
    //selected.areas.forEach(areaID => opSetItemsAttributes(layer, 'areas', areaID, attributes, catalog));
  });
}

export function unselectAll(layer) {
  let selected = layer.get('selected');

  return layer.withMutations(layer => {
    layer.selected.forEach((ids, prototype) => {
      ids.forEach(id => unselect(layer, prototype, id));
    });
  });
}

/** areas features **/
const sameSet = (set1, set2) => set1.size === set2.size && set1.isSuperset(set2) && set1.isSubset(set2);

export function detectAndUpdateAreas(layer, catalog) {

  let verticesArray = [];           //array with vertices coords
  let linesArray = [];              //array with edges

  let vertexID_to_verticesArrayIndex = {};
  let verticesArrayIndex_to_vertexID = {};

  layer.vertices.forEach(vertex => {
    let verticesCount = verticesArray.push([vertex.x, vertex.y]);
    let latestVertexIndex = verticesCount - 1;
    vertexID_to_verticesArrayIndex[vertex.id] = latestVertexIndex;
    verticesArrayIndex_to_vertexID[latestVertexIndex] = vertex.id;
  });

  layer.lines.forEach(line => {
    let vertices = line.vertices.map(vertexID => vertexID_to_verticesArrayIndex[vertexID]).toArray();
    linesArray.push(vertices);
  });

  let innerCyclesByVerticesArrayIndex = calculateInnerCyles(verticesArray, linesArray);

  let innerCyclesByVerticesID = new List(innerCyclesByVerticesArrayIndex)
    .map(cycle => new List(cycle.map(vertexIndex => verticesArrayIndex_to_vertexID[vertexIndex])));

  layer = layer.withMutations(layer => {
    //remove areas
    layer.areas.forEach(area => {
      let areaInUse = innerCyclesByVerticesID.some(vertices => sameSet(vertices, area.vertices));
      if (!areaInUse) removeArea(layer, area.id);
    });

    //add new areas
    innerCyclesByVerticesID.forEach(cycle => {
      let areaInUse = layer.areas.some(area => sameSet(area.vertices, cycle));
      if (!areaInUse) {
        let areaVerticesCoords = cycle.map(vertexId => layer.vertices.get(vertexId));
        addArea(layer, 'area', areaVerticesCoords, catalog)
      }
    });
  });

  return {layer};
}
