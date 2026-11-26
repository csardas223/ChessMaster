# fin-fps evidence (FPS Chess 3D duel: PszkLYudcws, Nz2A-g73_iM)
Code lives on main / wip/fps-3d: js/modes/fps3d/duel.js, js/modes/fps3d/models.js, js/modes/g5_fps.js, tools/qa_fps3d.py, docs/fps3d-wip.md.
- video/: references the 3D arena and models were matched to. thumb_* = YouTube thumbnails, t1-t3_* = YouTube auto stills
  (i.ytimg maxres1-3) of each video; arena.jpg = PszkLYudcws duel still (Victorian red room under the giant table);
  duel_card.jpg / N_duel_card.jpg = VS cards; *ak_pawn* = Nz2A pawn with AK; model_* = piece cut-outs; *_fps_king_knight = Nz2A duel.
  Same images (png) are in the app under assets/modes/{PszkLYudcws,Nz2A-g73_iM}/.
- qa/prev_*: qa_fps3d.py screenshots from the run before 2026-11-26 11:15 AM ET (phone pass; desk runs slow under sandbox load).
  sheet*.jpg / psheet.jpg = contact sheets of those runs. New runs go in qa/ without the prev_ prefix.
- tools/dbgw.py: sandbox debug script used while tuning the duel (playwright, prints CM.fps3d.dbg()).
