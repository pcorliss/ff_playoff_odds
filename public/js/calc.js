$(function() {
  console.log("Ready");

  var app = new Vue({
    el: '#app',
    data: {
      playoff_spots: 0,
      bye_week_spots: 0,
      message: 'Hello Vue!',
      s: [],
      teams: [],
      ranker: {}
    }
  })

  var btsff = '371.l.1139531'; // BTSFF
  var payments = '371.l.1048861'; // Payments

  $.getJSON("/leagues", function( leagues ) {
    console.log("leagues:", leagues);
    window.leagues = leagues;
    var league;
    for(var i = 0; i < leagues.length; i++){
      if(leagues[i].league_key == payments){
        league = leagues[i];
        break;
      }
    }
    console.log("League: ", league);

    var calc_bye_spots = function(teams) {
      var i;
      for(i = 2; i <= teams; i *= 2) { }
      return teams - (i / 2)
    }

    app.bye_week_spots = calc_bye_spots(league.settings.num_playoff_teams);
    app.playoff_spots = league.settings.num_playoff_teams;
  });

  $.getJSON("/leagues/" + payments + "/cached", function( scores ) {
    console.log("Scores:", scores);
    window.scores = scores;
    app.message = 'Loaded!';

    window.r = new Ranker(10, scores);
    app.teams = window.r.teams;
    app.ranker = window.r;
    app.s = scores;
    console.log(r.teams[8].ranks, r.teams[8]);
    var steps = 500;
    var target = 2000;
    var iter = function() {
      if (r.iterations >= target) { return }
      var step = r.iterations + steps > target ? target - r.iterations : steps;
      r.iterate(step);
      setTimeout(iter, 0);
    };
    setTimeout(iter, 10);
  });


  //$.getJSON("/leagues/371.l.1048861", function( data ) {
    //debugger;
  //});
});
