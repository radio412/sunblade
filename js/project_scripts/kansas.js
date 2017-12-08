
function init(){
  var toto = new Oz(" YOUR MAP BOX KEY ");// mapbox is not yet implemented
  toto.camStarts = [new THREE.Vector3(1000,1000,1000),new THREE.Vector3(0,800,0),new THREE.Vector3(800,50,0),new THREE.Vector3(0,20,1400)];
  toto.clickHeels("default",  document.getElementById("threetl"),document.getElementById("threetr"), document.getElementById("threebl") ,document.getElementById("threebr"));
  toto.showGrid(500,100);
  var d = new Date();
  d.setMonth(1);
  //this lat/long is just outside Sydney
  toto.moebiusStone(d, {lat:-33.8470219, lng:150.3715133}, 300);
  toto.toggleTimeLapse("default", 5, "minutes");
  toto.showTerrain();
}

$(document).ready(function(){
  init();
});

function isPortrait() {
    return window.innerHeight > window.innerWidth;
}
