export function unselectAllElements(elements) {
  return elements.withMutations(elements => {
    unselectAllVertices(elements);
    unselectAllLines(elements);
    unselectAllHoles(elements);
    unselectAllAreas(elements);
    unselectAllItems(elements);
  });

}

export function unselectAllVertices(elements) {
  return elements.withMutations(elements => {
    elements.vertices.forEach(vertex => {
      vertex.set('selected',false);
    });
  });
}

export function unselectAllLines(elements) {
  return elements.withMutations(elements => {
    elements.lines.forEach(line => {
      line.set('selected',false);
    });
  });
}

export function unselectAllHoles(elements) {
  return elements.withMutations(elements => {
    elements.holes.forEach(hole => {
      hole.set('selected',false);
    });
  });
}

export function unselectAllAreas(elements) {
  return elements.withMutations(elements => {
    elements.areas.forEach(area => {
      area.set('selected',false);
    });
  });
}

export function unselectAllItems(elements) {
  return elements.withMutations(elements => {
    elements.items.forEach(item => {
      item.set('selected',false);
    });
  });
}
