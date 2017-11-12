$(function() {
  console.log("Ready");



  $.getJSON("/leagues/371.l.1048861/cached", function( scores ) {
    console.log("Scores:", scores);
    window.scores = scores;

    var playoff_spots = 4;
    var bye_week_spots = 0;
    var iterations = 10000;
    window.r = new Ranker(iterations, playoff_spots, bye_week_spots, scores);
  });

  //$.getJSON("/leagues/371.l.1048861", function( data ) {
    //debugger;
  //});
});
