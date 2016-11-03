/*global $, window
*/
var PRIVATE_FUNCTIONS;
var PUBLIC_VARIABLES = {
	waitTime: 10000
};

$(window).on("load",function(){
	"use strict";
	var makeInstanceButton, mergeInstanceButton, deleteInstanceButton, runButton, clearButton, stopButton, workspaceRight, workspaceLeft;
	/* Define buttons */
	makeInstanceButton = ".makeInstance";
	mergeInstanceButton = ".mergeInstance";
	deleteInstanceButton = ".deleteInstance";
	runButton = ".run";
	clearButton = ".clearConsole";
	stopButton = ".stop";

	/* Define work spaces */
	workspaceRight = ".workspace.workspace-right";
	workspaceLeft = ".workspace.workspace-left";

	PRIVATE_FUNCTIONS = {
		console: {
			log: function(target, obj){
				var ret = "undefined";
				if(obj){
					ret = JSON.stringify(obj).split('"').join('');
				}
				target.html(target.html() + ret + "<br>") ;
			},
			warn: function(target, obj){
				var ret = "undefined";
				if(obj){
					ret = JSON.stringify(obj).split('"').join('');
				}
				target.html(target.html() + "<font style='color:red'>" + ret + "</style><br>");
			}
		},
		setTimeout: function(target, func, time){
			setTimeout(function(){
				if(target.attr("stop") !== true && target.attr("stop") !== "true"){
					func();
				}
			},time);
		},
		parse: function(code,target){
			if(code.indexOf("function main()") < 0){
				PRIVATE_FUNCTIONS.console.warn($(target),"Error: missing main()");
				return false;
			} if(code.indexOf("$(") > -1 || code.indexOf("document.") > -1){
				PRIVATE_FUNCTIONS.console.warn($(target),"HTML DOM access not supported");
				return false;
			} if(code.indexOf("window.") > -1){
				PRIVATE_FUNCTIONS.console.warn($(target),"Global variable access not supported");
				return false;
			}
			code = code.split("console.log(").join("PRIVATE_FUNCTIONS.console.log($('" + target + "'),")
							.split("setTimeout(").join("PRIVATE_FUNCTIONS.setTimeout($('" + target + "'),")
							.split(";").join(";if((new Date()).getTime() > PUBLIC_VARIABLES.startTime + " + PUBLIC_VARIABLES.waitTime + "){throw('Infinite loop detected');}");
			return code;
		},
		run: function(code,target){
			PUBLIC_VARIABLES.startTime = (new Date()).getTime();
			try{
				eval(code + "main();");
			} catch(e){
				PRIVATE_FUNCTIONS.console.warn($(target),e.toString());
			}
		}
	};

	/* Make Instance Button creates a new editable instance */
	$(makeInstanceButton).on("click",function(){
		$(workspaceRight).show();
		$(workspaceRight).find(".codingArea").val($(workspaceLeft).find(".codingArea").val());
		$(mergeInstanceButton).show();
		$(deleteInstanceButton).show();
		$(".saveInstance").show();
		$(makeInstanceButton).hide();
		$(workspaceRight).find(".console").val("");
	});
	/* Merge Instance brings back your code to the one on the left */
	$(mergeInstanceButton).on("click",function(){
		$(workspaceRight).find(".codingArea").val($(workspaceLeft).find(".codingArea").val());
	});
	/* Delete instance removes your current code */
	$(deleteInstanceButton).on("click",function(){
		$(workspaceRight).hide();
		$(mergeInstanceButton).hide();
		$(makeInstanceButton).show();
		$(".saveInstance").hide();
		$(deleteInstanceButton).hide();
	});
	/* Parse and run code */
	$(runButton).on("click",function(){
		var workspace = "." + $(this).parent().parent().attr("class").replace(" ","."), code = "";
		if(workspace && workspace.indexOf("workspace") > -1){
			$(workspace).find(".console").attr("stop",false);
			code = PRIVATE_FUNCTIONS.parse($(workspace).find(".codingArea").val(), workspace + " .console");
			if(code){
				PRIVATE_FUNCTIONS.run(code, workspace + " .console");
			}
		}
	});
	/* Clear console */
	$(clearButton).on("click",function(){
		var workspace = "." + $(this).parent().parent().attr("class").replace(" ",".");
		if(workspace && workspace.indexOf("workspace") > -1){
			$(workspace).find(".console").text("");
		}
	});
	/* Clear console */
	$(stopButton).on("click",function(){
		var workspace = "." + $(this).parent().parent().attr("class").replace(" ",".");
		if(workspace && workspace.indexOf("workspace") > -1){
			$(workspace).find(".console").attr("stop",true);
		}
	});
});
