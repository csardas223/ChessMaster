#!/usr/bin/env python3
"""s5-art 2026-11-26: vzNwF2BH8jg impostor piece -> clean 512 px.
The video's piece is Among Us' classic red crewmate (old design: thick black outline, grey-blue visor with white glint,
grey floor shadow); every video crop has the kill hand over its right side. Source: Among Us Wiki File:Red_old_design.png
(148x198, https://among-us.fandom.com/wiki/File:Red_old_design.png), re-traced with tools/sprite_vec.py on its own flat palette.
usage: python3 tools/art_s5_impostor.py SRC.png OUT.png"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sprite_vec import vec
PAL = [(0, 0, 0), (118, 6, 52), (196, 20, 20), (52, 52, 52), (70, 100, 100), (150, 196, 212), (244, 244, 244)]
vec(sys.argv[1], sys.argv[2], k=len(PAL), palette=PAL, base=0, up=6, lab_smooth=0.3, smooth=0.6)
os.remove(sys.argv[2] + '.svg')
