$(function() {
  console.log("Ready");

  

  $.getJSON("/leagues/371.l.1048861/cached", function( scores ) {
    console.log("Scores:", scores);
    window.scores = scores;

    var playoff_spots = 4;
    var iterations = 10000;


  });

  //$.getJSON("/leagues/371.l.1048861", function( data ) {
    //debugger;
  //});
});
