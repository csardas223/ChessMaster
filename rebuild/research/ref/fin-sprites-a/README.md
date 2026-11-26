# fin-sprites-a evidence (owner rule 2026-11-26 11:14 AM ET: everything in the repo)
- qa/dbg.jpg: VICTORY banner check (Dice Chess B5LGzOEZSyo, 390x844).
- qa/sheet1.jpg: Castling Checkmate popup + banner (normal / reduced motion), Atomic explosion + check ring, Stockfish in a Maze banner.
- qa/vfx_<id>_a_2.jpg / vfx_<id>_rm_2.jpg: vfxqa win-frame for each of the 52 batch-1 preset modes, normal (a) and reduced motion (rm).
Tools + lists: rebuild/tools/fin_sprites_a_vfx/ (vfxqa.py = one json at the end, vfxqa2.py = jsonl per id, safe to run in parallel with
own ports: python3 vfxqa2.py rebuild/app <port> <id,id,...> shots <out.jsonl>; ids_a.txt = my 252 sorted ids; ids_3d.txt = skipped 3D ids;
vfx_triage.tsv = id, category, frame, (col4/5 counts), tag, name, spec visual_fx; vfx_ids1.txt = batch-1 ids; rem_specs.txt = spec
visual_fx/vfx_timeline/events digest of the 171 remaining non-horror non-3D ids).
