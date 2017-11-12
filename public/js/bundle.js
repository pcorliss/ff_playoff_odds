// Cribbed from https://stackoverflow.com/questions/7343890/standard-deviation-javascript
Array.prototype.stanDeviate = function(){
   var i,j,total = 0, mean = 0, diffSqredArr = [];
   for(i=0;i<this.length;i+=1){
       total+=this[i];
   }
   mean = total/this.length;
   for(j=0;j<this.length;j+=1){
       diffSqredArr.push(Math.pow((this[j]-mean),2));
   }
   return (Math.sqrt(diffSqredArr.reduce(function(firstEl, nextEl){
            return firstEl + nextEl;
          })/this.length));
};

Array.prototype.mean = function(){
   var i,total = 0;
   for(i=0;i<this.length;i+=1){
       total+=this[i];
   }
   return total/this.length;
};



//var f = [1,2,3,4,5,6,7,8,9];
//var mean = f.mean();
//var stdDev = f.stanDeviate()
//var variance = stdDev * stdDev;
//var gaussian = require('gaussian');
//window.g = gaussian;
//var distribution = gaussian(mean, variance);
//// Take a random sample using inverse transform sampling method. 
//var sample = distribution.ppf(Math.random());
//console.log("Sample: " + sample);
//
