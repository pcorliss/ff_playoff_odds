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
      ranker: {},
      league: {}
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

  $.getJSON("/leagues.json", function( leagues ) {
    console.log("leagues:", leagues);
    window.leagues = leagues;
    var league;
    for(var i = 0; i < leagues.length; i++){
      if(leagues[i].league_key == league_key){
        league = leagues[i];
        break;
      }
    }
    app.league = league;
    console.log("League: ", league);

    var calc_bye_spots = function(teams) {
      var i;
      for(i = 2; i <= teams; i *= 2) { }
      return teams - (i / 2)
    }

    app.bye_week_spots = calc_bye_spots(league.settings.num_playoff_teams);
    app.playoff_spots = league.settings.num_playoff_teams;
  });

  var cached = "/cached"; // null out to load
  //cached = '';
  $.getJSON("/leagues/" + league_key + cached + "/json", function( scores ) {
    console.log("Scores:", scores);
    window.scores = scores;
    app.message = 'Loaded!';

    window.r = new Ranker(10, scores);
    app.teams = window.r.teams;
    app.ranker = window.r;
    app.s = scores;
    console.log(r.teams[8].ranks, r.teams[8]);
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
      console.log("Clicked!");
      target += 10000;
      if (!iterating) { iterating = true; setTimeout(iter, 10) }
    });
    setTimeout(iter, 10);
  });


  //$.getJSON("/leagues/371.l.1048861", function( data ) {
    //debugger;
  //});
});
