l = League.create(
  name: 'Demo League',
  yahoo_id: 'demo',
  body: JSON.parse(File.read('db/fixtures/league.json')),
)

s = Score.new(
  week: 10,
  body: JSON.parse(File.read('db/fixtures/scores.json')),
)

l.scores = [s]
