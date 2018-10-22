var startScreen;
var instructionsScreen;
var contentScreen;
var levelsScreen;
var creditsScreen;
var playButton;
var creditsButton;
var resultGameModal;
var clueModal;

var clue;
var currentClue;
var svg;
var arrayDots = [];
var arrayDotsPushed = [];
const GAME_LEVELS = 10;

var app = {
  // Application Constructor
  initialize: function() {
    document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    init();
  },

  // deviceready Event Handler
  //
  // Bind any cordova events here. Common events are:
  // 'pause', 'resume', etc.
  onDeviceReady: function() {
    this.receivedEvent('deviceready');
  },

  // Update DOM on a Received Event
  receivedEvent: function(id) {

  }
};

app.initialize();
window.scrollTo(0, 0);

function init() {
  initVariables();
  loadGame();
  openStartScreen();
}

function initVariables() {
  startScreen = document.getElementById('startScreen');
  instructionsScreen = document.getElementById('instructionsScreen');
  contentScreen = document.getElementById('contentScreen');
  levelsScreen = document.getElementById('levelsScreen');
  creditsScreen = document.getElementById('creditsScreen');
  playButton = document.getElementById('playButton');
  creditsButton = document.getElementById('creditsButton');
  resultGameModal = document.getElementById('resultGameModal');
  clueModal = document.getElementById('clueModal');
  svg = document.getElementById('svg');
  clue = false;

  if(!localStorage.getItem("level")){
    localStorage.setItem("level", 1);
  }
  if(!localStorage.getItem("maxLevel")){
    localStorage.setItem("maxLevel", 1);
  }
}

function loadGame() {
  titleContainer.className = "animated slideInDown";
  loadingBarContainer.className = "animated fadeIn";
  var solidBar = document.getElementById("loadingBarSolid");
  var solidBarWidth = 1;
  var barAnimation = setInterval(renderFrame, 2);

  function renderFrame() {
    if (solidBarWidth > 249) {
      clearInterval(barAnimation);
      setTimeout(showStartButtons, 50);
    } else {
      solidBarWidth++;
      solidBar.style.width = solidBarWidth + 'px';
    }
  }
}

function showStartButtons() {
  playButton.className = "show animated bounceInUp";
  creditsButton.className = "show animated bounceInUp";
}

function backContentScreen() {
  openContentScreen();
}

function openContentScreen() {
  var currentLevel = Number(localStorage.getItem("level"));
  hideScreens();
  setLevelClue(currentLevel);
  contentScreen.style.display = 'block';
  level();
  numberLevelImage(currentLevel);
  contentLevel.className = "animated rotateIn faster";
}

function openCreditsScreen() {
  hideScreens();
  creditsScreen.style.display = 'block';
  creditsTitleContainer.className = "animated slideInDown";
  creditsTextContainer.className = "animated slideInUp";
}

function openLevelsScreen() {
  hideScreens();
  resultGameModal.style.display = 'none';
  levelsScreen.style.display= 'block';
  showAvailableLevels();
}

function openInstructionsScreen() {
  hideScreens();
  instructionsScreen.style.display= 'block';
  guideDotsContainer.className = "animated slideInDown";
  instructionText.className = "animated slideInUp";
  setTimeout(function(){
    setTimeout(function() {
      openLevelsScreen();
    }, 500);
    guideDotsContainer.className = "animated slideOutUp";
    instructionText.className = "animated slideOutDown";
  }, 5000);
}

function openStartScreen() {
  hideScreens();
  startScreen.style.display= 'block';
}

function hideScreens() {
  startScreen.style.display= 'none';
  instructionsScreen.style.display= 'none';
  contentScreen.style.display= 'none';
  levelsScreen.style.display= 'none';
  creditsScreen.style.display= 'none';
}

function closeClueModal() {
  clueModal.style.display = 'none';
}

function showClueModal() {
  var element;

  for (var i = 0; i < currentClue.length; i++) {
    for (var j = 0; j < currentClue[0].length; j++) {
      element = document.getElementById(i+'_'+j);
      if (element.src.includes('dot_off_2') && currentClue[i][j] ) {
        showClueDots(i+'_'+j);
      }
    }
  }
}

function activeClue(event) {
  clue = !clue;
  event.target.src = (clue) ? "img/clue_button_active.png" : "img/clue_button.png";
  level();
}

function showClueDots(dotId) {
  var canvas = document.getElementById(dotId);
  canvas.style.opacity = 1;
  canvas.src = "img/dot_2.png";
  setTimeout(function(){
    canvas.style.opacity = 0.2;
    canvas.src = "img/dot_off_2.png";
  }, 1000);
}

function level() {
  var canvas = document.getElementById('contentDots');
  var html = "";
  assignLevel();
  resetSVG();
  initArrayDots();

  for (var i = 0; i < currentClue.length; i++) {
    html += '<div class="row">';
    for(var j = 0; j < currentClue[0].length; j++) {
      html += (currentClue[i][j]) ? '<img src=./img/dot_6.png id=' + i + '_' + j + ' onclick="changeButtonState(event);">' : '<img src=./img/dot_off_1.png id=' + i + '_' + j + ' ">';
    }
    html += '</div>'
  }
  canvas.innerHTML = html;

  setTimeout(function(){
    adjustSVG(canvas);
  }, 100);

  openNextDot();
}

function initArrayDots() {
  arrayDots= [], arrayDotsPushed = [];
  var value;
  for (var i = 0; i < currentClue.length; i++) {
    for (var j = 0; j < currentClue[0].length; j++) {
      value = currentClue[i][j];
      if (value.length) {
        for (var h = 0; h < value.length; h++) {
          arrayDots[value[h] - 1] = i + "_" + j;
        }
      }
      else if (value) {
        arrayDots[value - 1] = i + "_" + j;
      }
    }
  }
}

function changeButtonState(event) {
  var pos = event.target.id.split('_');
  var dot = {
    id: event.target.id,
    position: getPositionDot(pos)
  };

  if (arrayDotsPushed.length > 0 && dot.id == arrayDotsPushed[arrayDotsPushed.length - 1].id && event.target.alt === 'Dot press') {
    event.target.src = "img/dot_6.png";
    event.target.style.opacity = 0.5;
    event.target.alt = "Dot";
    hideNextDot();
    arrayDotsPushed.pop();
    dropLine();
  }

  else if (event.target.alt === 'Dot') {
    event.target.src = "img/dot_2.png";
    event.target.style.opacity = 1;
    event.target.alt = "Dot press";
    arrayDotsPushed.push(dot);
    openNextDot();
    drawLine();
  }

  if (arrayDots.length === arrayDotsPushed.length) {
    setTimeout(function() {
      if (validateLevel()) {
        showResultModal(true);
      }
      else {
        showResultModal(false);
      }
    }, 200);
  }
}

function validateLevel() {
  var flag = true;
  for (var i = 0; i < arrayDots.length; i++) {
    if (arrayDots[i] != arrayDotsPushed[i].id) {
      if (clue) {
        return false;
      }
      flag = false;
      break;
    }
  }
  if (!clue && !flag) {
    for (var i = 0; i < arrayDots.length; i++) {
      if (arrayDotsPushed[i].id != arrayDots[arrayDots.length - 1 - i]) {
        return false;
      }
    }
  }
  return true;
}

function openNextDot() {
  if (clue | arrayDotsPushed.length == 0 | arrayDotsPushed.length == arrayDots.length - 1) {
    var dot = document.getElementById(arrayDots[arrayDotsPushed.length]);
    if (dot) {
      dot.style.opacity = 0.5;
      dot.alt = "Dot"
      dot.className = "animated zoomIn faster";
    }
  }
  else if (arrayDotsPushed.length == 1) {
    var initial_dot = arrayDots[0];
    for (var i = 1; i < arrayDots.length - 1; i++) {
      var dot = document.getElementById(arrayDots[i]);
      dot.style.opacity = 0.5;
      dot.alt = "Dot"
      dot.className = "animated zoomIn faster";

    }
  }
}

function hideNextDot() {
  if (clue) {
    var dot = document.getElementById(arrayDots[arrayDotsPushed.length]);
    dot.className = "animated zoomOut";
    setTimeout(function(){
      dot.style.opacity = 0;
      dot.alt = "";
    }, 250);
  }
}

function assignLevel(){
  currentClue = clues[Number(localStorage.getItem("level")) - 1];
}

function increaseLevel() {
  var lvlTmp = Number(localStorage.getItem("level"));
  if (lvlTmp == Number(localStorage.getItem("maxLevel"))) {
    localStorage.setItem("maxLevel", ++lvlTmp);
  }
}

function showAvailableLevels() {
  var html = "";
  var canvas = document.getElementById("levelsListContainer");
  var lvlTmp = Number(localStorage.getItem("maxLevel"));

  for(var i=1; i<=20; i++) {
    html += '<div class="buttonLevel">';
    html += (i <= lvlTmp) ? '<img src="img/button_level' + i + '.png" alt="Level ' + i + '" id =' + i + ' class="animated slideInUp"  onclick="openLevel(event);">' : '<img src="img/button_level_locked.png" class="animated slideInUp" alt="Level locked">';
    html += '</div>';
  }
  canvas.innerHTML = html;
}

function openLevel(event) {
  localStorage.setItem("level", event.target.id);
  openContentScreen(Number(event.target.id));
}

function numberLevelImage(level) {
  var canvas = document.getElementById("contentLevelContainer");
  var image = "";
  image = '<img src="img/levels/guide_'+level+'.png" alt="Level image" id="contentLevel"/>';
  canvas.innerHTML = image;
}

function setResultTitle(resultText, result) {
  var canvas = document.getElementById("modalText");
  var html = '<img src="img/' + resultText + '.png" alt="You won title"/>';
  canvas.innerHTML = html;
}

function setResultButtons(result, endOfGame) {
  var canvas = document.getElementById("modalButtons");
  var html = "";
  if (result) {
    if (endOfGame) {
      html += '<div id="goHomeButton"><img src="img/home_button.png" alt="Home button" onclick="openLevelsScreen();"/></div>' +       '<div id="retryButton"><img src="img/retry_button.png" alt="Retry button" onclick="retryLevel();"/></div>'
    }
    else {
      html += '<div id="goHomeButton"><img src="img/home_button.png" alt="Home button" onclick="openLevelsScreen();"/></div>' +       '<div id="retryButton"><img src="img/retry_button.png" alt="Retry button" onclick="retryLevel();"/></div>' + '<div id="nextLevelButton"><img src="img/next_level_button.png" alt="Next level button" onclick="nextLevel();"/></div>'
    }
  }
  else {
    html += '<div id="goHomeButton"><img src="img/home_button.png" alt="Home button" onclick="openLevelsScreen();"/></div>' + '<div id="retryButton"><img src="img/retry_button.png" alt="Retry button" onclick="retryLevel();"/></div>'
  }
  canvas.innerHTML = html;
}

function setLevelFigure(flag) {
  var canvas = document.getElementById("modalFigure");
    canvas.innerHTML = (flag) ? '<img src="img/levels/' + localStorage.getItem("level") + '.png" alt="Level figure"/>' : "";
}

function setLevelClue() {
  var canvas = document.getElementById("clueModalContent");
  canvas.innerHTML = '<img src="img/levels/' + localStorage.getItem("level") + '_dots.png" alt="Level clue"/>';;
}

function showResultModal (win) {
  hideDots();
  if(win) {
    setLevelFigure(true);
    setResultTitle("you_won_title");
    if ((Number(localStorage.getItem("level")) + 1 < GAME_LEVELS) && !clue) {
      increaseLevel();
      setResultButtons(true, false);
    }
    else {
      setResultButtons(true, true);
    }
  }
  else {
    setLevelFigure(false);
    setResultTitle("you_lost_title");
    setResultButtons(false);
  }
  resultGameModal.style.display = 'flex';
  modalFigure.className = (win) ? "animated slideInDown" : "";
  modalText.className = (win) ? "animated fadeIn" : "animated slideInDown";
  modalButtons.className = "animated slideInUp";
}

function retryLevel() {
  resultGameModal.style.display = 'none';
  openContentScreen();
}

function nextLevel() {
  var level = Number(localStorage.getItem("level"));
  var maxLevel = Number(localStorage.getItem("maxLevel"));
  if (level == maxLevel) {
    localStorage.setItem("maxLevel", ++maxLevel);
  }
  localStorage.setItem("level", ++level);
  resultGameModal.style.display = 'none';
  openContentScreen();
}

function adjustSVG(contentDots) {
  var position = contentDots.getBoundingClientRect();
  var top = position.top;
  svg.style.height = position.height;
  svg.style.top = top;
}

function drawLine() {
  var arrayLength = arrayDotsPushed.length;
  if (arrayLength > 1) {
    var dot = arrayDotsPushed[arrayLength - 1];
    var lastDot = arrayDotsPushed[arrayLength - 2];
    svg.innerHTML += "<line x1=" + lastDot.position.x + " y1=" + lastDot.position.y + " x2=" + dot.position.x + " y2=" + dot.position.y + "></line>\n";
  }
}

function dropLine() {
  var string = "", line = "";
  var html = svg.innerHTML.split("\n");
  html.splice(html.length - 2, 2);
  for (var i = 0; i < html.length; i++) {
    string += html[i] + "\n";
  }
  svg.innerHTML = string;
}

function hideDots() {
  contentDots.innerHTML = "";
}

function resetSVG() {
  svg.innerHTML = "";
  arrayDotsPushed = [];
}

function getPositionDot(idDot) {
  var fixed = 15;
  var top = svg.style.top;
  var dot = document.getElementById(idDot[0] + '_' + idDot[1]);
  var pos = dot.getBoundingClientRect();
  var position = {
    x : pos.x + fixed,
    y : pos.y + fixed - top.replace("px","")
  };
  return position;
}
