$(function() {
  var app = new Vue({
    el: '#app',
    data: {
      playoff_spots: 0,
      bye_week_spots: 0,
      s: [],
      teams: [],
      ranker: {},
      league: {},
      error: ''
    },
    methods: {
      spots: function(ranks, num_spots, iterations) {
        return parseFloat(ranks.slice(0, num_spots).sum() / (iterations || 1) * 100).toFixed(2);
      },
      sorted_spots: function(t, num_spots) {
        return t.slice().sort(function(a,b){
          return b.ranks.slice(0, num_spots).sum() - a.ranks.slice(0, num_spots).sum();
        });
      }
    }

  })

  var calc_bye_spots = function(teams) {
    var i;
    for(i = 2; i <= teams; i *= 2) { }
    return teams - (i / 2)
  }


  if (league_cached && scores_cached) {
    console.log("Operating on cached data");
    app.league = window.league = league_cached;
    app.bye_week_spots = calc_bye_spots(league.settings.num_playoff_teams);
    app.playoff_spots = league.settings.num_playoff_teams;
    console.log("League: ", league);

    app.scores = window.scores = scores_cached;
    console.log("Scores: ", scores);

    window.r = new Ranker(10, scores);
    app.teams = window.r.teams;
    app.ranker = window.r;
    app.s = scores;
    var steps = 543;
    var target = 20000;
    var iterating = true;
    var iter = function() {
      if (r.iterations >= target) { iterating = false; return }
      var step = r.iterations + steps > target ? target - r.iterations : steps;
      r.iterate(step);
      setTimeout(iter, 0);
    };
    $("#more_iterations").click(function(){
      target += 10000;
      if (!iterating) { iterating = true; setTimeout(iter, 10) }
    });
    setTimeout(iter, 10);
    return
  }

  console.log("No cache found calling Yahoo");

  $.getJSON("/leagues.json", function( leagues ) {
    window.leagues = leagues;
    console.log("Leagues: ", leagues);
    for(var i = 0; i < leagues.length; i++){
      if(leagues[i].league_key == league_key){
        window.league = leagues[i];
        break;
      }
    }
    app.league = league;

    app.bye_week_spots = calc_bye_spots(league.settings.num_playoff_teams);
    app.playoff_spots = league.settings.num_playoff_teams;
  }).fail(function(e) {
    console.log("error", e);
    window.e = e;
    app.error = "Failed to load league data! Please try again. Debug: "+ e.status +" "+ e.getResponseHeader('date');
  });

  $.getJSON("/leagues/" + league_key + "/json", function( scores ) {
    window.scores = scores;
    console.log("Scores: ", scores);

    window.r = new Ranker(10, scores);
    app.teams = window.r.teams;
    app.ranker = window.r;
    app.s = scores;
    var steps = 543;
    var target = 20000;
    var iterating = true;
    var iter = function() {
      if (r.iterations >= target) { iterating = false; return }
      var step = r.iterations + steps > target ? target - r.iterations : steps;
      r.iterate(step);
      setTimeout(iter, 0);
    };
    $("#more_iterations").click(function(){
      target += 10000;
      if (!iterating) { iterating = true; setTimeout(iter, 10) }
    });
    setTimeout(iter, 10);
  }).fail(function(e) {
    console.log("error", e);
    window.e = e;
    app.error = "Failed to load matchup data! Please try again. Debug: "+ e.status +" "+ e.getResponseHeader('date');
  });
});
