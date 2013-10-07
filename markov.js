(function() {

  var SENTENCE_START = "##SENTENCE_START##",
      SENTENCE_END   = "##SENTENCE_END##";

  var Markov = function(options) {

    this.options = {
      inputText: options.inputText,      // The input corpus
      order: options.order || 2,         
      numWords: options.numWords || 100, // # words to generate
      endWithPeriod: true                // end with period even if not end of sentence
    }
    this._setup();

    return this;
  };

  Markov.prototype = {
    // Instantiate the Markov dictionary object and add a corpus
    _setup: function() {
      this.dictionary = {};
      this.dictionary[SENTENCE_START] = [];
      this.dictionary[SENTENCE_END]   = [SENTENCE_START];

      if (this.options.inputText) {
        this.addCorpus(this.options.inputText);
      }
    },

    // Get a random succeeding word from the dictionary
    _randomFollower: function(word) {
      var followingWords = this.dictionary[word];
      console.log('## ' + word, followingWords);
      console.log('>> ' + Math.floor(Math.random(followingWords.length)));
      return followingWords[Math.floor(Math.random()*followingWords.length)];
    },

    // Clip the period from a word ending a sentence
    _removePeriod: function(word) {
      return word.replace(/\./g, '');
    },

    // Returns true if a word ends a sentence
    _isTerminating: function(word) {
      return (word.charAt(word.length-1) === '.');
    },

    // Generates a number of words specified by the user
    generate: function(numWords) {
      var generatedText = "",
          currentWord = SENTENCE_START,
          followingWord, i = 0;

      while (i < numWords) {
        followingWord = this._randomFollower(currentWord);

        if (followingWord === SENTENCE_START) {
        } else if (followingWord === SENTENCE_END) {
          generatedText += '.';
        } else if (currentWord === SENTENCE_START) {
          generatedText += ' ' + followingWord.charAt(0).toUpperCase() + followingWord.slice(1);
        } else {
          generatedText += ' ' + followingWord;
        }

        i++;
        currentWord = followingWord;
      }

      if (this.options.endWithPeriod === true) {
        if (generatedText.charAt(generatedText.length-1) !== '.') {
          generatedText += '.';
        }
      }

      return generatedText;
    },

    // Parses text and adds it to the Markov dictionary
    addCorpus: function(text) {
      text = text
        .replace(/[-,—?!]/g, "")  // remove punctuation for now
        .replace(/\s{2,}/g, ' '); // fix double spacing caused by above

      var tokens = text.split(' '); // Tokenize
      var currentToken, followingToken, terminating;

      for (var i = 0; i < tokens.length; i++) {
        currentToken = tokens[i]
          .toLowerCase()
          .replace(/^\s+|\s+$/g,""); // trim spaces

        if (i !== (tokens.length-1)) {
          followingToken = tokens[i+1].toLowerCase();
        }

        // If word ends a sentence, don't include periods in the lookup
        terminating = false;
        if (this._isTerminating(currentToken)) {
          currentToken = this._removePeriod(currentToken);
          terminating = true;
        }

        // First time the word is encountered
        if (!this.dictionary[currentToken]) {
          this.dictionary[currentToken] = [];
        }

        // Word ends a sentence
        if (terminating === true) {
          this.dictionary[currentToken].push(SENTENCE_END);
        } else {
          this.dictionary[currentToken].push(this._removePeriod(followingToken));
        }

        // Word starts a sentence
        if (i === 0 || this._isTerminating(tokens[i-1])) {
          this.dictionary[SENTENCE_START].push(currentToken);
        }
      }
    } // addCorpus
  };

  window.Markov = Markov;

}).call(this);