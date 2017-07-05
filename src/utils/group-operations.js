export function unselectAllElementsInGroup(group) {
  //TODO: To implement
  console.error('Not implemented yet');
  throw new Error('Not implemented yet')
}

export function selectAllElementsInGroup(group) {
  //TODO: To implement
  console.error('Not implemented yet');
  throw new Error('Not implemented yet')
}

function addElementToGroup(group) {
  //TODO: To implement
  console.error('Not implemented yet');
  throw new Error('Not implemented yet')
}

export function addVertexToGroup(group) {
  //TODO: To implement
  console.error('Not implemented yet');
  throw new Error('Not implemented yet')
}

export function addLineToGroup(group, lineID) {
  group = group.setIn(['lines', lineID], lineID);
  return {group, lineID};
}

export function addAreaToGroup(group) {
  //TODO: To implement
  console.error('Not implemented yet');
  throw new Error('Not implemented yet')
}

export function addHoleToGroup(group) {
  //TODO: To implement
  console.error('Not implemented yet');
  throw new Error('Not implemented yet')
}

export function addItemToGroup(group) {
  //TODO: To implement
  console.error('Not implemented yet');
  throw new Error('Not implemented yet')
}

export function removeLineFromGroup(group, lineID) {
  group = group.deleteIn(['lines', lineID]);
  return {group, lineID};
}

export function removeHoleFromGroup(group, holeID) {
  group = group.deleteIn(['holes', holeID]);
  return {group, holeID};
}

export function removeVertexFromGroup(group, vertexID) {
  group = group.deleteIn(['vertices', vertexID]);
  return {group, vertexID};
}

export function removeAreaFromGroup(group, areaID) {
  group = group.deleteIn(['areas', areaID]);
  return {group, areaID};
}

export function removeItemFromGroup(group, itemID) {
  group = group.deleteIn(['items', itemID]);
  return {group, itemID};
}
