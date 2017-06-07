In order to enable hierarchical modeling, we need to introduce the concept of *group*. The basical idea is to wrap all objects inside these new entities that will consent following transformations: *scales*, *translations* and *rotations*. Following this idea, a layer will be defined as a special group that will define only a translation on the z-axis. The new application state will be the following:

```
mode: "String"
scene: {unit:"cm",
	guides:{},
	selectedLayer: "String",
	width:number,
	height:number,
	meta:{},
	vertices:{},
	lines:{},
	holes:{},
	areas:{},
	items:{},
	selected:{},
	groups:{}
       }
sceneHistory: [{},{}]
catalog: {}
viewer2D: {}
snapElements:{}
activeSnapElement:{}
drawingSupport: {}
rotatingSupport: {}
misc:{}

```

Every group has the following structure:

```
{id: "String",
centerX: Number,
centerY: Number,
vertices: {},
lines: {},
holes:{},
areas:{},
items:{},
groups:{},
translation:{x:Number, y: Number, z: Number},
rotation:Number // Rotation around the y-axis in threejs context,
scale: {x:Number, y: Number, z: Number}
type: "Layer, etc...",
}
```

All these groups can be implemented in svg as *<g> tags* and in threejs with *the Object3D class*. We will also need utility functions to convert the relative coordinates of every object in world coordinates and vice versa.

From the UI point of view, a user can do the following actions:
* Select multiple objects and groups
* Group/Ungroup them
* Transform group objects
* Select multiple objects with a window
* View currently selected objects in a group
