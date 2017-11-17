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

window.gaussian = require('gaussian');
