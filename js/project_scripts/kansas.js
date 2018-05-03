
var toto;
function init(){// mapbox is not yet implemented
  toto = new Oz();
  toto.clickHeels("default", tin("#mainCan")[0], 4);
  toto.showGrid(2600,100);

  var d = new Date();
  d.setMonth(0);
  //d.setHours(18);
  //d.setMinutes(55);

  //this lat/long is just outside Sydney
  //var mexicoCity = {lat:19.5035361, lng:-99.0017081};

  var chicago = {lat:41.8862036,lng:-87.6303398};
  toto.moebiusStone(d, chicago, 2000);
  //toto.toggleTimeLapse("default", 15, "minutes");



  var picker = new ozPickerTool([],function(eventName, picked){
    if(picked == undefined){
      return;
    }
    if(eventName == "Up"){
      var mat = picked.object.material;
      if(mat != undefined){
        if(mat.length == undefined){
          mat = [mat];
        }
        for(var i=0; i<mat.length; i++){
          if(mat[i].cachedColor != undefined){
              mat[i].color.copy(mat[i].cachedColor);
              delete mat[i].cachedColor;
          }else{
            mat[i].cachedColor = new THREE.Color().copy(mat[i].color);
            mat[i].color.setHex(0x660000);
            mat[i].side = THREE.DoubleSide;
            this.selected = picked.object;
          }
        }
        toto.render();
      }
    }
  });
  picker.selected = {};
  toto.implementTool("picker", picker);




  toto.simpleLoadOBJ("media/247_House 15_obj.obj", function(obj,state){
    toto.addObject(obj, "default");
    var material = new THREE.MeshLambertMaterial({color: 0x666666, transparent: true, opacity: 1, side:THREE.DoubleSide});
    obj.traverse(function(child){
      if ( child instanceof THREE.Mesh ) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.material = new THREE.MeshLambertMaterial({color: 0x666666, transparent: true, opacity: 1, side:THREE.DoubleSide});
        picker.objects.push(child)
      }
    })
    toto.render();
  });
  tin.removeReady(init);
}
tin.ready(init);
