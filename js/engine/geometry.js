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
    if (!(files >= 1 && files <= 64 && ranks >= 1 && ranks <= 64)) throw new Error('board size out of range: ' + files + 'x' + ranks);
    this.files = files; this.ranks = ranks; this.size = files * ranks;
    this.wrapFiles = !!opts.wrapFiles;
    this.valid = new Uint8Array(this.size).fill(1);
    var self = this;
    (opts.holes || []).forEach(function (h) {
      var i = typeof h === 'number' ? h : self.parse(h);
      if (i >= 0) self.valid[i] = 0;
    });
    /* shape generators: 'cross' (4-player plus board: corner x corner cut from each corner), 'diamond' */
    var shape = opts.shape && (typeof opts.shape === 'string' ? { type: opts.shape } : opts.shape);
    if (shape && shape.type === 'cross') {
      var k = shape.corner == null ? Math.floor(Math.min(files, ranks) / 4) : shape.corner;
      for (var i0 = 0; i0 < this.size; i0++) { var c0 = i0 % files, r0 = Math.floor(i0 / files);
        if ((c0 < k || c0 >= files - k) && (r0 < k || r0 >= ranks - k)) this.valid[i0] = 0; }
    } else if (shape && shape.type === 'diamond') {
      var cx = (files - 1) / 2, cy = (ranks - 1) / 2, rad = shape.radius == null ? Math.min(cx, cy) + 0.5 : shape.radius;
      for (var i1 = 0; i1 < this.size; i1++) if (Math.abs(i1 % files - cx) + Math.abs(Math.floor(i1 / files) - cy) > rad) this.valid[i1] = 0;
    }
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
  /* Each colour has a forward direction on screen: 'up' (White), 'down' (Black), 'left', 'right' (4-player sides).
     FR(c) gives the screen vectors of the owner's forward (F) and right-hand (R) directions. */
  var FRS = { up: { F: [0, -1], R: [1, 0] }, down: { F: [0, 1], R: [-1, 0] }, right: { F: [1, 0], R: [0, 1] }, left: { F: [-1, 0], R: [0, -1] } };
  Geometry.prototype.dirs = null;
  Geometry.prototype.setDir = function (color, dir) { if (!this.dirs) this.dirs = { w: 'up', b: 'down' }; this.dirs[color] = FRS[dir] ? dir : 'up'; };
  Geometry.prototype.dirOf = function (color) { return (this.dirs && this.dirs[color]) || (color === 'b' ? 'down' : 'up'); };
  Geometry.prototype.FR = function (color) { return FRS[this.dirOf(color)]; };
  Geometry.prototype.fwd = function (color) { return this.dirOf(color) === 'down' ? 1 : -1; };
  Geometry.prototype.lastRow = function (color) { return this.dirOf(color) === 'down' ? this.ranks - 1 : 0; };
  /* how far a square is from the colour's own back edge (0 = back row), along its forward direction */
  Geometry.prototype.relRow = function (i, color) {
    switch (this.dirOf(color)) { case 'down': return this.row(i); case 'right': return this.col(i); case 'left': return this.files - 1 - this.col(i); default: return this.ranks - 1 - this.row(i); }
  };
  Geometry.prototype.depth = function (color) { var d = this.dirOf(color); return d === 'left' || d === 'right' ? this.files : this.ranks; };
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
