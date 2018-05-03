
//this is the worlds smallest violin. I mean, smallest js framework. Cry.
var tin = function(el_str){
    return new Can(document.querySelectorAll(el_str));
}
tin.ready = function(fn) {
  if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
    return fn();
  }
  document.addEventListener('DOMContentLoaded', fn);
}
tin.removeReady = function(fn){
  document.removeEventListener('DOMContentLoaded', fn);
}
var Can = function(tin_el){
  this.elements = tin_el;
  this.pseudoArray();
}
Can.prototype.pseudoArray = function(){
  var e = this.elements;
  for(var i=0; i<e.length; i++){
    this[i]= e[i]
    this.length = i+1;
  }
}
Can.prototype.html = function(html_str){
  var e = this.elements;
  for(var i in e){
    e[i].innerHTML = html_str;
  }
  return this;
}
