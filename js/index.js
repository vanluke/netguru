'use strict';

var assign = window.Object.assign;

var wordApi = 'http://api.wordnik.com:80/v4/words.json/randomWord?hasDictionaryDef=false&minCorpusCount=0&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=11&maxLength=11&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5';

var loseGif = 'http://i.giphy.com/10M2qmLfMSeOgE.gif';

var winGif = 'http://i.giphy.com/iPTTjEt19igne.gif';

var popup = $('#popup');

var overlay = $('#overlay');

var resetGameBtn = $('#reset-game');

var hangmanIds = ['#head', '#neck', '#corpus', '#right-arm', '#left-arm', '#right-hand', '#left-hand', '#right-leg', '#left-leg', '#right-foot', '#left-foot'];

var gameSkeleton = {
  counter: 0,
  fails: 0,
  word: '',
  characters: [],
  limit: 11
};

var game = assign({}, gameSkeleton);

var timeoutToShowLastFoot = 100;

var cleanGameObject = function cleanGameObject() {
  assign(game, gameSkeleton);
};

var cleanWrongLetters = function cleanWrongLetters() {
  for (var i = 0; i < game.limit; i++) {
    $('.letters').find('.letter').find('#letter-' + i).text('');
  }
};

var cleanHangman = function cleanHangman() {
  for (var _iterator = hangmanIds, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
    var _ref;

    if (_isArray) {
      if (_i >= _iterator.length) break;
      _ref = _iterator[_i++];
    } else {
      _i = _iterator.next();
      if (_i.done) break;
      _ref = _i.value;
    }

    var bodyElement = _ref;

    $(bodyElement).css('visibility', 'hidden');
  }
};

var cleanWinningBoxes = function cleanWinningBoxes() {
  for (var index = 0; index < game.limit; index++) {
    var resolveLetter = $('.resolve-items').find('.letters').find('#letter-' + index);

    resolveLetter.text('');
    $(resolveLetter).parent('div').removeClass('active');
  }
};
var getWord = function getWord() {
  $.get(wordApi).done(function (response) {
    handleNewWord(response.word);
  }).fail(function (error) {});
};

var togglePopup = function togglePopup(show) {
  if (show === true) {
    popup.show();
    return;
  }
  popup.hide();
};

var setBackground = function setBackground(win) {
  overlay.find('#bg-image').css('background-image', 'url(' + (!win ? loseGif : winGif) + ')');
};

var handleWin = function handleWin() {
  setBackground(true);
  overlay.show();
  $(popup).find('#message').text('You win!');
};

var handleLose = function handleLose() {
  setBackground(false);
  overlay.show();
  $(popup).find('#message').text('You Lose!');
};

var putWrongLetter = function putWrongLetter(letter) {
  var index = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

  $('.letters').find('.letter').find('#letter-' + index).text(letter);
};

var handleWrongLetter = function handleWrongLetter(letter) {
  putWrongLetter(letter, game.fails);
  $(hangmanIds[game.fails]).css('visibility', 'visible');
  game.fails++;
};

var findLetterPossition = function findLetterPossition(letter) {
  return game.characters.find(function (e) {
    return e.selected === false && e.letter.toLowerCase() === letter.toLowerCase();
  });
};

var markNewLetter = function markNewLetter(letter) {
  var possition = findLetterPossition(letter);
  if (possition) {
    game.counter++;
    possition.selected = true;
    assign(game.characters, possition);
    return possition.id;
  }
  return -1;
};

var mapGameWord = function mapGameWord(word) {
  return word.split('').map(function (e, i) {
    return {
      id: i,
      letter: e,
      selected: false
    };
  });
};

var handleNewWord = function handleNewWord(wordnik) {
  if (game.word === wordnik) {
    getWord();
    return;
  }
  game.word = wordnik;
  game.characters = mapGameWord(game.word);
};

var putWordInPopup = function putWordInPopup(clean) {
  $(popup).find('#word').text(clean ? '' : game.word);
};

var play = function play(letter) {
  var index = markNewLetter(letter);
  if (index >= 0) {
    var resolveLetter = $('.resolve-items').find('.letters').find('#letter-' + index);
    resolveLetter.text(letter);
    $(resolveLetter).parent('div').addClass('active');
  } else {
    handleWrongLetter(letter);
  }
};

var observeGame = function observeGame(value) {
  var gameLocal = value[0];
  if (!gameLocal || !gameLocal.object) {
    return;
  }
  if (gameLocal.name === 'counter') {
    if (gameLocal.object.counter >= game.limit) {
      setTimeout(function () {
        togglePopup(true);
        putWordInPopup();
        handleWin();
      }, timeoutToShowLastFoot);
    }
  }
  if (gameLocal.name === 'fails') {
    if (gameLocal.object.fails >= game.limit) {
      setTimeout(function () {
        togglePopup(true);
        putWordInPopup();
        handleLose();
      }, timeoutToShowLastFoot);
    }
  }
};

Object.observe(game, function (counterChanged, v, z) {
  observeGame(counterChanged);
});

resetGameBtn.click(function (event) {
  event.preventDefault();
  overlay.hide();
  resetGame();
});

window.addEventListener('keypress', function (event) {
  event = event || window.event;
  event.preventDefault();
  var keyCode = event.keyCode || event.which;
  if (!keyCode) {
    return;
  }
  play(String.fromCharCode(keyCode));
}, false);

var resetGame = function resetGame() {
  putWordInPopup(true);
  togglePopup(false);
  cleanWrongLetters();
  cleanHangman();
  cleanGameObject();
  cleanWinningBoxes();
  getWord();
};

resetGame();