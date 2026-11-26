# fin-sfx evidence (2026-11-26)
Metric tables for SFX v5 + v5b (FPS guns), as on main 9d79d26. Owner reference clip is NEVER committed (sandbox only).
- similarity_events_main_9d79d26.md: tools/sfx/similarity.py vs reference, all 21 events < 0.6, 0 dup pairs
- fps_gate_after.txt: tools/sfx/fps_gate.py, AWFB4EzGtDc guns pistol 0.56 / shotgun 0.54 / machine 0.40 / crossbow 0.52 / grenade 0.57 / reload 0.55, BAD none
- ring_check_all.txt: 0 struck rings > 150 ms
- qa_sound_main.json: headless sound test pass (88 files load+play, move sounds fire, 0 console errors)
- qa_ui_main.txt: qa_ui 41/41 (skins check flakes under load, passes alone)
- tools/: copies of fps_gate.py and qa_sound.py (canonical copies on main: tools/sfx/)
