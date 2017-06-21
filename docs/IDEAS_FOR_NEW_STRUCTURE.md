In order to enable hierarchical modeling, we need to introduce the concept of *group*. The basic idea is to wrap all objects inside these new entities that will consent following transformations: *scales*, *translations* and *rotations*. Following this idea, a *layer* will be defined as a special group that will define only a translation on the z-axis. The new application state will be the following:

```
mode: "String"
scene: {unit:"cm",
	guides:{},
	selectedLayer: "String",
	width:number,
	height:number,
	meta:{},
	elements:{
		vertices:{},
		lines:{},
		holes:{},
		areas:{},
		items:{},
	}
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

A group has the following structure:

```
{id: "String",
centerX: Number,
centerY: Number,
selected: Boolean,
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

Groups can be implemented in svg as `<g>` tags and in three.js exploiting `Object3D` class features. We will also need utility functions to convert the relative coordinates of every object in world coordinates and vice versa.

From the UI point of view, a user can do the following actions:
* Select multiple objects and groups
* Group/Ungroup them
* Transform group objects
* Select multiple objects by a drag and drop windowing selection interactions

Currently selected objects in a group, can be visualized in the sidebar
