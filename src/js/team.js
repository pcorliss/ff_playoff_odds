function Team(id, owner, name) {
  this.id = id;
  this.owner = owner;
  this.name = name;
  this.matches = [];
  this.ranks = [];
  this.record = {};
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

Team.prototype.opp_score = function(match) {
  if (match.a_team.id === this.id) {
    return Number(match.b_points);
  } else {
    return Number(match.a_points);
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

Team.prototype.head_matches = function(other) {
  var match, _i, _len, _ref, _results;
  _ref = this.matches;
  _results = [];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    match = _ref[_i];
    if (match.a_team === other || match.b_team === other) {
      _results.push(match);
    }
  }
  return _results;
};

Team.prototype.calc_stats = function(){
  if (this.cached_stats) { return; };
  this.scores || (this.scores = this.real_scores());
  this.mean || (this.mean = this.scores.mean());
  this.max || (this.max = Math.max.apply(null, this.scores));
  this.min || (this.min = Math.min.apply(null, this.scores));
  this.stddev || (this.stddev = this.scores.stanDeviate());
  this.stddev || (this.stddev = 20); // In the event that there's no std-deviation (week 1)
  this.distribution || (this.distribution = window.gaussian(this.mean, this.stddev * this.stddev));
  this.median || (this.median = this.scores.median());
  this.ptsFor || (this.ptsFor = this.points_for(this.real_matches()));
  this.ptsAgaint || (this.ptsAgainst = this.pointsAgainst(this.real_matches()));
  this.cached_stats = true;
};

Team.prototype.fake_score = function() {
  this.calc_stats();
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

Team.prototype.real_record = function() {
  return this.records(this.real_matches(), 'real');
};

Team.prototype.real_win_loss = function() {
  var r = this.real_record();
  if (r[2] > 0) {
    return  r[0] + "-" + r[1] + "-" + r[2];
  } else {
    return  r[0] + "-" + r[1];
  }
};

Team.prototype.records = function(matches, cache) {
  var matches = (typeof matches !== 'undefined') ?  matches : this.matches;
  var cache = (typeof cache !== 'undefined') ?  cache : 'default';
  var a, b, loss, match, tie, tmp, win, _i, _len;
  if (this.record[cache]) {
    return this.record[cache];
  }
  win = 0;
  loss = 0;
  tie = 0;
  for (_i = 0, _len = matches.length; _i < _len; _i++) {
    match = matches[_i];
    a = Number(match.a_points);
    b = Number(match.b_points);
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
  return this.record[cache] = [win, loss, tie];
};

Team.prototype.points_for = function(matches) {
  var matches = (typeof matches !== 'undefined') ?  matches : this.matches;
  var match;
  return ((function() {
    var _i, _len, _ref, _results;
    _ref = matches;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      match = _ref[_i];
      _results.push(this.my_score(match));
    }
    return _results;
  }).call(this)).reduce(function(t, s) {
    return Number(t + s).round(2);
  });
};

Team.prototype.pointsAgainst = function(matches) {
  var matches = (typeof matches !== 'undefined') ?  matches : this.matches;
  var match;
  return ((function() {
    var _i, _len, _ref, _results;
    _ref = matches;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      match = _ref[_i];
      _results.push(this.opp_score(match));
    }
    return _results;
  }).call(this)).reduce(function(t, s) {
    return Number(t + s).round(2);
  });
};

Team.prototype.reset = function() {
  var matches = this.fake_matches();
  this.record = {};
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

Team.prototype.h2hRecord = function(other) {
  return this.records(this.head_matches(other), 'head');
};

Team.headComparator = function(a, b) {
  // Negative is better
  var a_s = (a.wins() + a.ties() * 0.5);
  var b_s = (b.wins() + b.ties() * 0.5);
  if (a_s == b_s) {
    var record = a.h2hRecord(b);
    games_ahead = record[0] - record[1];
    if (games_ahead > 0) {
      return -1;
    } else if (games_ahead < 0) {
      return 1;
    }

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

module.exports = Team;
