  function Ranker(iterations, scores) {
    this.teams = [];
    this.load(scores);
    this.iterations = 0;
    this.iterate(iterations);
  }

  Ranker.prototype.iterate = function(iterations) {
    this.iterations += iterations;
    for(var i = 0; i < iterations; i++){
      this.compute();
      this.standings();
      this.reset();
    }
  };

  Ranker.prototype.load = function(scores) {
    for (var week in scores) {
      if(scores[week]) {
        var matchups = scores[week];
        for(var i = 0; i < matchups.length; i++) {
          new Match.from_json(this.teams, matchups[i]);
        }
      }
    }
    return this.teams;
  };

  Ranker.prototype.compute = function() {
    for (var i = 1; i < this.teams.length; i++) {
      var team = this.teams[i];
      for (var j = 0; j < team.matches.length; j++) {
        var match = team.matches[j];
        if (!(match.computed)) {
          continue;
        }
        if (match.a_team.id === team.id) {
          match.a_points = team.fake_score();
        } else {
          match.b_points = team.fake_score();
        }
      }
    }
  };

  Ranker.prototype.reset = function() {
    for(var i = 1; i < this.teams.length; i++) {
      this.teams[i].reset();
    }
  };

  Ranker.prototype.standings = function() {
    // clone to avoid having to revert sorting
    var clone = this.teams.slice(1);
    // Sort by record (wins, tiesx0.5) then by points for
    clone.sort(Team.comparator);

    for(var i = 0; i < clone.length; i++) {
      clone[i].ranks[i] = clone[i].ranks[i] || 0
      clone[i].ranks[i] += 1;
    }
  };

  module.exports = Ranker;

