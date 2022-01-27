let example = document.getElementById("example");
let context = example.getContext("2d");
let scoreValuesTracking=[]
let targetR
let targetG
let targetB
let highestScoredColorRGB
let scoredColorsArray = []
let targetRectCounter = 0
let userRectCounter = -1


function genTargetColor(){

  targetR = Math.floor(Math.random()*255)
  targetG = Math.floor(Math.random()*255)//255 - targetR
  targetB = Math.floor(Math.random()*255)

  document.getElementById("example");

  context.fillStyle = `rgb(${targetR},${targetG},${targetB})`;

  if (targetRectCounter == 0){

    context.fillRect(100, 30, 150, 150)
  }
  
  

  if (targetRectCounter == 1){

    context.fillRect(280, 30, 150, 150);
  }

  if (targetRectCounter == 2){

    context.fillRect(460, 30, 150, 150);
  }

  targetRectCounter ++
  userRectCounter ++

  console.log("user Rect equals: ", userRectCounter)
  console.log("Target color has been generated: ", `rgb(${targetR},${targetG},${targetB})`)
}

genTargetColor()

 function genColorChart(){
 let grd = context.createLinearGradient(90, 0, 900, 0);
  grd.addColorStop(((Math.random()).toFixed(2))/*0.01*/, "cyan"); 
  grd.addColorStop(0.1, "magenta");
  grd.addColorStop(0.25, "blue");
  grd.addColorStop(((Math.random()).toFixed(2)), `rgb(${targetR},${targetG},${targetB})`);
  /*grd.addColorStop(0.6, "yellow");
  grd.addColorStop(0.7, "red")
  grd.addColorStop(0.85, "white");*/
  grd.addColorStop(0.96, "black");
  context.fillStyle = grd;
  context.fillRect(100, 390, 900, 150)

}

//call function
  genColorChart()


  let colorAccuracy
  let statusOfClick = true;
  let countOfClicks = 0

//function removeList(){}


function toggleStatusOfClick() {
  
  statusOfClick = !statusOfClick;
  console.log("current status of statusOfClick: ", statusOfClick);
  console.log("current color is", currentColor)

  if (!statusOfClick){

  calcAccuracy()
  listResults(colorAccuracy)
}


  countOfClicks ++

  console.log("count of clicks is: ", countOfClicks)
  console.log("seems that sub-round is ended here")

  document.querySelector("#displayFeedback").innerHTML =''


  if (countOfClicks % 2 == 0){

    genTargetColor()}

    

  if (countOfClicks % 6 == 0){

    genColorChart()

    countOfClicks = 0


let newFeedback = document.createElement("p")
    newFeedback.classList.add("scale-up-center")


      newFeedback.innerHTML = `Your best sensitivity is <span class="colored"> ${Math.max(...scoreValuesTracking)}% </span>for<span class="colored"><br>that spectrum.</span>`;
      document.querySelector("#displayFeedback").appendChild(newFeedback);


    
    
    highestScoredColorRGB = scoredColorsArray[scoreValuesTracking.indexOf(Math.max(...scoreValuesTracking))]

    console.log(
      "this is highest scored color : ", highestScoredColorRGB )
  //targetRectCounter++
  console.log("target rectangles counter equals: ", targetRectCounter)
    scoreValuesTracking=[]
    scoredColorsArray = []

    document.querySelector("#listParent").innerHTML = ""


    document.querySelectorAll("span").forEach(function(span){
      span.style.color = `rgb(${highestScoredColorRGB[0]}, ${highestScoredColorRGB[1]}, ${highestScoredColorRGB[2]})`
    });

    console.log("to kod rgb spanu", `rgb(${highestScoredColorRGB[0]}, ${highestScoredColorRGB[1]}, ${highestScoredColorRGB[2]})`)
  }
}


function calcAccuracy(){

  colorAccuracy = +((1-((((targetR - userR)**2 + (targetG - userG)**2 + (targetB - userB)**2)**0.5)/(255**2+255**2+255**2)**0.5))*100).toFixed(0)
  console.log("typeof colorAccuracy is", typeof(colorAccuracy))
  console.log("accuracy equals", colorAccuracy)
}


listResults = function(arg) {

  let results = document.getElementById("listParent");
      var newLi = document.createElement("li");
      newLi.classList.add("scale-up-center")

      newLi.innerHTML = `${arg}%`;
      results.appendChild(newLi);

      scoreValuesTracking.push(arg)
      console.log("Your score is: ", scoreValuesTracking)

      scoredColorsArray.push(currentColor)
      //console.log("this is scoredColorsArray: ", scoredColorsArray)
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


if (userRectCounter == 0){

    context.fillRect(100, 210, 150, 150);
}


if (userRectCounter == 1){

      context.fillRect(280, 210, 150, 150);
}

if (userRectCounter == 2){

        context.fillRect(460, 210, 150, 150);
        
        }
        
        
        

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

