/* Can I BEAT a 2000 ELO with 1 Pawn?: "Super Normal Chess" vs Croissant. You have a king and one h-pawn against his whole
   army, plus three secret cheats: the intern (a space-suit runner) steals an enemy piece, delete an empty square from the
   board (sliders stop at it, knights still jump over), and spawn one new pawn. Sources: research/modes/2er3r0JGeNg.json,
   transcript 0:01 (K + pawn vs Croissant, 3 superpowers), 0:48 h4, 1:03-1:36 intern steals the queen, 2:14-3:08 squares
   removed (knight jumps over), 3:14 "insurance policy" new pawn (once), 5:04/5:43/7:14/8:20 more steals, 9:13 Qe8#.
   Pass 2 rework (impl-3, 2026-11-24): replaces the earlier thumbnail-only guess. Art: intern = Among Us crewmate sprite from the video; synth sounds. */
CM.mode({
  id: "2er3r0JGeNg",
  title: "Can I BEAT a 2000 ELO with 1 Pawn?",
  name: "1 Pawn + 3 Cheats vs Croissant",
  category: "Challenges & Odds",
  description: "\"Super Normal Chess\": you have a king and one h-pawn against Croissant's full army, plus three cheats he does not know about. Once per turn, before your move, you may use one: the intern runs across the board and steals an enemy piece, delete an empty square from the board (sliding pieces stop at the hole, knights still jump over it), or spawn a brand-new pawn (once per game).",
  how_to_win: "Promote and checkmate Croissant.",
  player_side: "white",
  player: { name: "iwantcheckmate", rating: null, avatar: "assets/modes/uUXev8TPVak/iwantcheckmate.png" },
  opponent: {
    name: "Croissant",
    rating: 2000,
    avatar: "assets/modes/FBrM-CLBZDA/croissant.png",
    tagline: "a friend told this is a super normal game of chess"
  },
  board: { files: 8, ranks: 8 },
  theme: { light: "#eaf6d2", dark: "#7ea266" },
  pieces: {
    Void: { name: "Deleted square", moves: "", value: 0, blocker: true, capturable: false, overlay: "void" }
  },
  setup: { fen: "rnbqkbnr/pppppppp/8/8/8/8/7P/4K3", x: { cheatPly: -1, pawn: 1 } },
  bot: { engine: "search", elo: 2000 },
  sounds: {
    steal: "assets/modes/2er3r0JGeNg/steal.wav",
    voidsq: "assets/modes/2er3r0JGeNg/void.wav",
    spawn: "assets/modes/2er3r0JGeNg/spawn.wav"
  },
  assets: { intern: "assets/modes/2er3r0JGeNg/intern.png" },
  messages: { win_title: "Super Normal Chess!", win: "checkmate with one pawn (and a little help)" },
  hooks: (function () {
    var pick = null;
    var NAMES = { P: "pawn", N: "knight", B: "bishop", R: "rook", Q: "queen" };
    function css() {
      if (document.getElementById("g3-2er-css")) return;
      var s = document.createElement("style"); s.id = "g3-2er-css";
      s.textContent = ".g3-cheats{display:flex;gap:6px;align-items:center;margin-left:auto;margin-right:8px}" +
        ".g3-cheats button{display:flex;align-items:center;gap:4px;border:0;border-radius:6px;padding:5px 8px;background:#3a3835;color:#e8e6e1;font:600 12px/1 system-ui,sans-serif;cursor:pointer;transition:background .12s ease-out}" +
        ".g3-cheats button[aria-pressed=true]{background:#5d9be0;color:#fff}.g3-cheats button:disabled{opacity:.42;cursor:default}" +
        ".g3-cheats img{width:16px;height:16px}.g3-cheats .pw{font-size:15px;line-height:14px}" +
        "@media (max-width:380px){.g3-cheats button span.l{display:none}}" +
        ".sq.g3x-pick::after{content:'';position:absolute;inset:0;box-shadow:inset 0 0 0 3px rgba(93,155,224,.9);background:rgba(93,155,224,.18);pointer-events:none;z-index:2}" +
        ".g3x-runner{position:fixed;z-index:60;pointer-events:none;transition:left .46s ease-out,top .46s ease-out,opacity .3s ease-out}" +
        "@media (prefers-reduced-motion:reduce){.g3x-runner{transition:opacity .3s ease-out}}";
      document.head.appendChild(s);
    }
    function reduced() { return window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; }
    function ready(ctx) { var G = ctx.game; return !ctx.over && !G.busy && ctx.state.turn === ctx.human && ctx.x.cheatPly !== ctx.state.ply; }
    function cancel(ctx) {
      if (!pick) return; var b = document.getElementById("board");
      if (b) { b.removeEventListener("click", pick.click, true); b.removeEventListener("pointerdown", pick.stop, true); }
      pick = null; if (ctx) ctx.game.render();
    }
    function squares(ctx, kind) {
      var st = ctx.state, g = ctx.geo, me = ctx.human, out = [];
      for (var i = 0; i < st.b.length; i++) {
        if (!g.valid[i]) continue; var p = st.b[i];
        if (kind === "steal" && p && p.c !== me && p.c !== "n" && !ctx.V.def(p.t).royal) out.push(i);
        if (kind === "void" && !p) out.push(i);
        if (kind === "pawn" && !p) { var r = g.relRow(i, me); if (r >= 1 && r <= 5) out.push(i); }
      }
      return out;
    }
    function arm(ctx, kind) {
      if (pick && pick.kind === kind) { cancel(ctx); return; }
      cancel(null);
      var set = {}; squares(ctx, kind).forEach(function (i) { set[i] = 1; });
      var b = document.getElementById("board"), gid = ctx.game.gid;
      pick = { kind: kind, set: set,
        stop: function (e) { if (e.target.closest && e.target.closest(".sq")) { e.stopPropagation(); e.preventDefault(); } },
        click: function (e) {
          var q = e.target.closest && e.target.closest(".sq"); if (!q || q.dataset.i == null) return;
          e.stopPropagation(); e.preventDefault();
          var i = +q.dataset.i; if (ctx.game.gid !== gid) { cancel(ctx); return; }
          if (!set[i]) { cancel(ctx); return; }
          cancel(null); use(ctx, kind, i);
        } };
      b.addEventListener("pointerdown", pick.stop, true); b.addEventListener("click", pick.click, true);
      ctx.game.render();
      CM.gameUI.setStatus({ steal: "Tap an enemy piece for the intern to steal.", void: "Tap an empty square to delete it from the board.", pawn: "Tap an empty square (ranks 2-6) for your new pawn." }[kind]);
    }
    function runner(ctx, i) {
      /* the intern runs in from the left edge, grabs the piece, and runs off to the right (fade only with reduced motion) */
      return new Promise(function (res) {
        var q = document.querySelector('#board .sq[data-i="' + i + '"]'), bd = document.getElementById("board");
        if (!q || !bd) { res(); return; }
        var r = q.getBoundingClientRect(), B = bd.getBoundingClientRect(), sz = r.width * 0.95;
        var img = document.createElement("img"); img.className = "g3x-runner"; img.alt = ""; img.src = ctx.spec.assets.intern;
        img.style.width = sz + "px"; img.style.height = sz * 1.12 + "px";
        var y = r.top + (r.height - sz * 1.12) / 2, red = reduced();
        img.style.left = (red ? r.left : B.left - sz) + "px"; img.style.top = y + "px"; img.style.opacity = red ? "0" : "1";
        document.body.appendChild(img);
        requestAnimationFrame(function () { requestAnimationFrame(function () { img.style.left = r.left + "px"; img.style.opacity = "1"; }); });
        setTimeout(function () {
          res();
          setTimeout(function () { img.style.transform = "scaleX(1)"; img.style.left = (red ? r.left : B.right + 4) + "px"; img.style.opacity = red ? "0" : "1"; }, 120);
          setTimeout(function () { img.style.opacity = "0"; }, 520);
          setTimeout(function () { img.remove(); }, 860);
        }, 500);
      });
    }
    function use(ctx, kind, i) {
      if (!ready(ctx)) return;
      var G = ctx.game, nm = ctx.name(i);
      if (kind === "steal") {
        var p = ctx.at(i); G.busy = true; ctx.sound("steal");
        runner(ctx, i).then(function () {
          G.busy = false; if (ctx.over) return;
          ctx.remove(i); ctx.setX("cheatPly", ctx.state.ply);
          ctx.fx({ type: "flash", at: nm, color: "#d8312f", opacity: 0.35, duration_ms: 320 });
          ctx.toast("The intern stole the " + (NAMES[p.t] || "piece") + " on " + nm + ".", 1600);
          ctx.refresh();
        });
        ctx.game.render();
        return;
      }
      if (kind === "void") {
        ctx.set(i, ctx.piece("Void", "n")); ctx.setX("cheatPly", ctx.state.ply); ctx.sound("voidsq");
        ctx.fx({ type: "flash", at: nm, color: "#000", opacity: 0.55, duration_ms: 380 });
        ctx.toast(nm + " deleted from the board.", 1400);
      } else if (kind === "pawn") {
        if (!ctx.x.pawn) return;
        var rr = ctx.geo.relRow(i, ctx.human);
        ctx.set(i, ctx.piece("P", ctx.human, { m: rr === 1 ? 0 : 1 })); ctx.setX("pawn", 0); ctx.setX("cheatPly", ctx.state.ply);
        ctx.sound("spawn"); ctx.fx({ type: "flash", at: nm, color: "#ffd75e", opacity: 0.5, duration_ms: 420 });
        ctx.fx({ type: "particles", kind: "sparks", at: nm, count: 14 });
        ctx.toast("Insurance policy: a brand-new pawn on " + nm + ".", 1600);
      }
      ctx.refresh();
    }
    function bar(ctx) {
      css();
      var host = document.getElementById("card-bottom"); if (!host) return;
      var el = host.querySelector(".g3-cheats");
      if (!el) { el = document.createElement("div"); el.className = "g3-cheats"; host.insertBefore(el, document.getElementById("clock-bottom")); }
      var ok = ready(ctx), k = pick && pick.kind;
      var html = '<button type="button" data-c="steal" aria-pressed="' + (k === "steal") + '"' + (ok ? "" : " disabled") + ' title="The intern steals an enemy piece"><img alt="" src="' + ctx.spec.assets.intern + '"><span class="l">Steal</span></button>' +
        '<button type="button" data-c="void" aria-pressed="' + (k === "void") + '"' + (ok ? "" : " disabled") + ' title="Delete an empty square"><span class="l">Delete</span></button>' +
        '<button type="button" data-c="pawn" aria-pressed="' + (k === "pawn") + '"' + (ok && ctx.x.pawn ? "" : " disabled") + ' title="Spawn a new pawn (once)"><span class="pw">♙</span><span class="l">Pawn ×' + (ctx.x.pawn || 0) + '</span></button>';
      if (el._h !== html) { el.innerHTML = html; el._h = html; }
      el.onclick = function (e) { var b = e.target.closest("[data-c]"); if (!b || b.disabled) return; arm(ctx, b.dataset.c); };
    }
    return {
      setup: function (ctx) { cancel(null); },
      onStart: function (ctx) { bar(ctx); ctx.toast("Psst: you have three cheats (buttons on your player bar). One per turn, before your move.", 3200); },
      decorate: function (ctx, sq) { return pick && pick.set[sq] ? { cls: "g3x-pick" } : null; },
      status: function (ctx) {
        bar(ctx);
        if (pick) return { steal: "Tap an enemy piece for the intern to steal.", void: "Tap an empty square to delete it from the board.", pawn: "Tap an empty square (ranks 2-6) for your new pawn." }[pick.kind];
        if (ctx.over || ctx.state.turn !== ctx.human) return "";
        return ctx.x.cheatPly === ctx.state.ply ? "Cheat used. Now make your move." : "Your move (you may use one cheat first).";
      },
      beforeMove: function (ctx) { if (pick) cancel(ctx); return true; },
      onUndo: function (ctx) { cancel(ctx); },
      onGameOver: function (ctx) { cancel(null); },
      onExit: function () { cancel(null); var el = document.querySelector("#card-bottom .g3-cheats"); if (el) el.remove(); Array.prototype.forEach.call(document.querySelectorAll(".g3x-runner"), function (n) { n.remove(); }); }
    };
  })(),
  source: {
    confidence: "medium",
    notes: "Rebuilt from the transcript: K + h-pawn (h4 first move) vs Croissant's full army, cheats used freely in the video (piece steals ~6 times, many squares deleted, one new pawn). The remake limits you to one cheat per turn so the bot still gets to play; the king's start square (e1) and Croissant's 2000 rating (video title) are inferred. The intern is an crewmate sprite from the video (vzNwF2BH8jg), not game art.",
    research: "research/modes/2er3r0JGeNg.json"
  }
});
