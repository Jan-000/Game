let example = document.getElementById("example");
let context = example.getContext("2d");
let scoreValuesTracking = [];
let highestScoredColorRGB;
let scoredColorsArray = [];
let targetRectCounter = 0;
let userRectCounter = -1;
let targetColorTriplet = [];
let targetPointTriplet = [];
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

const TARGET_ROW_Y = 30;
const SWATCH_SIZE = 90;
const SWATCH_GAP = 25;
const VERTICAL_GAP = SWATCH_GAP;
const USER_ROW_Y = TARGET_ROW_Y + SWATCH_SIZE + VERTICAL_GAP;
const SWATCH_START_X = 100;

const GRADIENT_X = 100;
const GRADIENT_Y = USER_ROW_Y + SWATCH_SIZE + VERTICAL_GAP;
const GRADIENT_SIZE = 320;

let cornerTopLeft;
let cornerTopRight;
let cornerBottomLeft;
let cornerBottomRight;
let hasDismissedIntroHint = false;
let isIntroHintFading = false;
let introHintOpacity = 0.5;
let introHintFadeFrameId = null;
let isAdvancingProbe = false;
let hasFinishedRound = false;

function randomRgb() {
  return [
    Math.floor(Math.random() * 255),
    Math.floor(Math.random() * 255),
    Math.floor(Math.random() * 255),
  ];
}

function toRgbString(color) {
  return `rgb(${color[0]},${color[1]},${color[2]})`;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function sampleFromCorners(u, v) {
  const top = [
    lerp(cornerTopLeft[0], cornerTopRight[0], u),
    lerp(cornerTopLeft[1], cornerTopRight[1], u),
    lerp(cornerTopLeft[2], cornerTopRight[2], u),
  ];

  const bottom = [
    lerp(cornerBottomLeft[0], cornerBottomRight[0], u),
    lerp(cornerBottomLeft[1], cornerBottomRight[1], u),
    lerp(cornerBottomLeft[2], cornerBottomRight[2], u),
  ];

  return [
    Math.round(lerp(top[0], bottom[0], v)),
    Math.round(lerp(top[1], bottom[1], v)),
    Math.round(lerp(top[2], bottom[2], v)),
  ];
}

function drawGradientFromCorners() {
  const imageData = context.createImageData(GRADIENT_SIZE, GRADIENT_SIZE);
  const data = imageData.data;

  for (let y = 0; y < GRADIENT_SIZE; y++) {
    const v = y / (GRADIENT_SIZE - 1);
    for (let x = 0; x < GRADIENT_SIZE; x++) {
      const u = x / (GRADIENT_SIZE - 1);
      const [r, g, b] = sampleFromCorners(u, v);
      const index = (y * GRADIENT_SIZE + x) * 4;
      data[index] = r;
      data[index + 1] = g;
      data[index + 2] = b;
      data[index + 3] = 255;
    }
  }

  context.putImageData(imageData, GRADIENT_X, GRADIENT_Y);
}

function drawIntroHint(opacity = introHintOpacity) {
  context.save();
  context.fillStyle = `rgba(255, 255, 255, ${opacity})`;
  context.font = "700 24px sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  const centerX = GRADIENT_X + GRADIENT_SIZE / 2;
  const centerY = GRADIENT_Y + GRADIENT_SIZE / 2;
  const lineGap = 30;

  context.fillText("click the", centerX, centerY - lineGap / 2);
  context.fillText("matching color", centerX, centerY + lineGap / 2);
  context.restore();
}

function hideIntroHintImmediately() {
  if (hasDismissedIntroHint) {
    return;
  }

  if (introHintFadeFrameId !== null) {
    cancelAnimationFrame(introHintFadeFrameId);
    introHintFadeFrameId = null;
  }

  drawGradientFromCorners();
  introHintOpacity = 0;
  isIntroHintFading = false;
  hasDismissedIntroHint = true;
}

function startIntroHintFade() {
  if (hasDismissedIntroHint || isIntroHintFading) {
    return;
  }

  isIntroHintFading = true;
  const startTime = performance.now();
  const fadeDurationMs = 3000;

  function step(now) {
    const progress = Math.min((now - startTime) / fadeDurationMs, 1);
    introHintOpacity = 0.5 * (1 - progress);

    drawGradientFromCorners();

    if (progress < 1) {
      drawIntroHint(introHintOpacity);
      introHintFadeFrameId = requestAnimationFrame(step);
      return;
    }

    introHintFadeFrameId = null;
    isIntroHintFading = false;
    hasDismissedIntroHint = true;
  }

  introHintFadeFrameId = requestAnimationFrame(step);
}

function isInsideColorChart(x, y) {
  return (
    x >= GRADIENT_X &&
    x <= GRADIENT_X + GRADIENT_SIZE &&
    y >= GRADIENT_Y &&
    y <= GRADIENT_Y + GRADIENT_SIZE
  );
}

function drawEndMessageOnChart() {
  context.save();
  context.fillStyle = "rgba(255, 255, 255, 0.9)";
  context.font = "700 24px sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";

  const centerX = GRADIENT_X + GRADIENT_SIZE / 2;
  const centerY = GRADIENT_Y + GRADIENT_SIZE / 2;
  const lineGap = 30;

  context.fillText("refresh to", centerX, centerY - lineGap / 2);
  context.fillText("play again", centerX, centerY + lineGap / 2);
  context.restore();
}

function genTargetColorTriplet() {
  targetPointTriplet = [];
  targetColorTriplet = [];

  for (let i = 0; i < 3; i++) {
    const u = Math.random();
    const v = Math.random();
    const color = sampleFromCorners(u, v);
    targetPointTriplet.push([u, v]);
    targetColorTriplet.push(toRgbString(color));
  }

  [targetR1, targetG1, targetB1] = sampleFromCorners(
    targetPointTriplet[0][0],
    targetPointTriplet[0][1]
  );
  [targetR2, targetG2, targetB2] = sampleFromCorners(
    targetPointTriplet[1][0],
    targetPointTriplet[1][1]
  );
  [targetR3, targetG3, targetB3] = sampleFromCorners(
    targetPointTriplet[2][0],
    targetPointTriplet[2][1]
  );

  targetColor1 = targetColorTriplet[0];
  targetColor2 = targetColorTriplet[1];
  targetColor3 = targetColorTriplet[2];
}

function drawTargets() {
  if (targetRectCounter == 0) {
    context.fillStyle = targetColor1;
    context.fillRect(SWATCH_START_X, TARGET_ROW_Y, SWATCH_SIZE, SWATCH_SIZE);
  }

  if (targetRectCounter == 1) {
    context.fillStyle = targetColor2;
    context.fillRect(
      SWATCH_START_X + SWATCH_SIZE + SWATCH_GAP,
      TARGET_ROW_Y,
      SWATCH_SIZE,
      SWATCH_SIZE
    );
  }

  if (targetRectCounter == 2) {
    context.fillStyle = targetColor3;
    context.fillRect(
      SWATCH_START_X + (SWATCH_SIZE + SWATCH_GAP) * 2,
      TARGET_ROW_Y,
      SWATCH_SIZE,
      SWATCH_SIZE
    );
  }

  targetRectCounter++;
  userRectCounter++;
}

function fadeInNextTarget(delayMs = 50, durationMs = 400) {
  if (targetRectCounter > 2) {
    return;
  }

  isAdvancingProbe = true;

  setTimeout(function () {
    const targetIndex = targetRectCounter;
    const x = SWATCH_START_X + (SWATCH_SIZE + SWATCH_GAP) * targetIndex;
    const targetColor = [targetColor1, targetColor2, targetColor3][targetIndex];
    const startTime = performance.now();

    function frame(now) {
      const progress = Math.min((now - startTime) / durationMs, 1);

      context.clearRect(x, TARGET_ROW_Y, SWATCH_SIZE, SWATCH_SIZE);
      context.save();
      context.globalAlpha = progress;
      context.fillStyle = targetColor;
      context.fillRect(x, TARGET_ROW_Y, SWATCH_SIZE, SWATCH_SIZE);
      context.restore();

      if (progress < 1) {
        requestAnimationFrame(frame);
        return;
      }

      targetRectCounter++;
      userRectCounter++;
      statusOfClick = true;
      isAdvancingProbe = false;
    }

    requestAnimationFrame(frame);
  }, delayMs);
}

function genColorChart() {
  cornerTopLeft = randomRgb();
  cornerTopRight = randomRgb();
  cornerBottomLeft = randomRgb();
  cornerBottomRight = randomRgb();
  drawGradientFromCorners();
}

function drawRoundStart() {
  genColorChart();
  genTargetColorTriplet();
  drawTargets();
  introHintOpacity = 0.5;
  drawIntroHint();
}

drawRoundStart();

let colorAccuracy;
let statusOfClick = true;
let countOfClicks = 0;

function toggleStatusOfClick(e) {
  if (isAdvancingProbe || hasFinishedRound) {
    return;
  }

  statusOfClick = !statusOfClick;
 
  if (!statusOfClick) {
    calcAccuracy();
    listResults(colorAccuracy);

    if (scoreValuesTracking.length < 3) {
      fadeInNextTarget(500, 500);
    }
  }
  countOfClicks++;

  document.querySelector("#displayFeedback").innerHTML = "";

  if (scoreValuesTracking.length == 3) {
    hasFinishedRound = true;
    statusOfClick = false;
    drawEndMessageOnChart();

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
  if (hasFinishedRound) {
    return;
  }

  const rect = example.getBoundingClientRect();
  var x = e.clientX - rect.left;
  var y = e.clientY - rect.top;

  if (!hasDismissedIntroHint && isInsideColorChart(x, y)) {
    startIntroHintFade();
  }

  if (statusOfClick == true) {
    if (
      x < GRADIENT_X ||
      x > GRADIENT_X + GRADIENT_SIZE ||
      y < GRADIENT_Y ||
      y > GRADIENT_Y + GRADIENT_SIZE
    ) {
      return;
    }

    var c = document.getElementById("example").getContext("2d");
    var p = c.getImageData(x, y, 1, 1).data;
    context.fillStyle = `rgb(${p[0]},${p[1]},${p[2]})`;

    if (userRectCounter == 0) {
      context.fillRect(SWATCH_START_X, USER_ROW_Y, SWATCH_SIZE, SWATCH_SIZE);
    }
    if (userRectCounter == 1) {
      context.fillRect(
        SWATCH_START_X + SWATCH_SIZE + SWATCH_GAP,
        USER_ROW_Y,
        SWATCH_SIZE,
        SWATCH_SIZE
      );
    }
    if (userRectCounter == 2) {
      context.fillRect(
        SWATCH_START_X + (SWATCH_SIZE + SWATCH_GAP) * 2,
        USER_ROW_Y,
        SWATCH_SIZE,
        SWATCH_SIZE
      );
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
