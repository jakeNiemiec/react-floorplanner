import React from 'react';
import PropTypes from 'prop-types';
import Line from './line';
import Area from './area';
import Vertex from './vertex';
import Item from './item';

export default function Group({group, scene, catalog}) {

  let {unit} = scene;
  let {lines, areas, vertices, holes, id: layerID, items, opacity} = group;

  return (
    <g opacity={opacity}>
      {areas.entrySeq().map(([areaID, area]) => <Area key={areaID} group={group} area={area}
                                                      unit={unit} catalog={catalog}/>)}
      {lines.entrySeq().map(([lineID, line]) => <Line key={lineID} group={group} line={line}
                                                      scene={scene} catalog={catalog}/>)}
      {items.entrySeq().map(([itemID, item]) => <Item key={itemID} group={group} item={item}
                                                      scene={scene} catalog={catalog}/>)}
      {vertices.entrySeq()
        .filter(([vertexID, vertex]) => vertex.selected)
        .map(([vertexID, vertex]) => <Vertex key={vertexID} group={group} vertex={vertex}/>)}
    </g>
  );

}

Group.propTypes = {
  group: PropTypes.object.isRequired,
  scene: PropTypes.object.isRequired,
  catalog: PropTypes.object.isRequired,
};
