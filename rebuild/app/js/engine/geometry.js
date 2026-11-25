/* Board geometry: any files x ranks rectangle, optional holes, optional file wrap (cylinder).
   Square index i = r * files + c, where r = 0 is the TOP row from White's point of view
   (the highest rank) and c = 0 is the a-file. So on 8x8, a8 = 0, h8 = 7, a1 = 56, h1 = 63
   (the same layout the legacy engine used). */
(function () {
  'use strict';
  var CM = window.CM;
  var LET = 'abcdefghijklmnopqrstuvwxyz';

  function fileName(c) { return c < 26 ? LET[c] : LET[Math.floor(c / 26) - 1] + LET[c % 26]; }

  function Geometry(files, ranks, opts) {
    opts = opts || {};
    if (!(files >= 1 && files <= 32 && ranks >= 1 && ranks <= 32)) throw new Error('board size out of range: ' + files + 'x' + ranks);
    this.files = files; this.ranks = ranks; this.size = files * ranks;
    this.wrapFiles = !!opts.wrapFiles;
    this.valid = new Uint8Array(this.size).fill(1);
    var self = this;
    (opts.holes || []).forEach(function (h) {
      var i = typeof h === 'number' ? h : self.parse(h);
      if (i >= 0) self.valid[i] = 0;
    });
    /* mask: array of strings top row first; '.' = square, 'x' / ' ' / '-' = hole */
    if (opts.mask) {
      opts.mask.forEach(function (row, r) {
        for (var c = 0; c < files; c++) { var ch = row[c]; if (ch === 'x' || ch === ' ' || ch === '-' || ch === undefined) self.valid[r * files + c] = 0; }
      });
    }
  }
  Geometry.prototype.idx = function (c, r) { return r * this.files + c; };
  Geometry.prototype.col = function (i) { return i % this.files; };
  Geometry.prototype.row = function (i) { return Math.floor(i / this.files); };
  Geometry.prototype.rank = function (i) { return this.ranks - this.row(i); };         /* 1-based rank number */
  Geometry.prototype.isValid = function (i) { return i >= 0 && i < this.size && this.valid[i] === 1; };
  Geometry.prototype.isLight = function (i) { return (this.col(i) + this.row(i)) % 2 === 0; };
  Geometry.prototype.fileName = fileName;
  Geometry.prototype.name = function (i) { return fileName(this.col(i)) + this.rank(i); };
  /* 'e4' -> index; returns -1 when off the board */
  Geometry.prototype.parse = function (s) {
    if (typeof s === 'number') return s;
    var m = /^([a-z]{1,2})(\d{1,2})$/.exec(String(s).trim().toLowerCase());
    if (!m) return -1;
    var f = m[1], c = f.length === 1 ? LET.indexOf(f) : (LET.indexOf(f[0]) + 1) * 26 + LET.indexOf(f[1]);
    var rank = +m[2], r = this.ranks - rank;
    if (c < 0 || c >= this.files || r < 0 || r >= this.ranks) return -1;
    return this.idx(c, r);
  };
  /* step from i by (dc, dr) in SCREEN terms (dr < 0 = up). Returns -1 off board, -2 for a hole. */
  Geometry.prototype.step = function (i, dc, dr) {
    var c = i % this.files + dc, r = Math.floor(i / this.files) + dr;
    if (r < 0 || r >= this.ranks) return -1;
    if (c < 0 || c >= this.files) { if (!this.wrapFiles) return -1; c = ((c % this.files) + this.files) % this.files; }
    var j = r * this.files + c;
    return this.valid[j] ? j : -2;
  };
  /* forward direction in screen rows for a colour: white moves up the screen */
  Geometry.prototype.fwd = function (color) { return color === 'b' ? 1 : -1; };
  /* row index of the far edge for promotion etc. */
  Geometry.prototype.lastRow = function (color) { return color === 'b' ? this.ranks - 1 : 0; };
  Geometry.prototype.relRow = function (i, color) { var r = this.row(i); return color === 'b' ? r : this.ranks - 1 - r; }; /* 0 = own back row */
  Geometry.prototype.dist = function (a, b) { /* king distance */
    var dc = Math.abs(this.col(a) - this.col(b)), dr = Math.abs(this.row(a) - this.row(b));
    if (this.wrapFiles) dc = Math.min(dc, this.files - dc);
    return Math.max(dc, dr);
  };
  Geometry.prototype.squares = function () { var o = []; for (var i = 0; i < this.size; i++) if (this.valid[i]) o.push(i); return o; };
  Geometry.prototype.parseList = function (list) {
    var self = this; if (!list) return [];
    if (typeof list === 'string') list = list.split(/[\s,]+/).filter(Boolean);
    return list.map(function (s) { return self.parse(s); }).filter(function (i) { return i >= 0; });
  };

  CM.Geometry = Geometry;
})();
