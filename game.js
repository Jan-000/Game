let targetR
let targetG
let targetB

function genTargetColor(){

  targetR = Math.floor(Math.random()*255)
  targetG = Math.floor(Math.random()*255)
  targetB = Math.floor(Math.random()*255)
}

genTargetColor()

let example = document.getElementById("example");
let context = example.getContext("2d");
context.fillStyle = `rgb(${targetR},${targetG},${targetB})`;
context.fillRect(100, 30, 150, 150);

 function genColorChart(){
 let grd = context.createLinearGradient(90, 0, 900, 0);
  grd.addColorStop(0.05, "magenta");
  grd.addColorStop(0.25, "blue");
  grd.addColorStop(/*((Math.random()).toFixed(2))*/0.5, "green");
  grd.addColorStop(0.6, "yellow");
  grd.addColorStop(0.7, "red")
  grd.addColorStop(0.95, "white");
  context.fillStyle = grd;
  context.fillRect(100, 390, 900, 150)
}

//call function
  genColorChart()

  let colorAccuracy
  let statusOfClick = true;
  //let countOfClicks = 0


function toggleStatusOfClick() {
  statusOfClick = !statusOfClick;
  console.log("current status of statusOfClick: ", statusOfClick);
  console.log("current color is", currentColor)

  if (!statusOfClick){
  calcAccuracy()
  listResults(colorAccuracy)}
  //document.body.style.setProperty('--main-color',"#00aa00")
  //countOfClicks ++
  //console.log("count of clicks is: ", countOfClicks)
}



function calcAccuracy(){
  //console.log("target B is: ",targetB)
  //console.log("user B is: ", userB)
  colorAccuracy = ((1-((((targetR - userR)**2 + (targetG - userG)**2 + (targetB - userB)**2)**0.5)/(255**2+255**2+255**2)**0.5))*100).toFixed(0)
  console.log("typeof colorAccuracy is", typeof(colorAccuracy))
  console.log("accuracy equals", colorAccuracy)

}


listResults = function(arg) {

  let results = document.getElementById("results");
      var newLi = document.createElement("li");
      newLi.innerHTML = `${arg}%`;
      results.appendChild(newLi);
}


let clickableSpace = document.getElementById("example");
    clickableSpace.addEventListener("click", toggleStatusOfClick);

    let currColor
    let userR, userG, userB

function hoverRgb(e) {

  if (statusOfClick == true) {
    var x = e.pageX;
    var y = e.pageY;
    var c = document.getElementById("example").getContext("2d");
    var p = c.getImageData(x, y, 1, 1).data;
    context.fillStyle = `rgb(${p[0]},${p[1]},${p[2]})`;
    context.fillRect(100, 210, 150, 150);

    $("#status").html(
      `${p[0]}` + `\xa0\xa0` + `${p[1]}` + `\xa0\xa0` + `${p[2]}`
    );
     userR = p[0]
     userG = p[1]
     userB = p[2]

  } currentColor = [userR, userG, userB]

}

//abhören
document.getElementById("example").addEventListener("mousemove", hoverRgb);


//flag 



