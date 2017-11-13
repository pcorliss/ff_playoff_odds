$(function() {
  console.log("Ready");

  var app = new Vue({
    el: '#app',
    data: {
      message: 'Hello Vue!',
      s: [],
      teams: [],
      ranker: {}
    }
  })

  $.getJSON("/leagues/371.l.1048861/cached", function( scores ) {
    console.log("Scores:", scores);
    window.scores = scores;
    app.message = 'Loaded!';

    var playoff_spots = 6;
    var bye_week_spots = 2;
    var iterations = 100;
    window.r = new Ranker(iterations, playoff_spots, bye_week_spots, scores);
    app.teams = window.r.teams;
    app.ranker = window.r;
    app.s = scores;
    console.log(r.teams[8].ranks, r.teams[8]);
    //setInterval(function() {window.r.iterate(1000)}, 100);
  });


  //$.getJSON("/leagues/371.l.1048861", function( data ) {
    //debugger;
  //});
});
