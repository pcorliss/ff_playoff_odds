class Team
  constructor: (id, owner, name) ->
    @id = id
    @owner = owner
    @name = name
    @matches = []

  my_score: (match) ->
    if match.a_team.id == @id
      match.a_points
    else
      match.b_points

  real_scores: ->
    @my_score(match) for match in @real_matches()

  real_matches: ->
    match for match in @matches when !match.computed()
  fake_matches: ->
    match for match in @matches when match.computed()

  fake_score: ->
    @scores ||= @real_scores()
    @mean ||= scores.mean()
    @stddev ||= scores.stanDeviate()
    @distribution ||= gaussian(mean, stddev * stddev)
    @distribution.ppf Math.random()

  ties: ->
    @record()[2]

  losses: ->
    @record()[1]

  wins: ->
    @record()[0]

  record: ->
    return @record if @record
    win = 0
    loss = 0
    tie = 0
    for match in @matches when match.complete()
      a = match.a_points
      b = match.b_points

      if match.a_team.id != @id
        tmp = a
        a = b
        b = tmp

      if a > b
        win += 1
      else if b > a
        loss += 1
      else
        tie += 1

    @record = [win, loss, tie]

  points_for: ->
    (@my_score(match) for match in @matches).reduce (t, s) -> t + s

class Match
  constructor: (week, a_team, b_team, a_points, b_points) ->
    @week = week;
    @a_team = a_team;
    @b_team = b_team;
    @a_points = a_points;
    @b_points = b_points;
    @computed = @incomplete()

  complete: ->
    @a_points != 0 && @b_points != 0

  incomplete: ->
    !@complete()

class Ranker
  constructor: (iterations, playoff_spots, bye_week_spots, scores) ->
    load(scores)
    #for i in (1...iterations)
      #standings = compute()
      #reset()

  load: (scores)  ->
    @teams = []
    for week in scores
      for match in week
        bar()
        # Find or Create Team
        # Parse Score
        # Create Matchup

  compute: ->
    for match in @matches when match.incomplete()
      match.a_points = match.a_team.fake_score()
      match.b_points = match.b_team.fake_score()

    # sort teams by wins, ties, pts_for
    # return rankins

  reset: ->
    for match in @matches when match.computed()
      match.a_points = 0
      match.b_points = 0
