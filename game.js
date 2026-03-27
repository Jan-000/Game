let example = document.getElementById("example");
let context = example.getContext("2d");
let scoreValuesTracking = [];
let scoredColorsArray = [];
let displayedScores = [];
let targetRectCounter = 0;
let userRectCounter = -1;
let targetColorTriplet = [];
let targetPointTriplet = [];
let currColor;
let userR, userG, userB;
let hasActiveHoverColor = false;
let targetR1,
  targetG1,
  targetB1,
  targetR2,
  targetG2,
  targetB2,
  targetR3,
  targetG3,
  targetB3;

const SCORE_TEXT_BAND_HEIGHT = 34;

let TARGET_ROW_Y;
let SCORE_TEXT_TOP_Y;
let SWATCH_SIZE;
let SWATCH_GAP;
let VERTICAL_GAP;
let USER_ROW_Y;
let SWATCH_START_X;

let GRADIENT_X;
let GRADIENT_Y;
let GRADIENT_SIZE;
let SWATCH_NUDGE_PIXELS;

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
let topScoreIndex = -1;
let spectrumPairData = [];
let spectrumNudgeFrameId = null;
let isSpectrumNudging = false;
let hasQueuedFontScoreRefresh = false;

function updateCanvasSizeForViewport() {
  const isMobile = window.matchMedia("(max-width: 600px)").matches;

  if (isMobile) {
    const mobileWidth = Math.max(320, Math.floor(window.innerWidth * 0.95));
    const mobileHeight = Math.max(520, Math.floor(window.innerHeight * 0.9));
    example.width = mobileWidth;
    example.height = mobileHeight;
    return;
  }

  example.width = 800;
  example.height = 680;
}

function updateLayoutMetrics() {
  const maxGradientByWidth = Math.round(example.width * 0.84);
  const maxGradientByHeight = Math.round(
    (example.height - SCORE_TEXT_BAND_HEIGHT - 16) / 1.72
  );

  GRADIENT_SIZE = Math.max(220, Math.min(maxGradientByWidth, maxGradientByHeight, 540));
  SWATCH_GAP = Math.max(14, Math.round(GRADIENT_SIZE * 0.08));
  SWATCH_SIZE = Math.round((GRADIENT_SIZE - SWATCH_GAP * 2) / 3);
  VERTICAL_GAP = SWATCH_GAP;

  const blockHeight =
    SCORE_TEXT_BAND_HEIGHT +
    SWATCH_SIZE +
    VERTICAL_GAP +
    SWATCH_SIZE +
    VERTICAL_GAP +
    GRADIENT_SIZE;
  const blockTop = Math.max(0, Math.round((example.height - blockHeight) / 2));

  SCORE_TEXT_TOP_Y = blockTop;
  TARGET_ROW_Y = SCORE_TEXT_TOP_Y + SCORE_TEXT_BAND_HEIGHT;
  USER_ROW_Y = TARGET_ROW_Y + SWATCH_SIZE + VERTICAL_GAP;
  SWATCH_START_X = Math.round((example.width - GRADIENT_SIZE) / 2);
  GRADIENT_X = SWATCH_START_X;
  GRADIENT_Y = USER_ROW_Y + SWATCH_SIZE + VERTICAL_GAP;
  SWATCH_NUDGE_PIXELS = Math.max(5, Math.round(SWATCH_SIZE * 0.07));
}

function redrawAllScoreTexts() {
  for (let i = 0; i < displayedScores.length; i++) {
    drawScoreTextForIndex(i, i === topScoreIndex);
  }
}

function queueFontScoreRefresh() {
  if (hasQueuedFontScoreRefresh) {
    return;
  }
  hasQueuedFontScoreRefresh = true;

  if (!document.fonts || !document.fonts.load) {
    return;
  }

  document.fonts.load("700 24px Overpass").then(function () {
    redrawAllScoreTexts();
  }).catch(function () {
    // Keep current rendering if font loading API fails.
  });
}

function randomRgb() {
  return [
    Math.floor(Math.random() * 255),
    Math.floor(Math.random() * 255),
    Math.floor(Math.random() * 255),
  ];
}

function colorDistance(colorA, colorB) {
  return Math.sqrt(
    (colorA[0] - colorB[0]) ** 2 +
    (colorA[1] - colorB[1]) ** 2 +
    (colorA[2] - colorB[2]) ** 2
  );
}

function pickDistinctCornerColor(baseColors, minDistance = 150) {
  let bestCandidate = randomRgb();
  let bestMinDistance = -1;

  for (let i = 0; i < 80; i++) {
    const candidate = randomRgb();
    const distances = baseColors.map(function (baseColor) {
      return colorDistance(candidate, baseColor);
    });
    const candidateMinDistance = Math.min(...distances);

    if (candidateMinDistance >= minDistance) {
      return candidate;
    }

    if (candidateMinDistance > bestMinDistance) {
      bestMinDistance = candidateMinDistance;
      bestCandidate = candidate;
    }
  }

  return bestCandidate;
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

  context.fillText("tap to", centerX, centerY - lineGap / 2);
  context.fillText("play again", centerX, centerY + lineGap / 2);
  context.restore();
}

function getCanvasPointFromEvent(e) {
  const rect = example.getBoundingClientRect();
  const scaleX = example.width / rect.width;
  const scaleY = example.height / rect.height;

  let source = e;
  if (e.changedTouches && e.changedTouches.length) {
    source = e.changedTouches[0];
  } else if (e.touches && e.touches.length) {
    source = e.touches[0];
  }

  if (
    typeof source.clientX !== "number" ||
    typeof source.clientY !== "number"
  ) {
    return null;
  }

  return {
    x: (source.clientX - rect.left) * scaleX,
    y: (source.clientY - rect.top) * scaleY,
  };
}

function resetAndStartNewRound() {
  if (introHintFadeFrameId !== null) {
    cancelAnimationFrame(introHintFadeFrameId);
    introHintFadeFrameId = null;
  }
  if (spectrumNudgeFrameId !== null) {
    cancelAnimationFrame(spectrumNudgeFrameId);
    spectrumNudgeFrameId = null;
  }

  context.clearRect(0, 0, example.width, example.height);

  targetRectCounter = 0;
  userRectCounter = -1;
  scoreValuesTracking = [];
  scoredColorsArray = [];
  displayedScores = [];
  spectrumPairData = [];
  topScoreIndex = -1;
  hasFinishedRound = false;
  isAdvancingProbe = false;
  statusOfClick = true;
  countOfClicks = 0;
  hasActiveHoverColor = false;
  hasDismissedIntroHint = false;
  isIntroHintFading = false;
  introHintOpacity = 0.5;

  drawRoundStart();
}

function drawTargetSwatchAt(index, color, offsetX = 0, offsetY = 0) {
  const x = SWATCH_START_X + (SWATCH_SIZE + SWATCH_GAP) * index + offsetX;
  context.fillStyle = color;
  context.fillRect(x, TARGET_ROW_Y + offsetY, SWATCH_SIZE, SWATCH_SIZE);
}

function drawUserSwatchAt(index, colorTriplet, offsetX = 0, offsetY = 0) {
  const x = SWATCH_START_X + (SWATCH_SIZE + SWATCH_GAP) * index + offsetX;
  context.fillStyle = toRgbString(colorTriplet);
  context.fillRect(x, USER_ROW_Y + offsetY, SWATCH_SIZE, SWATCH_SIZE);
}

function clearScoreTextArea(index) {
  const x = SWATCH_START_X + (SWATCH_SIZE + SWATCH_GAP) * index;
  context.clearRect(x - 8, SCORE_TEXT_TOP_Y, SWATCH_SIZE + 16, SCORE_TEXT_BAND_HEIGHT);
}

function drawScoreTextForIndex(index, includeTopLabel = false) {
  const scoreData = displayedScores[index];
  if (!scoreData) {
    return;
  }

  const x = SWATCH_START_X + (SWATCH_SIZE + SWATCH_GAP) * index + SWATCH_SIZE / 2;

  clearScoreTextArea(index);
  context.save();
  context.fillStyle = toRgbString(scoreData.colorTriplet);
  context.textAlign = "center";
  context.textBaseline = "middle";

  if (includeTopLabel) {
    context.font = "700 18px Overpass, sans-serif";
    context.fillText(`${scoreData.score}%`, x, SCORE_TEXT_TOP_Y + 9);
    context.font = "700 11px Overpass, sans-serif";
    context.fillText("TOP ACCURACY", x, SCORE_TEXT_TOP_Y + 24);
  } else {
    context.font = "700 18px Overpass, sans-serif";
    context.fillText(`${scoreData.score}%`, x, SCORE_TEXT_TOP_Y + 16);
  }

  context.restore();
}

function redrawSpectrumPair(pairData, offsetX = 0, offsetY = 0) {
  if (!pairData) {
    return;
  }

  const index = pairData.index;
  const x = SWATCH_START_X + (SWATCH_SIZE + SWATCH_GAP) * index;
  const clearPad = SWATCH_NUDGE_PIXELS + 2;

  context.clearRect(
    x - clearPad,
    TARGET_ROW_Y - clearPad,
    SWATCH_SIZE + clearPad * 2,
    SWATCH_SIZE + clearPad * 2
  );
  context.clearRect(
    x - clearPad,
    USER_ROW_Y - clearPad,
    SWATCH_SIZE + clearPad * 2,
    SWATCH_SIZE + clearPad * 2
  );

  drawTargetSwatchAt(index, pairData.targetColor, offsetX, offsetY);
  drawUserSwatchAt(index, pairData.userColor, offsetX, offsetY);
  drawScoreTextForIndex(index, index === topScoreIndex);
}

function animateSpectrumNudge(pairData) {
  if (!pairData) {
    return;
  }

  if (spectrumNudgeFrameId !== null) {
    cancelAnimationFrame(spectrumNudgeFrameId);
    spectrumNudgeFrameId = null;
    isSpectrumNudging = false;
    redrawSpectrumPair(pairData, 0, 0);
  }

  isSpectrumNudging = true;
  const totalDurationMs = 520;
  const startTime = performance.now();

  function step(now) {
    const t = Math.min((now - startTime) / totalDurationMs, 1);
    const yOffset = -Math.sin(t * Math.PI) * SWATCH_NUDGE_PIXELS;
    redrawSpectrumPair(pairData, 0, yOffset);

    if (t < 1) {
      spectrumNudgeFrameId = requestAnimationFrame(step);
      return;
    }

    spectrumNudgeFrameId = null;
    isSpectrumNudging = false;
    redrawSpectrumPair(pairData, 0, 0);
  }

  spectrumNudgeFrameId = requestAnimationFrame(step);
}

function attachScoreHoverHandlers() {
  const scoreItems = document.querySelectorAll("#listParent li.score-entry");
  if (!scoreItems.length || !spectrumPairData.length) {
    return;
  }

  scoreItems.forEach(function (scoreItem) {
    scoreItem.addEventListener("mouseenter", function () {
      const itemIndex = Number(scoreItem.dataset.scoreIndex);
      animateSpectrumNudge(spectrumPairData[itemIndex]);
    });

    scoreItem.addEventListener("mouseleave", function () {
      const itemIndex = Number(scoreItem.dataset.scoreIndex);
      const pairData = spectrumPairData[itemIndex];

      if (spectrumNudgeFrameId !== null) {
        cancelAnimationFrame(spectrumNudgeFrameId);
        spectrumNudgeFrameId = null;
        isSpectrumNudging = false;
      }

      redrawSpectrumPair(pairData, 0, 0);
    });
  });
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
  cornerBottomRight = pickDistinctCornerColor([
    cornerTopLeft,
    cornerTopRight,
    cornerBottomLeft,
  ]);
  drawGradientFromCorners();
}

function drawRoundStart() {
  updateCanvasSizeForViewport();
  updateLayoutMetrics();
  queueFontScoreRefresh();
  displayedScores = [];
  topScoreIndex = -1;
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
  if (hasFinishedRound) {
    const point = getCanvasPointFromEvent(e);
    if (point && isInsideColorChart(point.x, point.y)) {
      resetAndStartNewRound();
    }
    return;
  }

  if (isAdvancingProbe) {
    return;
  }

  statusOfClick = !statusOfClick;

  if (!statusOfClick) {
    calcAccuracy();
    listResults(colorAccuracy);

    if (scoreValuesTracking.length < 3) {
      fadeInNextTarget(200, 600);
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

    const bestIndex = scoreValuesTracking.indexOf(Math.max(...scoreValuesTracking));
    const targetColors = [targetColor1, targetColor2, targetColor3];

    spectrumPairData = targetColors.map(function (targetColor, index) {
      return {
        index: index,
        targetColor: targetColor,
        userColor: scoredColorsArray[index],
      };
    });

    topScoreIndex = bestIndex;
    drawScoreTextForIndex(bestIndex, true);

    //targetRectCounter++
    scoreValuesTracking = [];
    scoredColorsArray = [];
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

  scoreValuesTracking.push(arg);
  scoredColorsArray.push(currentUserColor);

  displayedScores.push({
    score: arg,
    colorTriplet: [...currentUserColor],
  });

  drawScoreTextForIndex(displayedScores.length - 1, false);
};

let clickableSpace = document.getElementById("example");
clickableSpace.addEventListener("click", toggleStatusOfClick);

function hoverRgb(e) {
  if (hasFinishedRound) {
    return;
  }

  const rect = example.getBoundingClientRect();
  const scaleX = example.width / rect.width;
  const scaleY = example.height / rect.height;
  var x = (e.clientX - rect.left) * scaleX;
  var y = (e.clientY - rect.top) * scaleY;

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
      hasActiveHoverColor = false;
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

    userR = p[0];
    userG = p[1];
    userB = p[2];
    hasActiveHoverColor = true;
  }
  currentUserColor = [userR, userG, userB];
}

//abhören
document.getElementById("example").addEventListener("mousemove", hoverRgb);
document.getElementById("example").addEventListener("touchmove", function (e) {
  e.preventDefault();
  hoverRgb(e.touches[0]);
}, { passive: false });
document.getElementById("example").addEventListener("touchend", function (e) {
  e.preventDefault();
  if (hasFinishedRound) {
    toggleStatusOfClick(e);
    return;
  }
  if (statusOfClick && hasActiveHoverColor) {
    toggleStatusOfClick(e);
    hasActiveHoverColor = false;
  }
}, { passive: false });

let resizeRoundTimer = null;
window.addEventListener("resize", function () {
  if (resizeRoundTimer !== null) {
    clearTimeout(resizeRoundTimer);
  }

  resizeRoundTimer = setTimeout(function () {
    resizeRoundTimer = null;
    resetAndStartNewRound();
  }, 180);
});
