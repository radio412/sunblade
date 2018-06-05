
var toto;
function init(){// mapbox is not yet implemented
  toto = new Oz();
  toto.clickHeels("default", tin("#mainCan")[0], 2);
  var three_miles = (1609.34 * 3)/10; // si_units: one 3d unit = one meter
  //toto.showGrid(three_miles, three_miles/2);

  var d = new Date();

  d.setMonth(2);
  d.setHours(12);
  d.setMinutes(0);
  d.setSeconds(0);
  // new Date(Date.UTC(year, month, day, hour, minute, second))

  //this lat/long is just outside Sydney
  //var mexicoCity = {lat:19.5035361, lng:-99.0017081};

  var chicago = {lat:41.8862036,lng:-87.6303398};

  var cairo = {lat:30.033602, lng:31.248276};

  console.log(d)
  d = toto.tzCorrection(d, "Africa/Cairo");
  console.log(d);

  toto.moebiusStone(d, cairo, three_miles);
  toto.toggleTimeLapse("default", 1);



  // var picker = new ozPickerTool([],function(eventName, picked){
  //   if(picked == undefined){
  //     return;
  //   }
  //   if(eventName == "Up"){
  //     var mat = picked.object.material;
  //     if(mat != undefined){
  //       if(mat.length == undefined){
  //         mat = [mat];
  //       }
  //       for(var i=0; i<mat.length; i++){
  //         if(mat[i].cachedColor != undefined){
  //             mat[i].color.copy(mat[i].cachedColor);
  //             delete mat[i].cachedColor;
  //         }else{
  //           mat[i].cachedColor = new THREE.Color().copy(mat[i].color);
  //           mat[i].color.setHex(0x660000);
  //           mat[i].side = THREE.DoubleSide;
  //           this.selected = picked.object;
  //         }
  //       }
  //       toto.render();
  //     }
  //   }
  // });
  // picker.selected = {};
  // toto.implementTool("picker", picker);

  var geometry = new THREE.BoxGeometry( three_miles, 10, three_miles);
  var material = new THREE.MeshLambertMaterial( {color: 0xCCCCCC, side: THREE.DoubleSide} );
  var plane = new THREE.Mesh( geometry, material );

  plane.castShadow = true;
  plane.receiveShadow = true;

  toto.render();

  toto.addObject(plane, "default");

  var geometry = new THREE.BoxGeometry( 40, 10, 40);

  materials = [
  new THREE.MeshLambertMaterial( {color: 0xCCCCCC, side: THREE.DoubleSide}),
  new THREE.MeshLambertMaterial( {color: 0xCCCCCC, side: THREE.DoubleSide}),
  new THREE.MeshLambertMaterial( {
      color: 0xfffff3,
      side: THREE.DoubleSide,
      map: THREE.ImageUtils.loadTexture('media/Ancient-egyptian-sundial_1024.jpg')
  }),
  new THREE.MeshLambertMaterial( {color: 0xCCCCCC, side: THREE.DoubleSide}),
  new THREE.MeshLambertMaterial( {color: 0xCCCCCC, side: THREE.DoubleSide}),
  new THREE.MeshLambertMaterial( {color: 0xCCCCCC, side: THREE.DoubleSide})
  ]


  //replicate the worlds oldest known sundial

  var base = new THREE.Mesh( geometry, materials );
  base.position.set(0,10,00);
  base.castShadow = true;
  base.receiveShadow = true;
  base.rotation.y = THREE.Math.degToRad( -90 );
  toto.addObject(base, "default");


  var geometry = new THREE.CylinderGeometry( .15, .15, 20, 32 );
  var material = new THREE.MeshLambertMaterial( {color: 0xffffff, side: THREE.DoubleSide} );
  var gnomon = new THREE.Mesh( geometry, material );
  gnomon.position.set(0,20,00);
  gnomon.castShadow = true;
  gnomon.receiveShadow = true;
  toto.addObject(gnomon, "default");

  //
  // toto.simpleLoadOBJ("media/247_House 15_obj.obj", function(obj,state){
  //   toto.addObject(obj, "default");
  //   obj.position.y = 2;
  //   obj.castShadow = true;
  //   obj.receiveShadow = true;
  // //  var material = new THREE.MeshLambertMaterial({color: 0x666666, transparent: true, opacity: 1, side:THREE.DoubleSide});
  //   obj.traverse(function(child){
  //     if ( child instanceof THREE.Mesh ) {
  //       child.castShadow = true;
  //       child.receiveShadow = true;
  //       child.material = new THREE.MeshLambertMaterial({color: 0x666666, transparent: true, opacity: 1, side:THREE.DoubleSide});
  //       picker.objects.push(child)
  //     }
  //   })
  //   toto.render();
  // });
  tin.removeReady(init);
}
tin.ready(init);
