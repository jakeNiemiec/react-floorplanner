import React from 'react';
import PropTypes from 'prop-types';
import Group from './group';
import Guides from './guides/guides';
export default function Scene({scene, catalog}) {

  let {height, groups} = scene;
  let selectedLayer = scene.groups.get(scene.selectedLayer);

  return (
    <g>
      <Guides scene={scene}/>

      <g style={{pointerEvents: "none"}}>
        {groups.entrySeq()
          .filter(([groupID, group]) => !group.selected && group.visible)
          .map(([groupID, group]) => <Group key={groupID} group={group} scene={scene} catalog={catalog}/>)}
      </g>

      <Group key={selectedLayer.id} group={selectedLayer} scene={scene} catalog={catalog}/>
    </g>
  );
}


Scene.propTypes = {
  scene: PropTypes.object.isRequired,
  catalog: PropTypes.object.isRequired
};
