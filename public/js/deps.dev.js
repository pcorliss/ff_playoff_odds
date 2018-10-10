(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function(exports) {

  // Complementary error function
  // From Numerical Recipes in C 2e p221
  var erfc = function(x) {
    var z = Math.abs(x);
    var t = 1 / (1 + z / 2);
    var r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 +
            t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 +
            t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 +
            t * (-0.82215223 + t * 0.17087277)))))))))
    return x >= 0 ? r : 2 - r;
  };

  // Inverse complementary error function
  // From Numerical Recipes 3e p265
  var ierfc = function(x) {
    if (x >= 2) { return -100; }
    if (x <= 0) { return 100; }

    var xx = (x < 1) ? x : 2 - x;
    var t = Math.sqrt(-2 * Math.log(xx / 2));

    var r = -0.70711 * ((2.30753 + t * 0.27061) /
            (1 + t * (0.99229 + t * 0.04481)) - t);

    for (var j = 0; j < 2; j++) {
      var err = erfc(r) - xx;
      r += err / (1.12837916709551257 * Math.exp(-(r * r)) - r * err);
    }

    return (x < 1) ? r : -r;
  };

  // Models the normal distribution
  var Gaussian = function(mean, variance) {
    if (variance <= 0) {
      throw new Error('Variance must be > 0 (but was ' + variance + ')');
    }
    this.mean = mean;
    this.variance = variance;
    this.standardDeviation = Math.sqrt(variance);
  }

  // Probability density function
  Gaussian.prototype.pdf = function(x) {
    var m = this.standardDeviation * Math.sqrt(2 * Math.PI);
    var e = Math.exp(-Math.pow(x - this.mean, 2) / (2 * this.variance));
    return e / m;
  };

  // Cumulative density function
  Gaussian.prototype.cdf = function(x) {
    return 0.5 * erfc(-(x - this.mean) / (this.standardDeviation * Math.sqrt(2)));
  };

  // Percent point function
  Gaussian.prototype.ppf = function(x) {
    return this.mean - this.standardDeviation * Math.sqrt(2) * ierfc(2 * x);
  };

  // Product distribution of this and d (scale for constant)
  Gaussian.prototype.mul = function(d) {
    if (typeof(d) === "number") {
      return this.scale(d);
    }
    var precision = 1 / this.variance;
    var dprecision = 1 / d.variance;
    return fromPrecisionMean(
        precision + dprecision, 
        precision * this.mean + dprecision * d.mean);
  };

  // Quotient distribution of this and d (scale for constant)
  Gaussian.prototype.div = function(d) {
    if (typeof(d) === "number") {
      return this.scale(1 / d);
    }
    var precision = 1 / this.variance;
    var dprecision = 1 / d.variance;
    return fromPrecisionMean(
        precision - dprecision, 
        precision * this.mean - dprecision * d.mean);
  };

  // Addition of this and d
  Gaussian.prototype.add = function(d) {
    return gaussian(this.mean + d.mean, this.variance + d.variance);
  };

  // Subtraction of this and d
  Gaussian.prototype.sub = function(d) {
    return gaussian(this.mean - d.mean, this.variance + d.variance);
  };

  // Scale this by constant c
  Gaussian.prototype.scale = function(c) {
    return gaussian(this.mean * c, this.variance * c * c);
  };

  var gaussian = function(mean, variance) {
    return new Gaussian(mean, variance);
  };

  var fromPrecisionMean = function(precision, precisionmean) {
    return gaussian(precisionmean / precision, 1 / precision);
  };

  exports(gaussian);
})
(typeof(exports) !== "undefined"
    ? function(e) { module.exports = e; }
    : function(e) { this["gaussian"] = e; });

},{}],2:[function(require,module,exports){
// Cribbed from https://stackoverflow.com/questions/7343890/standard-deviation-javascript
Array.prototype.stanDeviate = function(){
   var j, diffSqredArr = [];

   for(j=0;j<this.length;j+=1){
       diffSqredArr.push(Math.pow((this[j]-this.mean()),2));
   }
   return (Math.sqrt(diffSqredArr.reduce(function(firstEl, nextEl){
            return firstEl + nextEl;
          })/this.length));
};

Array.prototype.mean = function(){
  return this.sum() / this.length;
};

Array.prototype.sum = function(){
  var i,total = 0;
  for(i=0;i<this.length;i+=1){
    if(this[i]){
      total += Number(this[i]);
    }
  }
  return total;
};

// Cribbed from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
Array.prototype.shuffle = function(){
  var currentIndex = this.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = this[currentIndex];
    this[currentIndex] = this[randomIndex];
    this[randomIndex] = temporaryValue;
  }

  return this;
}

Number.prototype.round = function(digits){
  return Math.round(this * Math.pow(10, digits)) / Math.pow(10, digits);
};

window.gaussian = require('gaussian');
window.Team = require('./team.js');
window.Match = require('./match.js');
window.Ranker = require('./ranker.js');

},{"./match.js":3,"./ranker.js":4,"./team.js":5,"gaussian":1}],3:[function(require,module,exports){
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

module.exports = Match;

},{}],4:[function(require,module,exports){
function Ranker(iterations, scores) {
  this.teams = [];
  this.load(scores);
  this.iterations = 0;
  this.iterate(iterations);
  this.h2h = false;
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
        // This literally comes in as a stringified 0 or 1
        if(matchups[i].is_playoffs === "0"){
          new Match.from_json(this.teams, matchups[i]);
        }
      }
    }
  }
  return this.teams;
};

Ranker.prototype.compute = function() {
  for (var i = 1; i < this.teams.length; i++) {
    var team = this.teams[i];
    if (!team) { continue; }
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
    if (!this.teams[i]) { continue; }
    this.teams[i].reset();
  }
};

Ranker.prototype.standings = function() {
  // clone to avoid having to revert sorting
  var clone = this.teams.slice(1);
  // Setting this in the initializer causes a weird loading order issue
  var sort = this.h2h ? Team.headComparator : Team.comparator;
  clone.sort(sort);

  for(var i = 0; i < clone.length; i++) {
    if (!clone[i]) { continue; }
    clone[i].ranks[i] = clone[i].ranks[i] || 0
    clone[i].ranks[i] += 1;
  }
};

module.exports = Ranker;


},{}],5:[function(require,module,exports){
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

Team.prototype.fake_score = function() {
  this.scores || (this.scores = this.real_scores());
  this.mean || (this.mean = this.scores.mean());
  this.max || (this.max = Math.max.apply(null, this.scores));
  this.min || (this.min = Math.min.apply(null, this.scores));
  this.stddev || (this.stddev = this.scores.stanDeviate());
  this.stddev || (this.stddev = 20); // In the event that there's no std-deviation (week 1)
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

// TODO is cache a string "default"?
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

},{}]},{},[2]);
