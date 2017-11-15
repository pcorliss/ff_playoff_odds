$(function() {
  console.log("Ready");

  var app = new Vue({
    el: '#app',
    data: {
      playoff_spots: 6,
      bye_week_spots: 2,
      message: 'Hello Vue!',
      s: [],
      teams: [],
      ranker: {}
    }
  })

  var btsff = '371.l.1139531'; // BTSFF
  var payments = '371.l.1048861'; // Payments
  $.getJSON("/leagues/" + payments + "/cached", function( scores ) {
    console.log("Scores:", scores);
    window.scores = scores;
    app.message = 'Loaded!';

    var iterations = 100;
    window.r = new Ranker(iterations, scores);
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
