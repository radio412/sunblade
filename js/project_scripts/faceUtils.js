faceUtils = function(){};
faceUtils.vertexHash = function(geometry){
  geometry.vertexHash = [];
  var faces = geometry.faces;
  var vLen = geometry.vertices.length;
  for(var i=0;i<vLen;i++){
  	geometry.vertexHash[i] = [];
    for(var f in faces){
    	 if(faces[f].a == i || faces[f].b == i || faces[f].c == i){
       		geometry.vertexHash[i].push(faces[f]);
       }
     }
   }
}

faceUtils.prototype.getCoplanar = function(maxAngle, geometry, face, clamp, out, originFace){
  if(this.originFace == undefined){
    this.originFace = face;
  }
  if(this.pendingRecursive == undefined){
    this.pendingRecursive = 0;
  }
	this.result = out;
  if(out == undefined){
       this.result = {count:0};
  }
  if(geometry.vertexHash == undefined){
  	faceUtils.vertexHash(geometry);
  }
  this.pendingRecursive++;
  var vertexes = ["a","b","c"];
  for (var i in vertexes){
    var vertexIndex = face[vertexes[i]];
    var adjacentFaces = geometry.vertexHash[vertexIndex];
    for(var a in adjacentFaces){
        var newface = adjacentFaces[a];
        var testF = this.originFace;
        if(clamp == false){
          testF = face
        }
        if(testF.normal.angleTo(newface.normal) * (180/ Math.PI) <= maxAngle){
          if(this.result["f"+newface.a+newface.b+newface.c] == undefined){
            this.result["f"+newface.a+newface.b+newface.c] = newface;
            this.result.count++;
            this.getCoplanar(maxAngle, geometry, newface, clamp, this.result, this.originFace);
          }
        }
    }
  }
  this.pendingRecursive--;

  if(this.pendingRecursive == 0 && this.onCoplanar != undefined){
    delete this.result.count;
    this.onCoplanar(this.result);
  }
}
 
