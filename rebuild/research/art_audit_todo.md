# Art audit TODO (2026-11-25 2:35 PM ET, session cut off by usage limit)
Owner: "make sure all the art looks proper" BEFORE merging to main. All 500 modes were screenshotted at 390px and every asset viewed.
No load failures anywhere. Fixed + pushed: Thermopylae (a7428d4), q2 batch (b260142), q4 3 commits (pushed unverified by QA: run
qa_all.py --ids=y5MBC8OCYlI,sEXa38X1bhY,wMdAOirSvQQ,x-ISu_8MDvY,qSwTtgUWqUw,vDzojyJO3sI,vQ3hLgU6jLA,xjEz7bCQxho,oGP4TUDjSVk,tsqxjK8GP10,pHItplJMih0 --redo --par 1).
Tools: rebuild/tools/art_q2_recut.py (cuts from maxres thumbnails; they DO download from the sandbox), rebuild/app/tools/art_q4_fix.py (needs scipy).
Fix each item from its video (frames/thumbnails), QA the id, log in impl_6_report.md under art-audit-q1..q4.

## q1 (ids -TKJ..GGvp) - DONE (art-audit-q1, tools/art_q1_fix.py, QA 46/46 ok; see impl_6_report 'art-audit-q1')
1. GGvpHVEgqwY Chinese vs Modern: chariot/advisor blurry with beige squares, cannon crop strips, elephant spills off square -> fresh in-game frames. DONE 7152ed5 (from maxres1; old advisor.png was the elephant head)
2. AWFB4EzGtDc Gun King: pawn.png blue blotches, red_pawn.png solid blue bg, gun_king.png dark corners. Grey pawn: video_thumbs/AWFB4EzGtDc_frame_62.jpg ~(1110,686); red pawn frame_492 ~(416,436). DONE 2c2d88b
3. Bzbzs0K5IBs duck.png uncut -> use E2x-QTgBD5k/duck.png (same chess.com duck, clean). DONE b863b11 (both recut from sprites/E2x-QTgBD5k_duck.png: E2x's own copy had brown bits + clipped head)
4. 9M2Mj2WFFys pieces/ (bK, bN) green fringe -> despill. DONE b863b11
5. AvZiSnngZjA king.png "hotgun King" text on top (crop y>=44); king_b.png top stripe + green fringe. DONE cfd110a
6. Avatars with text/UI: DStCmEElxW0/leela.png, CSjh4NrnxLE/tony.png, 6qVgF1OO_cw/martin.png (also 6YEM7m8owJ4, 9S2QuAHo24c), D8olpXjblQ0/lvl25.png. DONE a4dcd89
7. 4tDIBl14AX8 martin.png 74px -> use cleaned 6qVgF1OO_cw/martin.png. DONE a4dcd89
8. D1hAji3BgJw unicorn_knight.png magenta border -> key out. DONE cb6b64d
9. SCP tiles -fax07t_o5s/shyguy, 06OeGk5Iu-s/reptile, 4XV3SBMQgXE/mask: neighbouring square strips -> trim. DONE cb6b64d
10. Low-res, maybe no better source: 8CtX9G07bMU/Ag3KKsIrax4 potions, 4EIPARnGSSU fog, 96px avatars (34iAKIAMKb8 3PfBlaosAmY 3_eutZExN2c 4oJgefAYN4k 5K72RRDBN5U 88CgS9anXJs), CxtttdnwNWk/cu tokens. PARTLY DONE 0f2a9d6: potions -> chess.com's own 179px spell icons; 3PfBlaosAmY -> chess.com API copy. LEFTOVER (no exact better source): fog, other 5 avatars, cu tokens (see impl_6_report 'art-audit-q1').
Leave (video's own look): A7gdM2GD1b0 transformer mosaic, DZYjyPOvGho red_king_overlay checker, 9j7h5kF4X9s scanlines.

## q2 (GH9t..X-aU) - batch fixed b260142 (QA'd 20/20 ok); leftovers DONE 9332fbd (tools/art_q2_fix2.py, QA 20/20 ok)
- DONE 9332fbd 96px avatars: GQ6MT1m78Yo + SC1loYlAJRE 256px from thumbnails, VV9Wb6egokU 200px chess.com copy, QrKIKcYN5m4 red strip
  trimmed (still 96px: no larger source). LEFT: Oj5rYPqpldg chadkatter photo stays 96px (no thumbnail shot, no chess.com avatar now).
- DONE 9332fbd WXcmWG7Eczs R_w.png blue-grey streak; Iq_w.png etc speckle halos (all 21 doodles).
- DONE 9332fbd JPDYufARCQU star_pawn.png redrawn 96px (inferred from the 32px sprite colours); intro overlay -> secret_queen_pawn.png (thumbnail).
- DONE 9332fbd Uncut blurry tiles: Re3c-3qomgQ cobble/tnt, VVuAgqLzD_o rock, I07GcHQtY2o pit. Rtee8TRU0vg die.png. X-aULHXsAaI flag dark right fringe.
  (cobble + rock stay soft: only the small frame cuts exist.)

## q3 (X1aD..mwv4) - items 1-8 done (art-audit-q3a), 9-15 done (art-audit-q3b); left: inm7KvllVu0 trout avatar
1. DONE dab7265 (art-audit-q3a): exMFzra96vo die.png = middle die only, grey bg keyed, 192px; overlay fit '28%'.
2. DONE dab7265 (art-audit-q3a): gY9DNg9xDUM ornate_knight.png = white dragon knight cut from tiny_intro_pieces (outline kept), 256px; fit '40%'.
3. DONE c7a4505 (art-audit-q3a): h7UFq4r59tM four_kings.png = the 4 kings keyed off the maxres thumbnail (transparent, no bands/lines/title). Orange pieces: css .pc--tint-r/u/y/g were pastel on the white set; refitted to the chess.com 4PC swatches (#bf3b43 #4185bf #c09526 #4e9161), affects every tinted 4-player mode.
4. DONE a8ac66b (art-audit-q3a): hk85bBLSi7Q hawk_b.png = dark recolour of hawk_w.png (inferred; black body, light inner lines, outline kept).
5. DONE 13f2d2b (art-audit-q3a): hv_NHWqysZE troll.png (also puKYAUl9x9s, ulE3YPZI9Sc) top strip cropped, re-squared to 128.
6. DONE d2ba933 (art-audit-q3a): Y7KKKTTkwNk goose.png recut from the sprite with its black outline, 256px.
7. DONE 102c89c (art-audit-q3a): _RFXN1Ye3sY ouroboros_queen.png title text inpainted (no clean frame/web copy exists); crown tip under the 's' is soft.
8. DONE 680b7af (art-audit-q3a): ZoSm2Wxlhvo lDlOC8KH0Zc dR76717W3JM dKZfe4uB_RM Y3Jneu7zoq0 iqfHW2_sMmc -> U_irVoLjtNI/stockfish.png (old crops deleted). LEFT inm7KvllVu0: its avatar is different art (52px photo trout head = what the video shows), not the diamond fish; still no hi-res copy.
9. DONE 2ca3d8f (art-audit-q3b): fRZmYTwLE54 electric_king stray fragments dropped (kept glow within 12px of the king); magnet recut from maxresdefault (old cut had the white square inside the U, lower pole cut off).
10. DONE 2ca3d8f (art-audit-q3b): mZUViBNWt6E boat_* = copies of q4's oGP4TUDjSVk recut (same chess.com Chaturaji art).
11. DONE 2ca3d8f (art-audit-q3b): lpqVYTH9U-A toaster.png (used by Ji7frCIfmAQ too) + thought.png stray lines dropped (largest component). 12. DONE 2ca3d8f (art-audit-q3b): dkCMhNcZezM + dztzDlPfqSI passant_ai.png arrow tip painted out.
13. DONE 2ca3d8f (art-audit-q3b): d9oDfmcMJvA gabriel.png = statue keyed off the pink square in maxres1 (~200px; the 128px sprite was the same still).
14. DONE 2ca3d8f (art-audit-q3b): fUQXSj5jVUk the old 'chariot' disc was the advisor (crowned figure) -> advisor_r/_b; new chariot (tower) + cannon discs with xiangqi.com help-page icon line art on the set's disc.
15. DONE 2ca3d8f (art-audit-q3b): f4O--Ai7B9A opp2 = d3sspair's exact chess.com avatar (96px is the original upload size); opp1 re-cropped without the chess.com frame (username truncated in the video, no hi-res copy found: stays 51px->96).
Non-art: DONE (art-audit-q3b) Y1WHtLBLloY notify.mp3: no bug - assets/sounds/notify.mp3 is chess.com's notify (41c2b07) and loads 200/206 in playwright; the audit likely saw Chromium's net::ERR_ABORTED on media preload (also seen for premove/tenseconds), no change. JAz_qMQpI1o general/prince/fool (w+b) DONE e25b466: clean 3px contrast outline, no grey halo.

## q4 (mymJ..zxRM) - DONE (art-audit-q4, 2026-11-25 ~3 PM ET; QA of the 11 earlier q4 ids 22/22 ok)
- DONE dd7a704 Uncut square bgs: mymJwfSPeFA shadow, s2WDIfvefEk scp939 + vPEVQgvjoL4 mal0 (recut from their maxres thumbnails), sPNWgAzFzxM lapis, rsI_92dNd9M horse, w15Ev7q2HmI crater (green square + baked-in pawn removed; pawn hole filled from the crater ring = inferred), zP9TzlgA-W0 skull_enemy (Golem Fortress token recut from maxres2). xvibqyL-CqQ boiled: checked, the red square is the piece's own art in the frames (visual notes "Boiled One piece (red square with creature)"), kept.
- DONE 2a0b26f Specks: o5yiE_GHcrQ chariot/elephant, rx-HCGCNuDo sword_king (loose specks; motion lines are art), xvlHij1tgk8 slime, spJibM5qaNQ joker (recut) + peg (recut); 67d7bbe xvlHij1tgk8 cat_knight_av crop strip (cat_knight.png is unused). spJibM5qaNQ bishop: checked, clean.
- DONE 178ce9d Frame checks: qTXES0F1MVQ three_plus (recut, teal fill was missing), pzxXxIsKRRo shotgun_king (recut), piiE6JB8pWw opp1 owl (= exact chess.com Klub4Konej avatar; opp2 already the chess.com copy), pGVRaaLnMAY sergeant/soldier (gaps = the video's black outline lines, recut), qqvbb2r2k5I scan-line stripes = the game's CRT filter in the frames (kept).
- DONE 4168158 o8XcmMCIhIk + onv0NOspxH8 avatar -> assets/modes/U_irVoLjtNI/stockfish.png (own fish.png deleted).
- Optional: DONE 6514b9e vwJw6aaggn8 zach (exact chess.com Zach-BOT art). LEFT t61xLLQbotM magnus: chess.com's MagnusCarlsen avatar is now a Santa-mask photo (not the video's cartoon); magnus-bot / magnuscarlsen-bot do not exist (404) -> no exact copy, kept.
