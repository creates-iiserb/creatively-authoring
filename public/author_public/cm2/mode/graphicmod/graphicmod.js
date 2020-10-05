// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

// LUA mode. Ported to CodeMirror 2 from Franciszek Wawrzak's
// CodeMirror 1 mode.
// highlights keywords, strings, comments (no leveling supported! ("[==[")), tokens, basic indenting

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

CodeMirror.defineMode("graphicmod", function(config, parserConfig) {
  var indentUnit = config.indentUnit;

  function normal(stream, state) {
    var ch = stream.next();
    
    if (ch == "\"" || ch == "'")
      return (state.cur = string(ch))(stream, state);

    if (/\d/.test(ch)) {
      stream.eatWhile(/[\w.%]/);
      return "num";
    }
    
    return null;
  }

  

  function string(quote) {
    return function(stream, state) {
      var escaped = false, ch;
      while ((ch = stream.next()) != null) {
        if (ch == quote && !escaped) break;{
        escaped = !escaped && ch == "\\";
      }
      }
      if (!escaped) state.cur = normal;
      return "new_string";
    };
  }
  
  return {
    startState: function(basecol) {
      return {basecol: basecol || 0, indentDepth: 0, cur: normal};
  },

  token: function(stream, state) {

    if (stream.eatSpace()) return null;
    var style = state.cur(stream, state);
    
    return style;
  },

};
});

CodeMirror.defineMIME("text/x-graphicmod", "graphicmod");

});
