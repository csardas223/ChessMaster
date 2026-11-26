/* Fairy-Stockfish opt-in table, read by js/bot/fairy.js (CM.fairy.planFor) and js/bot/bot.js (CM.bot.engineFor).
   A mode listed here plays Fairy-Stockfish (GPLv3, js/vendor/fairy-stockfish/) instead of CM.Search when its rules are
   exactly a Fairy-Stockfish built-in variant. Mode files stay untouched; a mode not listed here keeps its current bot.
   Keys:
     variant    Fairy-Stockfish UCI_Variant
     pieces     our piece type -> Fairy-Stockfish FEN letter (types not listed must be one of P N B R Q K)
     chess960   true: UCI_Chess960 on, castling rights as Shredder-FEN file letters (king-onto-rook castling, js/modes/g4_960.js)
     castling   false: never send castling rights (the mode castles differently from the variant, so a castling bestmove
                would not match a legal move here; everything else still matches)
   Anything Fairy-Stockfish answers that is not a legal move in our rules falls back to CM.Search for that move, and if
   the engine cannot load at all every mode here keeps CM.Search. */
window.CM_DATA = window.CM_DATA || {};
(function () {
  var XQ = { XR: 'R', XH: 'N', XE: 'B', XA: 'A', XK: 'K', XC: 'C', XS: 'P', XT: 'P' };   /* XT: soldier across the river */
  var CHAT = { H: 'B', F: 'Q' };   /* chess.com Chaturanga: Elephant = alfil, Counselor = ferz (Fairy-Stockfish letters) */
  var T = {};
  function add(ids, e) { ids.forEach(function (id) { T[id] = e; }); }
  add(['hk85bBLSi7Q', 'DGlqJG6kzn8', 'TTimDDC4Cwc', 'LjehdkzmCho'], { variant: 'seirawan' });               /* S-chess: Hawk H, Elephant E */
  add(['X-aULHXsAaI', 'ZP5cnusxKgA', 'bLwXpCK_h4k'], { variant: 'racingkings' });
  add(['fUQXSj5jVUk'], { variant: 'xiangqi', pieces: XQ });
  add(['XrS4pFAd56c', 'SaLxG36hldw', '5K72RRDBN5U'], { variant: 'crazyhouse' });
  add(['PhcIDwTqQKA', 'uQ0kzL0-taQ', 'b0peFhZs4yU', 'wTudFnunSL0'], { variant: 'atomic' });
  add(['9npKP-fqq9U', '3_eutZExN2c', 'rBh7IIhTbw4', 'xAFkE7-Jp88'], { variant: 'antichess' });              /* chess.com Giveaway: no castling, K promotion */
  add(['smg98qv_xa0', 'hVOA_oScEBQ', '88CgS9anXJs', '9bvch-UHQhg'], { variant: 'horde' });
  add(['Zdkiyvn1iLA', 'uUXev8TPVak', '92d9wLU4g8U', 'Fbk0Xbcz728', 'qTXES0F1MVQ', 'xim3ocTGn4E', 'E9HD9Sc6tzM'], { variant: '3check' });
  add(['PPe7vscru0o', 'y4jUrlwAPlA', 't8VWAr2UicA'], { variant: 'kingofthehill' });
  add(['8uamUF9_3is', '753ZN9F-mzU'], { variant: 'chess', chess960: true });                              /* g4_960 king-onto-rook castling */
  add(['WNAxheS0e7E'], { variant: 'chess', chess960: true, castling: false });                             /* no 960 castling hook */
  add(['yXE14E0QKNI'], { variant: 'gothic' });                                                              /* 10x8, Chancellor C, Archbishop A */
  add(['cigOpktP92s'], { variant: 'gothic', castling: false });                                             /* castles 2 squares here */
  add(['Bzbzs0K5IBs', 'MQAC6oSeQzk', 'E2x-QTgBD5k', 'TX8zxTIeby4', 'ioUPg_z2KpA'], { variant: 'duck', pieces: { '*': '*' } });
  add(['4oJgefAYN4k', 'OWbQgMUwgBQ', 'RnMKtGgKknQ'], { variant: 'torpedo' });
  add(['3PfBlaosAmY', 'aK1cIhZDzkI'], { variant: 'pawnsideways' });
  add(['GuyllCIRcQI', 'XfDeP9FjZ7w'], { variant: 'shatranj', pieces: CHAT });                              /* bare king and stalemate lose */
  CM_DATA.fairyModes = T;
})();
