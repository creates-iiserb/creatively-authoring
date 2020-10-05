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

CodeMirror.defineMode("mingo", function(config, parserConfig) {
  var indentUnit = config.indentUnit;

  function prefixRE(words) {
    return new RegExp("^(?:" + words.join("|") + ")");
  }
  function wordRE(words) {
    return new RegExp("^(?:" + words.join("|") + ")$");
  }
  var specials = wordRE(parserConfig.specials || []);

var mingo={
"func":["accu", "accu1", "accu2", "accuracy", "arccos", "arccos1", "arccos2", "arccot","arccot1", "arccot2", "arccsc", "arccsc1", "arccsc2", "arcsec", "arcsec1", "arcsec2", "arcsin", "arcsin1", "arcsin2", "arctan", "arctan1", "arctan2", "big", "bold", "bolditalic", "box", "bra", "braket", "cases","cbrt", "cbrt1", "ceiling", "col", "cos", "cos1", "cos2", "cos3", "cos4", "cosh", "cosh1", "cot", "cot1", "cot2", "cot3", "cot4", "coth", "coth1", "csc", "csc1", "csc2", "csc3", "csc4", "csch", "csch1", "diagonalarrow", "div", "div1", "downstrike", "encircle", "enclose", "engform", "engform1", "engform2", "equal", "exp", "exp1", "expr", "expr1", "expr2", "factorial", "factorial1", "factorial2", "floor", "frac", "frac1", "frac2", "from", "func", "grp", "hat", "hstrike", "im", "impart","infix", "infix1", "infix2", "int", "int0", "int1", "int2", "italic",  "ket", "ketbra", "labeloverline", "labelunderline", "large", "lefta", "leftb", "leftc", "leftds", "leftdv", "leftf", "leftp", "lefts", "leftv", "list", "lit1", "literal", "ln", "ln1", "log", "log1", "log10", "log2", "longdiv", "magnitude", "magnitude1", "max", "min","none", "od", "od1", "od2", "oint", "oint0", "oint1", "oint2", "ointa", "ointa0", "ointa1", "ointa2", "ointc", "ointc0", "ointc1", "ointc2", "over", "overbrace", "overline", "overparanthesis", "oversqrbracket", "paira", "pairb", "pairc", "pairds", "pairdv", "pairf", "pairp", "pairs", "pairv", "pd", "pd1", "pd2", "pd3", "pd4", "pd5", "pd6", "phasorangle", "pow", "prec", "prec1", "prec2", "presub", "presup", "presupsub", "print", "print1", "prod", "quoted", "quotes", "r", "repart", "righta", "rightb", "rightc", "rightds", "rightdv", "rightf", "rightp", "rights", "rightv", "root", "root1", "roundedbox", "row","sciform", "sciform1", "sciform2", "sec", "sec1", "sec2", "sec3", "sec4", "sech", "sech1", "sequence", "sequence1", "sequence2", "series", "series1", "series2", "sin", "sin1", "sin2", "sin3", "sin4", "sinh", "sinh1", "small", "sqrt", "sqrt1", "sub", "sum", "sum$", "sup", "supsub", "sym", "table", "table1", "table2", "table3", "table4", "table5", "tableany", "tablecustom", "tablel", "tablel1", "tablel2", "tablel3", "tablel4", "tablel5", "tablelcustom", "tabler", "tabler1", "tabler2", "tabler3", "tabler4", "tabler5", "tablercustom", "tan", "tan1", "tan2", "tan3", "tan4", "tanh", "tanh1", "tiny", "tld", "tuple", "tuple1", "tuple2", "type", "under", "underbrace", "underline", "underover", "underparanthesis", "undersqrbracket", "unit", "upstrike", "vec", "vec1", "vec2", "veccyl", "veccyl1", "veccyl2", "veccyl3", "vecij", "vecij1", "vecij2", "vecijk", "vecijk1", "vecijk2", "vecpol", "vecpol1", "vecpol2", "vecpol3", "vecsph", "vecsph1", "vecxy", "vecxy1", "vecxy2", "vecxyz", "vecxyz1", "vecxyz2", "vstrike"],
"symbols":["$plus", "$min", "$hat", "$slash", "$ast", "$cdot", "$times", "$cross", "$div", "$sqrt", "$pm", "$mp", "$oplus", "$ominus", "$otimes", "$odot", "$vee", "$wedge", "$cup", "$cap", "$sum", "$prod", "$prop", "$or", "$and", "$not", "$xor", "$nor", "$nand", "$xnor", "$eq", "$neq", "$equiv", "$nequiv", "$less", "$great", "$nless", "$ngreat", "$lless", "$ggreat", "$sim", "$leq", "$leq1", "$leq2", "$nleq", "$nleq1", "$nleq2", "$geq", "$geq1", "$geq2", "$ngeq", "$ngeq1", "$ngeq2", "$cupcap", "$union", "$inter", "$sqrunion", "$sqrinter", "$unionplus", "$elem", "$revelem", "$nelem", "$notrevelem", "$suchthat", "$exist", "$notexist", "$forall", "$because", "$therefore", "$nullset", "$coprod", "$arrowr", "$arrowl", "$arrowu", "$arrowd", "$arrowlr", "$arrowud", "$arrownw", "$arrowne", "$arrowse", "$arrowsw", "$longarrowl", "$longarrowr", "$longarrowlr", "$shortarrowl", "$shortarrowr", "$shortarrowu", "$shortarrowd", "$goup", "$godown", "$goleft", "$goright", "$goback", "$goback1", "$return", "$ifthen", "$ifthen1", "$iff", "$iff1", "$onlyif", "$onlyif1", "$darrowu", "$darrowd", "$darrowud", "$equilrl", "$equillr", "$equilud", "$equildu", "$arrowslr", "$arrowsrl", "$arrowsud", "$arrowsdu", "$int", "$oint", "$ointc", "$ointa", "$ointd", "$partial", "$del", "$deg", "$dagg", "$ddagg", "$prime", "$dprime", "$revprime", "$revdprime", "$cir", "$scir", "$sqr", "$fillcir", "$fillsqr", "$diamond", "$copyright", "$trademark", "$int", "$oint", "$ointc", "$ointa", "$ointd", "$partial", "$del", "$pi", "$infty", "$im", "$unity", "$exp", "$spades", "$hearts", "$diamonds", "$clubs", "$bking", "$bqueen", "$bbishop", "$bknight", "$brook", "$bpawn", "$wking", "$wqueen", "$wrook", "$wbishop", "$wknight", "$wpawn", "$ellip", "$cellip", "$vellip", "$fellip", "$bellip", "$a", "$b", "$c", "$d", "$e", "$f", "$g", "$h", "$eta", "$i", "$k", "$l", "$m", "$n", "$o", "$p", "$th", "$r", "$s", "$t", "$u", "$w", "$x", "$ps", "$z", "$st", "$ko", "$fs", "$sa", "$dig", "$A", "$B", "$C", "$D", "$E", "$F", "$G", "$H", "$I", "$K", "$L", "$M", "$N", "$O", "$P", "$tH", "$R", "$S", "$T", "$U", "$W", "$X", "$pS", "$Z", "$sT", "$kO", "$sA", "$diG", "$curlyphi", "$curlyrho", "$curlykappa", "$curlyeps", "$curlytheta", "$curlypi", "$curlyUpsilon", "$doubledgamma", "$scra", "$scrb", "$scrc", "$scrd", "$scre", "$scrf", "$scrg", "$scrh", "$scri", "$scrj", "$scrk", "$scrl", "$scrm", "$scrn", "$scro", "$scrp", "$scrq", "$scrr", "$scrs", "$scrt", "$scru", "$scrv", "$scrw", "$scrx", "$scry", "$scrz", "$scrA", "$scrB", "$scrC", "$scrD", "$scrE", "$scrF", "$scrG", "$scrH", "$scrI", "$scrJ", "$scrK", "$scrL", "$scrM", "$scrN", "$scrO", "$scrP", "$scrQ", "$scrR", "$scrS", "$scrT", "$scrU", "$scrV", "$scrW", "$scrX", "$scrY", "$scrZ", "$scr0", "$scr1", "$scr2", "$scr3", "$scr4", "$scr5", "$scr6", "$scr7", "$scr8", "$scr9", "$gotha", "$gothb", "$gothc", "$gothd", "$gothe", "$gothf", "$gothg", "$gothh", "$gothi", "$gothj", "$gothk", "$gothl", "$gothm", "$gothn", "$gotho", "$gothp", "$gothq", "$gothr", "$goths", "$gotht", "$gothu", "$gothv", "$gothw", "$gothx", "$gothy", "$gothz", "$gothA", "$gothB", "$gothC", "$gothD", "$gothE", "$gothF", "$gothG", "$gothH", "$gothI", "$gothJ", "$gothK", "$gothL", "$gothM", "$gothN", "$gothO", "$gothP", "$gothQ", "$gothR", "$gothS", "$gothT", "$gothU", "$gothV", "$gothW", "$gothX", "$gothY", "$gothZ", "$goth0", "$goth1", "$goth2", "$goth3", "$goth4", "$goth5", "$goth6", "$goth7", "$goth8", "$goth9", "$dstra", "$dstrb", "$dstrc", "$dstrd", "$dstre", "$dstrf", "$dstrg", "$dstrh", "$dstri", "$dstrj", "$dstrk", "$dstrl", "$dstrm", "$dstrn", "$dstro", "$dstrp", "$dstrq", "$dstrr", "$dstrs", "$dstrt", "$dstru", "$dstrv", "$dstrw", "$dstrx", "$dstry", "$dstrz", "$dstrA", "$dstrB", "$dstrC", "$dstrD", "$dstrE", "$dstrF", "$dstrG", "$dstrH", "$dstrI", "$dstrJ", "$dstrK", "$dstrL", "$dstrM", "$dstrN", "$dstrO", "$dstrP", "$dstrQ", "$dstrR", "$dstrS", "$dstrT", "$dstrU", "$dstrV", "$dstrW", "$dstrX", "$dstrY", "$dstrZ", "$dstr0", "$dstr1", "$dstr2", "$dstr3", "$dstr4", "$dstr5", "$dstr6", "$dstr7", "$dstr8", "$dstr9", "$usd", "$euro", "$cent", "$gbp", "$inr", "$yen", "$tilde", "$exclaim", "$at", "$hash", "$percent", "$amp", "$under", "$vert", "$bslash", "$squote", "$dquote", "$bquote", "$qmark", "$comma", "$dot", "$colon", "$semicolon", "$null", "$enspc", "$quad", "$quad2", "$quadthird", "$quadfourth", "$thin", "$hair", "$newline", "$lparanth", "$rparanth", "$lsqr", "$rsqr", "$lbrace", "$rbrace", "$langle", "$rangle", "$lvert", "$rvert", "$ldvert", "$rdvert"]
}

var fun=Object.keys(mingo.func).map(function(k) { return mingo.func[k] });

fun=new RegExp("^(?:" + fun.join("|") + ")$");


var sym=Object.keys(mingo.symbols).map(function(k) { return mingo.symbols[k] });
sym=new RegExp("^(?:"+String.fromCharCode(92)+sym.join("|"+String.fromCharCode(92))+")$");



  function normal(stream, state) {
    var ch = stream.next();
    var current=stream.current();
     

    if (ch == "\"" || ch == "'")
      return (state.cur = string(ch))(stream, state);

   if (/\d/.test(ch)) {
      stream.eatWhile(/[\w.%]/);
      return "num";
    }

     

    if (/[\\\w_\$]/.test(ch)) {
      stream.eatWhile(/[\w\\\\\-_.$]/);
      return "variable";
    }
    return null;
  }

  function comment(quote) {
    return function(stream, state) {
      var escaped = false, ch;
      while ((ch = stream.next()) != null) {
        if (ch == quote){
          if (ch == quote && !escaped) break;
          escaped = !escaped && ch == "\\";  
        }
         
        escaped = !escaped && ch == "\\";
      }
      if (!escaped) state.cur = normal;
      return "new_string";
    };
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
      return "string";
    };
  }
  
  return {
    startState: function(basecol) {
      return {basecol: basecol || 0, indentDepth: 0, cur: normal};
    },

    token: function(stream, state) {
    var doller=/^(\$[0-9]{5})$/;
    var hex=/^(\$\$[0-9a-f]{4})$/;
    var comment=/^(\/\/).*(\/\/)$/;
       if (stream.eatSpace()) return null;
      var style = state.cur(stream, state);
      
      var word = stream.current();
      // if(style="comment"){
      //   console.log("hello");
      //   if(comment.test(word)) {
      //     console.log("hello1")
      //     style = "comment";}
      //   else style=null;

      //   return style;
      // }

      if (style == "variable") {
        if (fun.test(word)) style = "mingo_func";
        else if (doller.test(word)) style="mingo_doller";
	      else if (sym.test(word)) style="mingo_sym";
	      else if (hex.test(word)) style="mingo_hex";
        else if (comment.test(word)) style="comment";
      }
     
      return style;
    },
  
  };
});

CodeMirror.defineMIME("text/x-mingo", "mingo");

});
