


/*
If it's error free, it's probably boring.
If this is your first time here, you have to code.
*/

/*
requires
leaflet http://leafletjs.com/
suncalc https://github.com/mourner/suncalc
THREE   https://threejs.org/
*/

Oz = function (){
  this.upAxis = "Y";
  this.htmlElements = {};
  this.scenes = {};
  this.cameras = {};
  this.renderers = {};
  this.controls = {};
  this.renderStack = {};
  this.resizeStack = {};
  this.gridHelper = false;
  this.raycaster = false;
  this.tools = {};
  this.quality = 4;
  this.maxSun = 0;
  //the default camera start positions for each view. These can be overried if defined before clickHeels is called.
  this.camStarts = [new THREE.Vector3(200,200,200),new THREE.Vector3(0,10800,0),new THREE.Vector3(1800,300,0),new THREE.Vector3(0,20,2400)];
}



Oz.prototype.clickHeels = function(e, parentElement, screenSplit){

  /*
  (Vishnu) dark as clouds but glowingly...
  Here we create worlds, only time destroys them.
  */




  this.environment = e;
  if(this.environment == undefined){
    this.environment = this.environment;
  }

  this.setViews(parentElement, screenSplit);

  var scene = this.addScene(this.environment, "Scene");

  // SKYDOME
  var vertexShader  =
  "varying vec3 vWorldPosition;"+
  "void main() {"+
    "vec4 worldPosition = modelMatrix * vec4( position, 1.0 );"+
    "vWorldPosition = worldPosition.xyz;"+
    "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );"+
  "}";

  var fragmentShader =
  "uniform vec3 topColor;"+
  "uniform vec3 bottomColor;"+
  "uniform float offset;"+
  "uniform float exponent;"+
  "varying vec3 vWorldPosition;"+
  "void main() {"+
    "float h = normalize( vWorldPosition + offset ).y;"+
    "gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max( h , 0.0), exponent ), 0.0 ) ), 1.0 );"+
  "}";
	var uniforms = {
		topColor:    { value: new THREE.Color( 0x0077ff ) },
		//bottomColor: { value: new THREE.Color( 0xd3c1af ) },
    bottomColor: { value: new THREE.Color( 0xCCCCCC ) },
		offset:      { value: 0 },
		exponent:    { value: 0.6 }
	};
	var skyGeo = new THREE.SphereGeometry( 400000, 32, 15 );
	var skyMat = new THREE.ShaderMaterial( { vertexShader: vertexShader, fragmentShader: fragmentShader, uniforms: uniforms, side: THREE.BackSide } );
	var sky = new THREE.Mesh( skyGeo, skyMat );
  sky.rotation.x = -Math.PI / 2;
	scene.add( sky );


  this.enableViews();



}

Oz.prototype.setViews = function(parentElement, screenSplit){
  //default number of screens to split
  if(screenSplit == undefined){
    screenSplit = 1;
  }
  //we can't split 3 screens yet. Only pairs.
  if(screenSplit == 3){
    screenSplit = 2;
  }
  //we have ama of 4 views.
  if(screenSplit > 4){
    screenSplit = 4;
  }
  /*eventually this class should allow for any number of divs and simply tile them as best as possible.*/
  var scope = this;
  this.parentElement = parentElement;
  this.num = screenSplit;

  var views = ["tl","tr","bl","br"];

  for(var i=0; i<this.num;i++){
    this.htmlElements[views[i]] = document.createElement("div");
    parentElement.appendChild(this.htmlElements[views[i]]);
  }

  //Yes this could be external CSS files. But no, I added all the properties here, because this is not open to styling by some fancy pants designer. This CSS drives and requires specific JS code.
  //Yes, I said fancy pants.

  //set the CSS according to the number of viewports requested by the client code.

  //set default styles:
  this.htmlElements.tl.style["top"] = "0px";
  this.htmlElements.tl.style["left"] = "0px";
  this.htmlElements.tl.style["z-index"] = "1";
  this.htmlElements.tl.style["display"] = "inline-block";
  this.htmlElements.tl.style["vertical-align"]= "top";
  this.htmlElements.tl.style["box-shadow"]="inset 0 0 0 0.5px rgba(0, 0, 0, 0.7)";
  this.htmlElements.tl.style["width"] = "100%";
  this.htmlElements.tl.style["height"] = "100%";

  if(this.num == 2){
    this.htmlElements.tl.style["width"] = "50%";
    this.htmlElements.tl.style["height"] = "100%";
    this.htmlElements.tr.style.cssText = this.htmlElements.tl.style.cssText;
    this.htmlElements.tr.style["top"] = "0px";
    this.htmlElements.tr.style["left"] = "50%";
    this.htmlElements.tr.style["z-index"] = "2";
  }

  if(this.num == 4){
    this.htmlElements.tl.style["width"] = "50%";
    this.htmlElements.tl.style["height"] = "50%";
    this.htmlElements.tr.style.cssText = this.htmlElements.tl.style.cssText;
    this.htmlElements.br.style.cssText = this.htmlElements.tl.style.cssText;
    this.htmlElements.bl.style.cssText = this.htmlElements.tl.style.cssText;

    this.htmlElements.tr.style["top"] = "0px";
    this.htmlElements.tr.style["left"] = "50%";
    this.htmlElements.tr.style["z-index"] = "2";

    this.htmlElements.bl.style["top"] = "50%";
    this.htmlElements.bl.style["left"] = "0px";
    this.htmlElements.bl.style["z-index"] = "3";

    this.htmlElements.br.style["top"] = "50%";
    this.htmlElements.br.style["left"] = "50%";
    this.htmlElements.br.style["z-index"] = "4";
  }
}

Oz.prototype.enableViews = function(){
  var c = 0;
  for(var i in this.htmlElements ){
      this.addProjector(i, "OrbitControls", this.htmlElements[i], this.environment, this.camStarts[c++], true);
  }
  console.log(this);
}
//this is how you add a view of a built environment. In this case, an environment is a unique scene. If an environment is already projected by some other camera and controls, you can still reuse it and create multiple projections of the same environment.
Oz.prototype.addProjector = function(viewName, controlType, element, environment, cameraStart, resizeWithDom){
  var scope = this;
  var c = this.addCamera(viewName, "PerspectiveCamera", {fov:20, aspect:element.clientWidth/element.clientHeight, near:.01, far:6000000}, cameraStart);
  var r = this.addRenderer( viewName, "WebGLRenderer", element.clientHeight, element.clientWidth, 0xCCCCCC, viewName);
  this.addToRenderStack(viewName, environment, r, c);
  this.addControls(viewName, controlType, this.cameras[viewName], this.renderers[viewName].domElement);
  this.controls[viewName].addEventListener( 'change', function(e){  scope.processRenderStack(); });
  if(resizeWithDom == true){
    this.resizeWithDom(viewName, element, c, r);
  }
  this.addMouseEvents(viewName, element);
  this.processRenderStack();
}

//implement stereoscopic views
Oz.prototype.addVR = function(){

}

//add a grid helper
Oz.prototype.showGrid = function(size, divisions){
  if(this.gridHelper == false){
    this.gridHelper = new THREE.GridHelper( size, divisions );
  }
  this.addObject(this.gridHelper, this.environment);
  var axis = new THREE.AxisHelper(250);
  this.gridHelper.add(axis);
}

Oz.prototype.hideGrid = function(){
  this.removeObject(this.gridHelper, this.environment);
  this.gridHelper = false;
}

//when the user resizes the browser, or the browser turns orientation on mobile devices we need to reset the cameras. This function runs all the functions added with each projector.
Oz.prototype.processResizeStack = function(){
  for(var i in this.resizeStack){
    this.resizeStack[i]();
  }
  this.processRenderStack();
}

//The bottle had but one label and all it said was drink this. Add a function to deal with resizing of the dom. This is a factory for a standard resize of the canvas and div using a typical webGL Renderer. The user can skip this and add their own function to the resizeStack object if your rendering some other way.
Oz.prototype.addToResizeStack = function(name, element, camera, renderer){
  var scope = this;
  this.resizeStack[name] = function(){
    camera.aspect = element.clientWidth / element.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( element.clientWidth, element.clientHeight );
  }
}

//remove a function from the resizeStack by name.
Oz.prototype.removeFromResizeStack = function(name){
  delete this.resizeStack[name];
}

//we use one resize listener, no more. STFU. This way there's only one, Neo. Ever. There's no abandoned events floating around leaking all over your ram. If you need something to happen on resize, add a function to this resizeStack object. If you put in a new resize function, I don't even know you.
Oz.prototype.resizeWithDom = function(element, name, camera, renderer){
  if(this.resizeStackListener == undefined){
    var scope = this;
    window.addEventListener( 'resize', function () {
      scope.processResizeStack();
    }, false);
  }
  this.addToResizeStack(element, name, camera, renderer);
}

//This method of rendering allows us to add multiple renders for multiple renderers, meaning we can have multiple cameras projecting on the same scene very easily. In the case of this class, a scene is called an environment.
Oz.prototype.processRenderStack = function(){
  console.log("render");
  for(var i in this.renderStack){
    this.renderStack[i]();
  }
  //allow an event for on render
  if(this.onRender != undefined && typeof this.onRender == 'function'){
    this.onRender();
  }
}

//Add a renderer to update when things in the scene change or a controls object is utilized. An enhancememnt is to render only the scene affected.
Oz.prototype.addToRenderStack = function(v, name, r, c){
  var scope = this;
  this.renderStack[v] = function(){
    r.render(scope.scenes[name], c);
  };
  this.processRenderStack();
}

//Remove a renderer from the renderstack. this means any changes made to the model won't be sent to that renderer. But the scene is not preserved.
Oz.prototype.removeFromRenderStack = function(name){
  delete this.renderStack[name];
  this.processRenderStack();
}

//add a camera. Instead of adding cameras with anaonmyous calls, we track them, own them, and keep them listed so more than one projector could use any camera to flip through cameras.
Oz.prototype.addCamera = function(name, type, cameraProperties, position){
  this.cameras[name] = new THREE[type](cameraProperties.fov, cameraProperties.aspect, cameraProperties.near, cameraProperties.far);
  this.cameras[name].position.set(position.x, position.y, position.z);
  if(this.upAxis.toLowerCase() == "x"){
    this.cameras[name].up.set(1,0,0);
  }
  if(this.upAxis.toLowerCase() == "y"){
    this.cameras[name].up.set(0,1,0);
  }
  if(this.upAxis.toLowerCase() == "z"){
    this.cameras[name].up.set(0,0,1);
  }
  return this.cameras[name];
}

//imagine if we had multiple scenes sharing objects! Maybe one is optimized for camera views that are over head and further away. that scene could decimate meshes and textures for example without affecting other scenes. .
Oz.prototype.addScene = function(name){
  this.scenes[name] = new THREE.Scene();
  return this.scenes[name];
}

//Have you been reading any of the other comments? If so, you know whay it would be cool to have multiple controls to switch through.
Oz.prototype.addControls = function(name, type, camera, element){
  this.controls[name] = new THREE[type](camera, element);
  return this.controls[name];
}

// this allows us to add objects to the scene. You can add anything you want, lights, objects, rays, sharks, lasers, chairs, chickens wearing sneakers
Oz.prototype.addObject = function(object, scene){
  console.log(this.scenes[scene]);
  this.scenes[scene].add(object);
  this.processRenderStack();
  return object;
}

//remove and dispose of an object. Set dispose to false if you want to keep it in ram.
Oz.prototype.removeObject = function(object, scene, dispose){
  this.scenes[scene].remove(object);
  this.processRenderStack();
  if(dispose == true){
    object.geoemtry.dispose();
    object.material.dispose();
    object.texture.dispose();
  }
  return object;
}

// save and track renderers, switch renderers among scenes, projections, controls.
Oz.prototype.addRenderer = function(name, type, w, h, c, e){
  var r = this.renderers[name] = new THREE[type]({antialias:true, alpha:true});
  r.setSize(h, w);
  r.alpha = true;
  r.setClearColor(c, 0);
  r.antialias = true;
  r.shadowMap.enabled = true;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  if(e != undefined){
    this.htmlElements[e].appendChild(r.domElement);
  }
  return r;
}

//turn down the lights, open a bottle. Set the mood.
Oz.prototype.colorSun = function(scene){

}

//Set the environment to time lapse. the MoebiusStone function must be called first to place the sun, otherwise this function just returns before doing anything.
Oz.prototype.toggleTimeLapse = function(scene, inc){
  if(scene == undefined){
    scene = this.environment;
  }
  if(inc == undefined){
    inc = 5;
  }
  if(this.scenes[scene].userData.date == undefined){
    return;
  }
  var scope = this;
  var lapse = this.scenes[scene].userData.timeLapse;
  if (lapse == undefined) {
      lapse = setInterval(function () {
          var addMin = moment(scope.scenes[scene].userData.date).add(inc, "minutes");
          scope.scenes[scene].userData.date = addMin.toDate();
          if(scope.timeZone != undefined){
            tin("#con").html(scope.tzCorrection(scope.scenes[scene].userData.date, scope.timeZone));
          }else{
            tin("#con").html(scope.scenes[scene].userData.date);
          }
          //instead of manipulating html in this class, it's likely better to have some type of on event for outputs, probably with event type name and an object. onOutput(name, object)
          scope.moebiusStone(scope.scenes[scene].userData.date, scope.scenes[scene].userData.location, scope.scenes[scene].userData.sunDistance, scene);
      }, 10);
  } else {
      clearInterval(lapse);
      lapse = undefined;
  }
}


/*
This function creates a sun if one does not exist.

The position of the sun in this function is NOT an orbit position! You cannot use this to set the sun around a globe.

"I could have done better." - Dr Stephen Strange
*/
Oz.prototype.tzCorrection = function(time,zone){
  var format = 'MMM DD, YYYY HH:mm:ss';
  this.timeZone = zone;
  return new Date(moment(time,format).tz(zone).format(format));
}
Oz.prototype.moebiusStone = function(date, location, radius, scene){
  if(this.gridHelper != false){
    radius = - this.gridHelper.geometry.boundingSphere.radius*2;
  }
  //radius = 1000;
  if(scene == undefined){
    scene = this.environment;
  }

  this.scenes[scene].userData.date = date;
  this.scenes[scene].userData.location = location;
  this.scenes[scene].userData.sunDistance = radius;

  var sunPosition = SunCalc.getPosition(date, location.lat, location.lng);

  var a = radius * Math.cos(sunPosition.altitude);
  var x = a * Math.cos(sunPosition.azimuth);
  var y = radius * Math.sin(sunPosition.altitude);
  var z = a * Math.sin(sunPosition.azimuth);

  var sun = this.scenes[scene].userData.sun;
  var sunlight = this.scenes[scene].userData.sunlight;

  if(sun == undefined){
    this.ambientLight = new THREE.AmbientLight(0x666666);
    this.addObject(this.ambientLight, this.environment);

    var sun = this.scenes[scene].userData.sun = new THREE.Mesh(new THREE.SphereGeometry(50,16,16), new THREE.MeshBasicMaterial({
         color: 0xffff33
    }));
    this.addObject(sun, scene);

    //let there be light
    var sunlight = this.scenes[scene].userData.sunlight = new THREE.DirectionalLight( 0xfffff1, 1 );
    sunlight.castShadow = true;


    sunlight.shadow.mapSize.width = 1024 * this.quality;
    sunlight.shadow.mapSize.height = 1024 * this.quality;

    //sunlight.shadow.width = sunlight.shadow.height = 1024 * 5;
    var di = radius;
    sunlight.shadow.camera.left = -di;
    sunlight.shadow.camera.right = di;
    sunlight.shadow.camera.top = di;
    sunlight.shadow.camera.bottom = -di;
    sunlight.shadow.camera.near = 100;
    sunlight.shadow.camera.far = di*2;
    sunlight.shadow.bias = -0.0000;
    this.addObject(sunlight, scene);

    // var camHelper = new THREE.CameraHelper( sunlight.shadow.camera );
    // this.addObject(camHelper, scene);

    // var helper = this.scenes[scene].userData.sunlightHelper = new THREE.DirectionalLightHelper( sunlight, 500);
    // this.addObject(helper, scene);

    var north = this.scenes[scene].userData.north = new THREE.Mesh(new THREE.ConeGeometry(), new THREE.MeshBasicMaterial({
        color: 0x000000
    }));
    north.position.x = -2000;
    if(this.gridHelper != false){
      north.position.x = -this.gridHelper.geometry.boundingSphere.radius;
    }
    this.addObject(north, scene);
    this.processRenderStack();
  }

  sun.position.setX(x);
  sun.position.setY(y);
  sun.position.setZ(z);

  sunlight.position.setX(x);
  sunlight.position.setY(y);
  sunlight.position.setZ(z);

  // var sun2 = this.scenes[scene].userData.sun = new THREE.Mesh(new THREE.SphereGeometry(50,16,16), new THREE.MeshBasicMaterial({
  //      color: 0xffff33
  // }));
  // sun2.position.setX(x);
  // sun2.position.setY(y);
  // sun2.position.setZ(z);
  // //this.addObject(sun2, scene);

  if(y>this.maxSun){
    this.maxSun = y;
  }
  if(y>0){
    var intensity = y/this.maxSun;
    this.ambientLight.intensity = intensity+ .25;
  }
  this.processRenderStack();
}



/*
Load an external OBJ file with mtl file automagically. This does not put the object on the scene, but instead returns it to the caller called "handler".
This is a magic function in that it's doing things in a way you don't expect. It can only handle one mtl file per obj file. If you're wisest of wizards, please feel free to add multi-mtl support, but beware the twisty passages all different. You're likely to be attacked by a Gru.
This function loads the obj file twice, but assumes the second load is cached in ram. Don't give me "this is a hack" crap though. Why not use the cache to our advantage for once? What are you, the cache police?
*/
Oz.prototype.magicLoadOBJ = function(path, handler, callback, pmanager){

  var scope = this;

  if(callback == undefined){
    callback = function(){
      return;
    }
  }
  if(handler == undefined){
    return "You must specify a handler to store the resulting file.";
  }

  var manager = pmanager;

  if(manager == undefined){
    manager = new THREE.LoadingManager();
    manager.onStart = function ( url, itemsLoaded, itemsTotal ) {
      callback("startedAFile", url, itemsLoaded, itemsTotal);
    };
    manager.onLoad = function ( ) {
      callback("endOfFiles");
    };
    manager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
      callback("startedAFile", url, itemsLoaded, itemsTotal);
    };
    manager.onError = function ( url ) {
      callback("errorLoadingAFile", url);
    };
  }

  var loader = new THREE.OBJLoader( manager );
  var objpath = path;

  loader.load( objpath, function ( object ) {
    loadMats(object, objpath);
  });

  var loadMats = function(obj, objpath){
    matloader = new THREE.MTLLoader(manager);
    console.log(objpath.substring(0, objpath.lastIndexOf("/")+1), obj.materialLibraries[0]);
    matloader.setPath(objpath.substring(0, objpath.lastIndexOf("/")+1));
    matloader.load( obj.materialLibraries[0],
      function(materials){
        console.log(materials)
         var objLoader = new THREE.OBJLoader(manager).setMaterials(materials);
         objLoader.load(objpath, function(object) {
           handler(object, "success");
         });
      });
    }
}


Oz.prototype.simpleLoadOBJ = function(path, handler, callback, pmanager){

  var scope = this;

  if(callback == undefined){
    callback = function(){
      return;
    }
  }
  if(handler == undefined){
    return "You must specify a handler to store the resulting file.";
  }

  var manager = pmanager;

  if(manager == undefined){
    manager = new THREE.LoadingManager();
    manager.onStart = function ( url, itemsLoaded, itemsTotal ) {
      callback("startedAFile", url, itemsLoaded, itemsTotal);
    };
    manager.onLoad = function ( ) {
      callback("endOfFiles");
    };
    manager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
      callback("startedAFile", url, itemsLoaded, itemsTotal);
    };
    manager.onError = function ( url ) {
      callback("errorLoadingAFile", url);
    };
  }

  var loader = new THREE.OBJLoader( manager );
  var objpath = path;
  loader.load( objpath, function ( object ) {
      handler(object, "success");
  });
}



/*
Let's add some terrain capability to the app. THis isn't working yet.
"Here we create worlds. Only time destroys them." -Bhagavad Gita
This function contains some functions for converting lat long to slippy tile coordinates as defined by http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#ECMAScript_.28JavaScript.2FActionScript.2C_etc..29
This should of course be in a utilities class, but this function should be used rarely anyways... you know what, nevermind. I am not going to sit here and justify myself to you. I'm my own person, and I deserve love too. Also, Check out the hook while my DJ revolves it.
*/
Oz.prototype.showTerrain = function(scene){
  var zoom = 8;
  if(scene == undefined){
    scene = this.environment;
  }
  var lng2tile = function(lon) {
    return (Math.floor((lon+180)/360*Math.pow(2,zoom)));
  }
  var lat2tile = function(lat){
    return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom)));
  }

  var tile2long = function(x,z) {
   return (x/Math.pow(2,z)*360-180);
  }
  var tile2lat = function(y,z) {
   var n=Math.PI-2*Math.PI*y/Math.pow(2,z);
   return (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n))));
  }


  var loc = this.scenes[scene].userData.location;

  var x = lng2tile(loc.lng);
  var y = lat2tile(loc.lat);

  //console.log("https://api.mapbox.com/v4/mapbox.terrain-rgb/"+zoom+"/"+(lng2tile(loc.lng)-1)+"/"+(lat2tile(loc.lat)-1)+".pngraw?access_token="+this.mapBoxKey);

  //omg yuck. help. this is drowning in stupid.
  var tileExtent = 5;
  var tileExtentX = tileExtent;
  var tileExtentY = tileExtent;
  var negativeExtentX = -tileExtent;
  var negativeExtentY = -tileExtent;

}

Oz.prototype.addMouseEvents = function(viewName, element){
  var scope = this;
  element.addEventListener("click", function(event){
    var object = {
      viewName: viewName,
      renderer: scope.renderers[viewName]
    }
    scope.on("Click", event, object);
  });
  element.addEventListener("dblclick", function(event){
    var object = {
      viewName: viewName,
      renderer: scope.renderers[viewName]
    }
    scope.on("DoubleClick", event, object);
  });
  element.addEventListener("mousemove", function(event){
    var object = {
      viewName: viewName,
      renderer: scope.renderers[viewName]
    }
    scope.on("Move", event, object);
  });
  element.addEventListener("mouseup", function(event){
    var object = {
      viewName: viewName,
      renderer: scope.renderers[viewName]
    }
    scope.on("Up", event, object);
  });
  element.addEventListener("mouseenter", function(event){
    var object = {
      viewName: viewName,
      renderer: scope.renderers[viewName]
    }
    scope.on("Enter", event, object);
  });
  element.addEventListener("mouseleave", function(event){
    var object = {
      viewName: viewName,
      renderer: scope.renderers[viewName]
    }
    scope.on("Leave", event, object);
  });
  element.addEventListener("mousedown", function(event){
    var object = {
      viewName: viewName,
      renderer: scope.renderers[viewName]
    }
    scope.on("Down", event, object);
  });
  element.addEventListener("mouseenter", function(event){
    var object = {
      viewName: viewName,
      renderer: scope.renderers[viewName]
    }
    scope.on("Enter", event, object);
  });
}

Oz.prototype.implementTool = function(name, tool){
  tool.world = this;
  this.tools[name] = tool;
}
Oz.prototype.decomissionTool = function(name, tool){
  delete this.tools[name];
}

Oz.prototype.on = function(eventName, nativeEvent, object){
  var toolEventName = "on"+eventName+"Handler";
  for(var i in this.tools){
    var currTool = this.tools[i];
    if (currTool[toolEventName] !== undefined) {
        currTool[toolEventName](eventName, nativeEvent, object);
    }
  }
}

Oz.prototype.fetchRayCastTop = function (event, arr, viewName) {
		var testSet = arr;
		if (this.raycaster === false) {
				this.raycaster = new THREE.Raycaster();
		}
		var mouse = new THREE.Vector2();
		mouse.x = event.offsetX / this.renderers[viewName].domElement.width * 2 - 1;
		mouse.y = -(event.offsetY / this.renderers[viewName].domElement.height) * 2 + 1;
		this.raycaster.setFromCamera(mouse, this.cameras[viewName]);
		var intersects = this.raycaster.intersectObjects(testSet, true);
		object = undefined;
		if (intersects.length > 0) {
				object = intersects[0];
		}
		return object;
};

Oz.prototype.render = function(){
  this.processRenderStack();
}

Oz.prototype.GISEnable = function(location){
  this.location = location;
}

Oz.prototype.addHTMLPage = function(url,scene, size, scale, webGLMesh, z, name, opacity, offset){

}

Oz.prototype.onGroundMapMove = function(){

}

Oz.prototype.getLatLngOfWorldPoint = function(){

}

Oz.prototype.onCameraChange = function(){

}

Oz.prototype.onGroundMapInit = function(){

}

Oz.prototype.debugMode = function(bool){

}

Oz.onGISFeature = function(){

}
Oz.prototype.addSpriteLabelToObject = function(object, str, styleObject){

}





/*example tool plugin*/


var ozPickerTool = function(objects, callback){
  this.objects = objects;
  this.callback = callback;
  this.moved = false;
  this.down = false;
}
ozPickerTool.prototype.onDownHandler = function(eventName, nativeEvent, object){
  this.moved = false;
  this.down = true;
  this.pick(eventName, nativeEvent,object);
}
ozPickerTool.prototype.onMoveHandler = function(eventName, nativeEvent, object){
  this.moved = true;
  if(this.down == false){
    this.pick(eventName, nativeEvent, object);
  }
}
ozPickerTool.prototype.onUpHandler = function(eventName, nativeEvent, object){
  if(this.moved == false){
    this.pick(eventName, nativeEvent, object);
  }
  this.down = false;
}
ozPickerTool.prototype.pick = function(eventName, nativeEvent, object){
    this.callback(eventName, this.world.fetchRayCastTop(nativeEvent, this.objects, object.viewName));
}
