$(function() {
  console.log("Ready");

  var app = new Vue({
    el: '#app',
    data: {
      leagues: [],
      icons: ['fa-taxi', 'fa-plane', 'fa-rocket', 'fa-fighter-jet', 'fa-ship', 'fa-train', 'fa-space-shuttle', 'fa-motorcycle'].shuffle()
    }
  })

  $.getJSON("/leagues.json", function( leagues ) {
    console.log("Leagues:", leagues);
    app.leagues = leagues;
  });
});
