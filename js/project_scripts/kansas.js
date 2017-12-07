
function init(){
  var toto = new Dorothy("pk.eyJ1IjoiamVmZmIiLCJhIjoiY2oxeHExYnp2MDAwaTJxcXRmcjYxamc4aSJ9.CarCFkK2uSkUA2bHsJMTvQ");
  toto.camStarts = [new THREE.Vector3(30,30,30),new THREE.Vector3(0,100,0),new THREE.Vector3(100,50,0),new THREE.Vector3(0,20,1400)];
  toto.clickHeels("default",  document.getElementById("threetl"),document.getElementById("threetr"), document.getElementById("threebl") ,document.getElementById("threebr"));
  toto.showGrid(500,100);
  var d = new Date();
  d.setMonth(1);
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
