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
