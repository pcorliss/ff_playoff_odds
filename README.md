# Fantasy Football Playoff Odds Calculator

http://ffodds.50projects.com/

## Building

```
nvm install
yarn install
browserify public/js/bundle.js > public/js/deps.dev.js
browserify public/js/bundle.js | uglifyjs > public/js/deps.min.js
```

## Usage

Gather a CSV in the format specified below. For me I navigated to http://games.espn.com/ffl/schedule?leagueId=myLeagueId where `myLeagueId` is substituted for your own.
Then I pasted the table results into Google Sheets, adjusted the headers, and exported a CSV.

10000-100000 simulations are recommended to get an accurate number

```
gem install bundler
bundle
./process.rb [simultaions] < properly_formatted.csv
```

### Proper CSV File Format

```csv
Week,Away Team,Away Owner,at,Team,Owner,Results
1,Team G (4-7),S G,at,Team R (10-1),C R,127-158
1,Team O (4-7),M O,at,HMS Pinafore (9-2),Philip Corliss,139-158
1,A (5-6),A B,at,Team B (4-7),K B,90-138
1,Team Y (5-6),A Y,at,NationalAnthem Kneelers (3-8),J P,98-96
1,Team T (5-6),R T,at,Team S (6-5),J S,118-141
2,Team R (10-1),C R,at,Team S (6-5),J S,113-150
2,HMS Pinafore (9-2),Philip Corliss,at,Team G (4-7),S G,141-95
2,Team O (4-7),M O,at,A (5-6),A B,100-114
2,Team B (4-7),K B,at,Team Y (5-6),A Y,158-108
2,NationalAnthem Kneelers (3-8),J P,at,Team T (5-6),R T,100-90
3,HMS Pinafore (9-2),Philip Corliss,at,Team R (10-1),C R,Preview
3,Team G (4-7),S G,at,A (5-6),A B,Preview
3,Team Y (5-6),A Y,at,Team O (4-7),M O,Preview
3,Team T (5-6),R T,at,Team B (4-7),K B,Preview
3,NationalAnthem Kneelers (3-8),J P,at,Team S (6-5),J S,Preview
```

## TODO

* ~Allow selection of league~
* ~Auth -> League Selection -> Odds~
* ~Check for XSS exploits~
* ~Add Spinners/Loaders~
* ~Run More Iterations Button~
* ~Handle Mid-Event stuff~
* ~Get Hosted~
* ~Allow saving/caching/sharing of pages~
* ~Google Analytics~
* ~Footers and Headers~
* ~Remove caching and temporary code~
* Convert to entirely client-side - node -?
* Best Case Scenario (Beat blank, foo loses, etc..) Display
* ~Add Icons/Graphics~
* Allow tweaking of match results
* Clean up and dedupe JS
* Exportable results
* ~Fixed Leagues - 12719, 417490, 547959 371.l.278424 371.l.29221, 211544, 82981~
* Support head to head tie-breakers
* Division Support - 45891, 45891
* ?? 371.l.395119
* Fix json_csrf
  * https://haacked.com/archive/2008/11/20/anatomy-of-a-subtle-json-vulnerability.aspx/

* Average total season points and standard deviation
* Average total number of wins
* Average points and standard deviation for whatever the next week is,
  plus graph
* Show example of scenario
* Division support
* H2H tie-breaker support
* Previous week display support
* Flavor text or helper text
* SEO optimization
* ESPN Support
* ~1st vs 1 2nd vs 2~
* ~Donate Button~
* ~Fix Sorting~
* ~Push state for URL~

https://api.myfantasyleague.com/2017/api_info

### Maintenance

`heroku pg:backups:capture && heroku pg:backups:download && pg_restore --verbose --clean --no-acl --no-owner -h localhost -U ffodds -d ffodds latest.dump`
