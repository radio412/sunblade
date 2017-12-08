

/*
(Vishnu) dark as clouds but glowingly...
Here we create worlds, only time destroys them.
*/

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

/*
Everything is black and white. 
An old woman who has had something terrible happen in her past transform her into a monster rides a women's victorian bicycle down a barren road. 
A small dog escapes her spidery clutches.
A girl in a house that sits on someone else's horizon weeps.
Men who claim to be wizards roam the countryside, looking to sell fear in crystal balls.
A storm appears on the horizon but the people pretend it isn't there. They laugh nervously if anyone reminds them of the impending doom.
Set default and init states. Follow the yellow brick road.
*/

Dorothy = function (mapBoxKey){
  this.mapBoxKey = mapBoxKey;
  this.date = {};
  this.htmlElements = {};
  this.scenes = {};
  this.cameras = {};
  this.renderers = {};
  this.controls = {};
  this.renderQueue = 0;
  this.renderStack = {};
  this.resizeStack = {};
  this.suns = {};
  this.gridHelper = false;
  this.sunPos = false;
  this.time = false;
  this.date = false;
}


//this is default 4 port view, but can be overridden by the client code to instantiate whatever the heck setup they want. But this is the out of box setup. Be careful, or don't. Be crazy. Be Boring. Rewrite the code, or don't.
Dorothy.prototype.clickHeels = function(e,tl,tr,bl,br){
  var scope = this;
  this.htmlElements.tl = tl;
  this.htmlElements.tr = tr;
  this.htmlElements.bl = bl;
  this.htmlElements.br = br;
  var environment = e;
  if(environment == undefined){
    environment = "default";
  }
  this.addScene(environment, "Scene");
  var views = ["tl","tr","bl","br"];
  if(this.camStarts == undefined){
    camStarts = [new THREE.Vector3(.5,.5,.5),new THREE.Vector3(0,100,0),new THREE.Vector3(100,0,0),new THREE.Vector3(0,0,200)];
  }
  for (var i in views){
    var v = views[i];
    if(this.htmlElements[v] != undefined){
      this.addProjector(v, "OrbitControls", this.htmlElements[v], environment, this.camStarts[i], true);
    }
  }

  var ambientLight = new THREE.AmbientLight(0xffffff);
  this.addObject(ambientLight, "default");

}

//this is how you add a view of a built environment. In this case, an environment is a unique scene. If an environment is already projected by some other camera and controls, you can still reuse it and create multiple projections of the same environment.
Dorothy.prototype.addProjector = function(viewName, controlType, element, environment, cameraStart, resizeWithDom){
  var scope = this;
  var c = this.addCamera(viewName, "PerspectiveCamera", {fov:35, aspect:element.clientWidth/element.clientHeight, near:1, far:40000}, cameraStart);
  var r = this.addRenderer( viewName, "WebGLRenderer", element.clientHeight, element.clientWidth, 0xCCCCCC, viewName);
  this.addToRenderStack(viewName, environment, r, c);
  this.addControls(viewName, controlType, this.cameras[viewName], this.renderers[viewName].domElement);
  this.controls[viewName].addEventListener( 'change', function(e){  scope.processRenderStack(); });
  if(resizeWithDom == true){
    this.resizeWithDom(viewName, element, c, r);
  }
  this.processRenderStack();
}

//implement stereoscopic views
Dorothy.prototype.addVR = function(){

}

//add a grid helper
Dorothy.prototype.showGrid = function(size, divisions){
  if(this.gridHelper == false){
    this.gridHelper = new THREE.GridHelper( size, divisions );
  }
  this.addObject(this.gridHelper, "default");
  var axis = new THREE.AxisHelper(250);
  this.gridHelper.add(axis);
}

Dorothy.prototype.hideGrid = function(){
  this.removeObject(this.gridHelper, "default");
}

//when the user resizes the browser, or the browser turns orientation on mobile devices we need to reset the cameras. This function runs all the functions added with each projector.
Dorothy.prototype.processResizeStack = function(){
  for(var i in this.resizeStack){
    this.resizeStack[i]();
  }
  this.processRenderStack();
}

//Add a function to deal with resizing of the dom. This is a factory for a standard resize of the canvas and div using a tpical webGL Renderer. The user can skip this and add there own function to the resizeStack object.
Dorothy.prototype.addToResizeStack = function(name, element, camera, renderer){
  var scope = this;
  this.resizeStack[name] = function(){
    camera.aspect = element.clientWidth / element.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( element.clientWidth, element.clientHeight );
  }
}

//remove a function from the resizeStack by name.
Dorothy.prototype.removeFromResizeStack = function(name){
  delete this.resizeStack[name];
}

//we use one resize listener. STFU. This way there's only one. Ever. There's no abandoned events floating around leaking all over your ram. If you need something to happen on resize, add a function to the resizeStack object. If you put in a new resize function, I don't even know you.
Dorothy.prototype.resizeWithDom = function(element, name, camera, renderer){
  if(this.resizeStackListener == undefined){
    var scope = this;
    window.addEventListener( 'resize', function () {
      scope.processResizeStack();
    }, false);
  }
  this.addToResizeStack(element, name, camera, renderer);
}

//This method of rendering allows us to add multiple renders for multiple renderers, meaning we can have multiple cameras projecting on the same scene very easily. In the case of this class, a scene is called an environment.
Dorothy.prototype.processRenderStack = function(){
  for(var i in this.renderStack){
    this.renderStack[i]();
  }
  //allow an event for on render
  if(this.onRender != undefined && typeof this.onRender == 'function'){
    this.onRender();
  }
}

//Add a renderer to update when things in the scene change or a controls object is utilized. An enhancememnt is to render only the scene affected.
Dorothy.prototype.addToRenderStack = function(v, name, r, c){
  var scope = this;
  this.renderStack[v] = function(){
    r.render(scope.scenes[name], c);
  };
  this.processRenderStack();
}

//Remove a renderer from the renderstack. this means any changes made to the model won't be sent to that renderer. But the scene is not preserved.
Dorothy.prototype.removeFromRenderStack = function(name){
  delete this.renderStack[name];
  this.processRenderStack();
}

//add a camera. Instead of adding cameras with anaonmyous calls, we track them, own them, and keep them listed so more than one projector could use any camera to flip through cameras.
Dorothy.prototype.addCamera = function(name, type, cameraProperties, position){
  this.cameras[name] = new THREE[type](cameraProperties.fov, cameraProperties.aspect, cameraProperties.near, cameraProperties.far);
  this.cameras[name].position.set(position.x, position.y, position.z);
  return this.cameras[name];
}

//imagine if we had multiple scenes sharing objects! Maybe one is optimized for camera views that are over head and further away. that scene could decimate meshes and textures for example without affecting other scenes. .
Dorothy.prototype.addScene = function(name){
  this.scenes[name] = new THREE.Scene();
  return this.scenes[name];
}

//Have you been reading any of the other comments? If so, you know whay it would be cool to have multiiple controls to switch through.
Dorothy.prototype.addControls = function(name, type, camera, element){
  this.controls[name] = new THREE[type](camera, element);
  return this.controls[name];
}

// this allows us to add objects to the scene. You can add anything you want, lights, objects, rays, sharks, lasers, chairs.
Dorothy.prototype.addObject = function(object, scene){
  this.scenes[scene].add(object);
  this.processRenderStack();
  return object;
}

//remove and dispose of an object. Set dispose to false if you want to keep it in ram.
Dorothy.prototype.removeObject = function(object, scene, dispose){
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
Dorothy.prototype.addRenderer = function(name, type, w, h, c, e){
  var r = this.renderers[name] = new THREE[type]({antialias:true});
  r.setSize(h, w);
  r.setClearColor(c);
  r.antialias = true;
  if(e != undefined){
    this.htmlElements[e].appendChild(r.domElement);
  }
  return r;
}

//turn down the lights, open a bottle. Set the mood.
Dorothy.prototype.colorSun = function(scene){

}

//Set the environment to time lapse. the MoebiusStone function must be called first to place the sun, otherwise this function just returns before doing anything.
Dorothy.prototype.toggleTimeLapse = function(scene, inc, type){
  if(scene == undefined){
    scene = "default";
  }
  if(inc == undefined){
    inc = 5;
  }
  if(type == undefined){
    type = "minutes";
  }
  if(this.scenes[scene].userData.date == undefined){
    return;
  }
  var scope = this;
  var lapse = this.scenes[scene].userData.timeLapse;
  if (lapse == undefined) {
      lapse = setInterval(function () {
          var addMin = moment(scope.scenes[scene].userData.date).add(inc, type);
          scope.scenes[scene].userData.date = addMin.toDate();
          $("#con").html(scope.scenes[scene].userData.date);
          scope.moebiusStone(scope.scenes[scene].userData.date, scope.scenes[scene].userData.location, scope.scenes[scene].userData.sunDistance, scene);
      }, 10);
  } else {
      clearInterval(lapse);
      lapse = undefined;
  }
}


/*
This function creates a sun if one does not exist. If one exists, it modifies the sun instead.
The position of the sun is determined by the latitude, longitude and a date. It can be any date, any latitude any longitude.
The position of the sun in this function is NOT an orbit position! You cannot use this to set the sun around a globe.

"I could have done better." - Dr Stephen Strange
*/
Dorothy.prototype.moebiusStone = function(date, location, radius, scene){

  if(scene == undefined){
    scene = "default";
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
  if(sun == undefined){
    var sun = this.scenes[scene].userData.sun = new THREE.Mesh(new THREE.SphereGeometry(10,16,16), new THREE.MeshBasicMaterial({
        color: 0xffff00
    }));
    this.addObject(sun, scene);
  }

  sun.position.setX(x);
  sun.position.setY(y);
  sun.position.setZ(z);

  this.processRenderStack(sun);
}



/*
Load an external OBJ file with mtl file automagically. This does not put the object on the scene, but instead returns it to the caller called "handler".
This is a magic function in that it's doing things in a way you don't expect. It can only handle one mtl file per obj file. If you're wisest of wizards, please feel free to add multi-mtl support, but beware the twisty passages all different. You're likely to be attacked by a Gru.
This function loads the obj file twice, but assumes the second load is cached in ram. Don't give me any this is a hack crap though. Why not use the cache to our advantage for once? What are you, the cache police?
*/
Dorothy.prototype.magicLoadOBJ = function(path, handler, callback, pmanager){

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
    	console.log( 'Loading complete!');
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
    imgloader = new THREE.MTLLoader(manager);
    imgloader.setPath(objpath.substring(0, objpath.lastIndexOf("/")+1));
    imgloader.load( obj.materialLibraries[0],
      function(materials){
         var objLoader = new THREE.OBJLoader(manager);
         objLoader.setMaterials(materials);
         objLoader.load(objpath, function(object) {
           handler(object, "success");
         });
      });
    }
}

/*
Let's add some terrain capability to the app. THis isn't working yet.
"Here we create worlds. Only time destroys them." -Bhagavad Gita
This function contains two ram floaters for converting lat long to slippy tile coordinates as defined by http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#ECMAScript_.28JavaScript.2FActionScript.2C_etc..29
This should of course be in a utilities class, but this function should be used rarely anyways... you know what, nevermind. I am not going to sit here and justify myself to you. I'm my own person, and I deserve love too. Also, Check out the hook while my DJ revolves it.
*/
Dorothy.prototype.showTerrain = function(scene){
  var zoom = 8;
  if(scene == undefined){
    scene = "default";
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

  console.log(loc.lat, loc.lng);
  var x = lng2tile(loc.lng);
  var y = lat2tile(loc.lat);
  console.log(x, y);

  console.log("https://api.mapbox.com/v4/mapbox.terrain-rgb/"+zoom+"/"+(lng2tile(loc.lng)-1)+"/"+(lat2tile(loc.lat)-1)+".pngraw?access_token="+this.mapBoxKey);

  //omg yuck. help. this is drowning in stupid.
  var tileExtent = 5;
  var tileExtentX = tileExtent;
  var tileExtentY = tileExtent;
  var negativeExtentX = -tileExtent;
  var negativeExtentY = -tileExtent;



}

Dorothy.prototype.render = function(){

}


Dorothy.prototype.GISEnable = function(location){
  this.location = location;
}

Dorothy.prototype.addHTMLPage = function(url,scene, size, scale, webGLMesh, z, name, opacity, offset){

}

Dorothy.prototype.onGroundMapMove = function(){

}

Dorothy.prototype.getLatLngOfWorldPoint = function(){

}

Dorothy.prototype.onCameraChange = function(){

}

Dorothy.prototype.onGroundMapInit = function(){

}

Dorothy.prototype.addInputEvents = function(){

}

Dorothy.prototype.debugMode = function(bool){

}

Dorothy.onGISFeature = function(){

}
