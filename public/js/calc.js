$(function() {
  console.log("Ready");



  $.getJSON("/leagues/371.l.1048861/cached", function( scores ) {
    console.log("Scores:", scores);
    window.scores = scores;

    var playoff_spots = 6;
    var bye_week_spots = 2;
    var iterations = 10000;
    window.r = new Ranker(iterations, playoff_spots, bye_week_spots, scores);
    console.log(r.teams[8].ranks, r.teams[8]);
  });

  //$.getJSON("/leagues/371.l.1048861", function( data ) {
    //debugger;
  //});
});
