let example = document.getElementById("example");
let context = example.getContext("2d");
let scoreValuesTracking = [];
let highestScoredColorRGB;
let scoredColorsArray = [];
let targetRectCounter = 0;
let userRectCounter = -1;
let targetColorTriplet = [];
let currColor;
let userR, userG, userB;
let targetR1,
    targetG1,
    targetB1,
    targetR2,
    targetG2,
    targetB2,
    targetR3,
    targetG3,
    targetB3;

function genTargetColorTriplet() {

  targetR1 = Math.floor(Math.random() * 255);
  targetG1 = Math.floor(Math.random() * 255);
  targetB1 = Math.floor(Math.random() * 255);
  targetColor1 = `rgb(${targetR1},${targetG1},${targetB1})`;

  targetR2 = Math.floor(Math.random() * 255);
  targetG2 = Math.floor(Math.random() * 255);
  targetB2 = Math.floor(Math.random() * 255);
  targetColor2 = `rgb(${targetR2},${targetG2},${targetB2})`;

  targetR3 = Math.floor(Math.random() * 255);
  targetG3 = Math.floor(Math.random() * 255);
  targetB3 = Math.floor(Math.random() * 255);
  targetColor3 = `rgb(${targetR3},${targetG3},${targetB3})`;

  targetColorTriplet.push(targetColor1, targetColor2, targetColor3);
}

function drawTargets() {
  //increases counters

  if (targetRectCounter == 0) {

    context.fillStyle = targetColor1;
    context.fillRect(100, 30, 100, 100);
  }

  if (targetRectCounter == 1) {

    context.fillStyle = targetColor2;
    context.fillRect(240, 30, 100, 100);
  }

  if (targetRectCounter == 2) {

    context.fillStyle = targetColor3;
    context.fillRect(380, 30, 100, 100);
  }

  targetRectCounter++;
  userRectCounter++;
}

genTargetColorTriplet();
drawTargets();

function genColorChart() {

  let grd = context.createLinearGradient(90, 0, 380, 0);

  grd.addColorStop(
    0,
    `rgb(${Math.floor(Math.random() * 255)},${Math.floor(
      Math.random() * 255
    )},${Math.floor(Math.random() * 255)})`
  );
  grd.addColorStop("0.25", targetColor3);
  grd.addColorStop("0.55", targetColor2);

  grd.addColorStop("0.75", targetColor1);
  grd.addColorStop(
    1,
    `rgb(${Math.floor(Math.random() * 255)},${Math.floor(
      Math.random() * 255
    )},${Math.floor(Math.random() * 255)})`
  );

  context.fillStyle = grd;
  context.fillRect(100, 314, 380, 100);
}
genColorChart();

let colorAccuracy;
let statusOfClick = true;
let countOfClicks = 0;

function toggleStatusOfClick() {

  statusOfClick = !statusOfClick;
 
  if (!statusOfClick) {
    calcAccuracy();
    listResults(colorAccuracy);
  }
  countOfClicks++;

  document.querySelector("#displayFeedback").innerHTML = "";

  if (countOfClicks % 2 == 0) {

    drawTargets();
  }

  if (countOfClicks % 6 == 0) {

    genColorChart();

    countOfClicks = 0;
    userRectCounter = 0;

    let newFeedback = document.createElement("p");

    newFeedback.classList.add("scale-up-center");

    newFeedback.innerHTML = `<span class="colored"> ${Math.max(
      ...scoreValuesTracking
    )}% </span>is your best sensitivity<br><span class="colored">for that spectrum.</span>`;

    newFeedback.innerHTML = `<span class="colored"> ${Math.max(
      ...scoreValuesTracking
    )}% </span>is your best sensitivity<br><span class="colored">within that spectrum.</span>
      <br><br><div class="smallPrint">Refresh to play again.</div>`;
    document.querySelector("#displayFeedback").appendChild(newFeedback);

    highestScoredColorRGB =
      scoredColorsArray[
        scoreValuesTracking.indexOf(Math.max(...scoreValuesTracking))
      ];


    //targetRectCounter++
    scoreValuesTracking = [];
    scoredColorsArray = [];
    document.querySelector("#listParent").innerHTML = "";
    document.querySelectorAll("span").forEach(function (span) {
      span.style.color = `rgb(${highestScoredColorRGB[0]}, ${highestScoredColorRGB[1]}, ${highestScoredColorRGB[2]})`;
    });
  }
}
function calcAccuracy() {

  if (userRectCounter == 0) {
    colorAccuracy = +(
      (1 -
        ((targetR1 - userR) ** 2 +
          (targetG1 - userG) ** 2 +
          (targetB1 - userB) ** 2) **
          0.5 /
          (255 ** 2 + 255 ** 2 + 255 ** 2) ** 0.5) *
      100
    ).toFixed(0);
  }
  if (userRectCounter == 1) {
    colorAccuracy = +(
      (1 -
        ((targetR2 - userR) ** 2 +
          (targetG2 - userG) ** 2 +
          (targetB2 - userB) ** 2) **
          0.5 /
          (255 ** 2 + 255 ** 2 + 255 ** 2) ** 0.5) *
      100
    ).toFixed(0);
  }
  if (userRectCounter == 2) {
    colorAccuracy = +(
      (1 -
        ((targetR3 - userR) ** 2 +
          (targetG3 - userG) ** 2 +
          (targetB3 - userB) ** 2) **
          0.5 /
          (255 ** 2 + 255 ** 2 + 255 ** 2) ** 0.5) *
      100
    ).toFixed(0);
  }
}
listResults = function (arg) {

  let results = document.getElementById("listParent");
  var newLi = document.createElement("li");

  newLi.classList.add("scale-up-center");
  newLi.innerHTML = `${arg}%`;
  results.appendChild(newLi);
  scoreValuesTracking.push(arg);
  scoredColorsArray.push(currentUserColor);
};

let clickableSpace = document.getElementById("example");
clickableSpace.addEventListener("click", toggleStatusOfClick);

function hoverRgb(e) {
  if (statusOfClick == true) {
    var x = e.pageX;
    var y = e.pageY;
    var c = document.getElementById("example").getContext("2d");
    var p = c.getImageData(x, y, 1, 1).data;
    context.fillStyle = `rgb(${p[0]},${p[1]},${p[2]})`;

    if (userRectCounter == 0) {
      context.fillRect(100, 170, 100, 100);
    }
    if (userRectCounter == 1) {
      context.fillRect(240, 170, 100, 100);
    }
    if (userRectCounter == 2) {
      context.fillRect(380, 170, 100, 100);
    }

    $("#status").html(
      `${p[0]}` + `\xa0\xa0` + `${p[1]}` + `\xa0\xa0` + `${p[2]}`
    );
    userR = p[0];
    userG = p[1];
    userB = p[2];
  }
  currentUserColor = [userR, userG, userB];
}

//abhören
document.getElementById("example").addEventListener("mousemove", hoverRgb);
