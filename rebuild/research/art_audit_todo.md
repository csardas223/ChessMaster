# Art audit TODO (2026-11-25 2:35 PM ET, session cut off by usage limit)
Owner: "make sure all the art looks proper" BEFORE merging to main. All 500 modes were screenshotted at 390px and every asset viewed.
No load failures anywhere. Fixed + pushed: Thermopylae (a7428d4), q2 batch (b260142), q4 3 commits (pushed unverified by QA: run
qa_all.py --ids=y5MBC8OCYlI,sEXa38X1bhY,wMdAOirSvQQ,x-ISu_8MDvY,qSwTtgUWqUw,vDzojyJO3sI,vQ3hLgU6jLA,xjEz7bCQxho,oGP4TUDjSVk,tsqxjK8GP10,pHItplJMih0 --redo --par 1).
Tools: rebuild/tools/art_q2_recut.py (cuts from maxres thumbnails; they DO download from the sandbox), rebuild/app/tools/art_q4_fix.py (needs scipy).
Fix each item from its video (frames/thumbnails), QA the id, log in impl_6_report.md under art-audit-q1..q4.

## q1 (ids -TKJ..GGvp) - nothing fixed yet
1. GGvpHVEgqwY Chinese vs Modern: chariot/advisor blurry with beige squares, cannon crop strips, elephant spills off square -> fresh in-game frames.
2. AWFB4EzGtDc Gun King: pawn.png blue blotches, red_pawn.png solid blue bg, gun_king.png dark corners. Grey pawn: video_thumbs/AWFB4EzGtDc_frame_62.jpg ~(1110,686); red pawn frame_492 ~(416,436).
3. Bzbzs0K5IBs duck.png uncut -> use E2x-QTgBD5k/duck.png (same chess.com duck, clean).
4. 9M2Mj2WFFys pieces/ (bK, bN) green fringe -> despill.
5. AvZiSnngZjA king.png "hotgun King" text on top (crop y>=44); king_b.png top stripe + green fringe.
6. Avatars with text/UI: DStCmEElxW0/leela.png, CSjh4NrnxLE/tony.png, 6qVgF1OO_cw/martin.png (also 6YEM7m8owJ4, 9S2QuAHo24c), D8olpXjblQ0/lvl25.png.
7. 4tDIBl14AX8 martin.png 74px -> use cleaned 6qVgF1OO_cw/martin.png.
8. D1hAji3BgJw unicorn_knight.png magenta border -> key out.
9. SCP tiles -fax07t_o5s/shyguy, 06OeGk5Iu-s/reptile, 4XV3SBMQgXE/mask: neighbouring square strips -> trim.
10. Low-res, maybe no better source: 8CtX9G07bMU/Ag3KKsIrax4 potions, 4EIPARnGSSU fog, 96px avatars (34iAKIAMKb8 3PfBlaosAmY 3_eutZExN2c 4oJgefAYN4k 5K72RRDBN5U 88CgS9anXJs), CxtttdnwNWk/cu tokens.
Leave (video's own look): A7gdM2GD1b0 transformer mosaic, DZYjyPOvGho red_king_overlay checker, 9j7h5kF4X9s scanlines.

## q2 (GH9t..X-aU) - batch fixed b260142; left
- 96px avatars: GQ6MT1m78Yo Oj5rYPqpldg SC1loYlAJRE QrKIKcYN5m4 VV9Wb6egokU (try intro.jpg / thumbnail).
- WXcmWG7Eczs R_w.png blue-grey streak; Iq_w.png etc speckle halos.
- JPDYufARCQU star_pawn.png 32px uncut (source unclear).
- Uncut blurry tiles: Re3c-3qomgQ cobble/tnt, VVuAgqLzD_o rock, I07GcHQtY2o pit. Rtee8TRU0vg die.png. X-aULHXsAaI flag dark right fringe.

## q3 (X1aD..mwv4) - nothing fixed yet
1. exMFzra96vo die.png opaque cut-off dice over board -> cut middle die, fit '28%'.
2. gY9DNg9xDUM ornate_knight.png uncut tile -> cut from frames/sprites/gY9DNg9xDUM_tiny_intro_pieces.png, fit '40%'.
3. h7UFq4r59tM four_kings.png black bands + magenta lines -> recrop from sprites/h7UFq4r59tM_four_kings.png. Player pieces look orange: check vs video.
4. hk85bBLSi7Q hawk_b.png cream rect + green zigzag -> dark recolour of hawk_w.png (inferred).
5. hv_NHWqysZE troll.png (also puKYAUl9x9s, ulE3YPZI9Sc) black top strip.
6. Y7KKKTTkwNk goose.png lost outline -> recut from sprites/Y7KKKTTkwNk_goose.png.
7. _RFXN1Ye3sY ouroboros_queen.png title text across top -> inpaint.
8. Fish avatars with title glyphs: ZoSm2Wxlhvo lDlOC8KH0Zc dR76717W3JM dKZfe4uB_RM Y3Jneu7zoq0 iqfHW2_sMmc inm7KvllVu0 -> point to U_irVoLjtNI/stockfish.png (same art 256px).
9. DONE 2ca3d8f (art-audit-q3b): fRZmYTwLE54 electric_king stray fragments dropped (kept glow within 12px of the king); magnet recut from maxresdefault (old cut had the white square inside the U, lower pole cut off).
10. DONE 2ca3d8f (art-audit-q3b): mZUViBNWt6E boat_* = copies of q4's oGP4TUDjSVk recut (same chess.com Chaturaji art).
11. DONE 2ca3d8f (art-audit-q3b): lpqVYTH9U-A toaster.png (used by Ji7frCIfmAQ too) + thought.png stray lines dropped (largest component). 12. DONE 2ca3d8f (art-audit-q3b): dkCMhNcZezM + dztzDlPfqSI passant_ai.png arrow tip painted out.
13. DONE 2ca3d8f (art-audit-q3b): d9oDfmcMJvA gabriel.png = statue keyed off the pink square in maxres1 (~200px; the 128px sprite was the same still).
14. DONE 2ca3d8f (art-audit-q3b): fUQXSj5jVUk the old 'chariot' disc was the advisor (crowned figure) -> advisor_r/_b; new chariot (tower) + cannon discs with xiangqi.com help-page icon line art on the set's disc.
15. DONE 2ca3d8f (art-audit-q3b): f4O--Ai7B9A opp2 = d3sspair's exact chess.com avatar (96px is the original upload size); opp1 re-cropped without the chess.com frame (username truncated in the video, no hi-res copy found: stays 51px->96).
Non-art: DONE (art-audit-q3b) Y1WHtLBLloY notify.mp3: no bug - assets/sounds/notify.mp3 is chess.com's notify (41c2b07) and loads 200/206 in playwright; the audit likely saw Chromium's net::ERR_ABORTED on media preload (also seen for premove/tenseconds), no change. JAz_qMQpI1o general/prince/fool (w+b) DONE e25b466: clean 3px contrast outline, no grey halo.

## q4 (mymJ..zxRM) - 3 commits pushed; left
- Uncut square bgs (check vs frame): mymJwfSPeFA shadow, s2WDIfvefEk scp939, sPNWgAzFzxM lapis, rsI_92dNd9M horse, w15Ev7q2HmI crater, xvibqyL-CqQ boiled, vPEVQgvjoL4 mal0, zP9TzlgA-W0 skull_enemy.
- Specks: o5yiE_GHcrQ chariot/elephant (despeckle()), rx-HCGCNuDo sword_king, xvlHij1tgk8 cat_knight/slime, spJibM5qaNQ joker/peg/bishop.
- Frame check: qTXES0F1MVQ three_plus, pzxXxIsKRRo shotgun_king, piiE6JB8pWw opp1 owl, pGVRaaLnMAY sergeant/soldier gap, qqvbb2r2k5I scan-line stripes.
- o8XcmMCIhIk/fish.png + onv0NOspxH8/fish.png UI bracket -> U_irVoLjtNI/stockfish.png.
- Optional: t61xLLQbotM magnus (14 modes), vwJw6aaggn8 zach low-res -> chess.com API copies.
