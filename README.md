# Fantasy Football Playoff Odds Calculator

http://ffodds.50projects.com/

## Building

```
nvm install
yarn install
browserify public/js/bundle.js > public/js/deps.dev.js
browserify public/js/bundle.js | uglifyjs > public/js/deps.min.js
```

### Deploying

```
flyctl deploy
```

### DB Backup

```
fly proxy 15432:5433 -a ffodd-db
pg_dump --verbose --clean --no-acl --no-owner -h localhost --port 15432 -U postgres -d ffodd --format custom > latest.dump
pg_restore --verbose --clean --no-acl --no-owner -h localhost --port 5432 -U postgres -d ffodd latest.dump
```