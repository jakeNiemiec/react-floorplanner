import React from 'react';
import PropTypes from 'prop-types';
import Group from './group';
import Guides from './guides/guides';
export default function Scene({scene, catalog}) {

  let {height, groups: layers} = scene;
  let selectedLayer = scene.groups.get(scene.selectedLayer);

  // At the top level we only have Layers!! (Moreover other groups cannot contain layers inside them)
  return (
    <g>
      <Guides scene={scene}/>

      <g style={{pointerEvents: "none"}}>
        {layers.entrySeq()
          .filter(([layerID, layer]) => !layer.selected && layer.visible)
          .map(([layerID, layer]) => <Group key={layerID} group={layer} scene={scene} catalog={catalog}/>)}
      </g>

      <Group key={selectedLayer.id} group={selectedLayer} scene={scene} catalog={catalog}/>
    </g>
  );
}


Scene.propTypes = {
  scene: PropTypes.object.isRequired,
  catalog: PropTypes.object.isRequired
};
