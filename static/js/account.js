"use strict";



$(window).on("load",function(){
	/* define buttons */
	var biobutton = "#bio";
	var instibutton = "#insti";
	var emailbutton = "#email";
	var websitebutton = "#websites";	
	
	/* set default status of inputs to not editable */
	document.getElementById('bioinput').readOnly = true;
	document.getElementById('instiinput').readOnly = true;
	document.getElementById('emailinput').readOnly = true;
	document.getElementById('websitesinput').readOnly = true;
	
	$(document).ready(function() {
	 $('#bio').on('click', function() {
	  
	  if(document.getElementById('bioinput').readOnly == true){
		document.getElementById('bioinput').readOnly = false;
	    document.getElementById("bio").innerHTML = "Save";
	  }
	  else{
	  
	  document.getElementById('bioinput').readOnly = true;
	  document.getElementById("bio").innerHTML = "Edit";
      }
	 });
	
	 $('#insti').on('click', function() {
	  
	  if(document.getElementById('instiinput').readOnly == true){
		document.getElementById('instiinput').readOnly = false;
	    document.getElementById("insti").innerHTML = "Save";
	  }
	  else{
	  
	  document.getElementById('instiinput').readOnly = true;
	  document.getElementById("insti").innerHTML = "Edit";
      }
	 });
	
	 $('#email').on('click', function() {
	  
	  if(document.getElementById('emailinput').readOnly == true){
		document.getElementById('emailinput').readOnly = false;
	    document.getElementById("email").innerHTML = "Save";
	  }
	  else{
	  
	  document.getElementById('emailinput').readOnly = true;
	  document.getElementById("email").innerHTML = "Edit";
      }
	 });
	
	 $('#websites').on('click', function() {
	  
	  if(document.getElementById('websitesinput').readOnly == true){
		document.getElementById('websitesinput').readOnly = false;
	    document.getElementById("websites").innerHTML = "Save";
	  }
	  else{
	  
	  document.getElementById('websitesinput').readOnly = true;
	  document.getElementById("websites").innerHTML = "Edit";
      }
	 });
	



	});
	






})