/*global
$, window
*/
$(window).on("load",function(){
	"use strict";
  var instances = $("fork"), i;
  for(i=0;i<instances.length;i++){
    $(instances[i]).load("../components/" + $(instances[i]).attr("template") + ".html");
  }
});
