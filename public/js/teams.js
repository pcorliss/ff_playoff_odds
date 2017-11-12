// Generated by CoffeeScript 1.7.1
(function() {
  var Match, Ranker, Team;

  Team = (function() {
    function Team(id, owner, name) {
      this.id = id;
      this.owner = owner;
      this.name = name;
      this.matches = [];
      this.ranks = [];
    }

    Team.find_or_create = function(teams, team) {
      if (!teams[team.team_id]) {
        teams[team.team_id] = new Team(team.team_id, team.managers.manager.nickname, team.name);
      }
      return teams[team.team_id];
    };

    Team.prototype.my_score = function(match) {
      if (match.a_team.id === this.id) {
        return Number(match.a_points);
      } else {
        return Number(match.b_points);
      }
    };

    Team.prototype.real_scores = function() {
      var match, _i, _len, _ref, _results;
      _ref = this.real_matches();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        match = _ref[_i];
        _results.push(this.my_score(match));
      }
      return _results;
    };

    Team.prototype.real_matches = function() {
      var match, _i, _len, _ref, _results;
      _ref = this.matches;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        match = _ref[_i];
        if (!match.computed) {
          _results.push(match);
        }
      }
      return _results;
    };

    Team.prototype.fake_matches = function() {
      var match, _i, _len, _ref, _results;
      _ref = this.matches;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        match = _ref[_i];
        if (match.computed) {
          _results.push(match);
        }
      }
      return _results;
    };

    Team.prototype.fake_score = function() {
      this.scores || (this.scores = this.real_scores());
      this.mean || (this.mean = this.scores.mean());
      this.stddev || (this.stddev = this.scores.stanDeviate());
      this.distribution || (this.distribution = window.gaussian(this.mean, this.stddev * this.stddev));
      return this.distribution.ppf(Math.random()).toFixed(2);
    };

    Team.prototype.ties = function() {
      return this.records()[2];
    };

    Team.prototype.losses = function() {
      return this.records()[1];
    };

    Team.prototype.wins = function() {
      return this.records()[0];
    };

    Team.prototype.records = function() {
      var a, b, loss, match, tie, tmp, win, _i, _len, _ref;
      if (this.record) {
        return this.record;
      }
      win = 0;
      loss = 0;
      tie = 0;
      _ref = this.matches;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        match = _ref[_i];
        //if (!(match.complete())) {
          //continue;
        //}
        a = match.a_points;
        b = match.b_points;
        if (match.a_team.id !== this.id) {
          tmp = a;
          a = b;
          b = tmp;
        }
        if (a > b) {
          win += 1;
        } else if (b > a) {
          loss += 1;
        } else {
          tie += 1;
        }
      }
      return this.record = [win, loss, tie];
    };

    Team.prototype.points_for = function() {
      var match;
      return ((function() {
        var _i, _len, _ref, _results;
        _ref = this.matches;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          match = _ref[_i];
          _results.push(this.my_score(match));
        }
        return _results;
      }).call(this)).reduce(function(t, s) {
        return t + s;
      });
    };

    Team.prototype.reset = function() {
      var matches = this.fake_matches();
      this.record = null;
      for(var i = 0; i < matches.length; i++) {
        matches[i].a_points = 0;
        matches[i].b_points = 0;
      }
    };

    Team.comparator = function(a, b) {
      // Negative is better
      var a_s = (a.wins() + a.ties() * 0.5);
      var b_s = (b.wins() + b.ties() * 0.5);
      if (a_s == b_s) {
        if (a.points_for() > b.points_for()) {
          return -1;
        } else {
          return 1;
        }
      } else if (a_s > b_s) {
        return -1;
      } else {
        return 1;
      }
    };

    return Team;

  })();

  Match = (function() {
    function Match(week, a_team, b_team, a_points, b_points, status) {
      this.week = week;
      this.a_team = a_team;
      this.b_team = b_team;
      this.a_points = Number(a_points);
      this.b_points = Number(b_points);
      this.status = status;
      this.computed = this.incomplete();
    }

    Match.from_json = function(teams, json) {
      var wk = json.week;
      var a = Team.find_or_create(teams, json.teams.team[0]);
      var b = Team.find_or_create(teams, json.teams.team[1]);
      var ap = json.teams.team[0].team_points.total;
      var bp = json.teams.team[1].team_points.total;
      var match = new Match(wk, a, b, ap, bp, json.status);
      a.matches[a.matches.length] = match;
      b.matches[b.matches.length] = match;
      return match;
    }

    Match.prototype.complete = function() {
      return this.status === "postevent"
    };

    Match.prototype.incomplete = function() {
      return !this.complete();
    };

    return Match;

  })();

  Ranker = (function() {
    function Ranker(iterations, playoff_spots, bye_week_spots, scores) {
      this.teams = [];
      this.load(scores);
      for(var i = 0; i < iterations; i++){
        this.compute();
        this.standings();
        this.reset();
      }
    }

    Ranker.prototype.load = function(scores) {
      for (var week in scores) {
        if(scores[week]) {
          var matchups = scores[week];
          for(var i = 0; i < matchups.length; i++) {
            new Match.from_json(this.teams, matchups[i]);
          }
        }
      }
      this.probs = Array(this.teams.length - 1);
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

    return Ranker;

  })();

  window.Team = Team;
  window.Match = Match;
  window.Ranker = Ranker;
}).call(this);
