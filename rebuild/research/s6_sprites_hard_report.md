# s6 sprites-hard report (Hark, 2026-11-26 ~12:40 AM ET)

## Done
rebuild: 7b40e1c (+ merge 974fbd8). main: f5ff739 (+ merge fca924a), ported with `git diff --binary --relative=rebuild/app`, PNGs byte-identical to rebuild.
- rf2HSTXTehE + _RFXN1Ye3sY queen_face.png, _RFXN1Ye3sY ouroboros_queen.png (boss intro): SAME illustration found in The Ouroboros King
  press kit (Google Drive folder linked from https://oriolcosp.com/the-ouroboros-king -> Art/ouroS3.png, 2416x4806 transparent;
  file id 1MTimXncC1J5qyZqwVWoa1lpFGJRL_e_-). Head+collar cut (mirror masked off) / upper-body cut, 512px ~92%, bottom-flush,
  no fading. Press-kit crown is darker than the video's red-tinted crown. The press kit also has every piece sprite
  (Art/pieces/*_w/_b.png: Fool, General, Glass Queen, King, Knight, Marching pawn, ... ) and relic/item art (Art/other sprites/)
  in case the Ouroboros piece sprites need redoing (I did not touch them: other agents were working in those folders).
- _Kx4ChHuCgI oldman.png: creator's own sprite https://iwantcheckmate.com/challenges/containment-breach/assets/oldman-new.png.
  NOTE for whoever does SCP art: that challenge's engine.js/app.js reference more originals under .../containment-breach/assets/:
  shyguy.png, lizard.png, mask.png, scp049.png, scp173.png, scp409.png, scp939.png, scp966.png, toaster.png, fog-wisps.jpg, wk.png, bk.png.
- U67wZoy-1fE despair.png: creature source still unidentified (searched; nothing). Clean alpha-unmix re-cut of the on-board sprite
  from https://i.ytimg.com/vi/U67wZoy-1fE/maxres1.jpg (200px square), eyes kept opaque, 512px. Spike tips/tendril base touch the
  square edge in the video too.
- JUlTxosCXuk scp2774.png: COMPOSITE of the video's two copies of the art: hi-res face+hood from the mirrored maxresdefault thumbnail,
  SIFT-aligned onto the on-board square in maxres1 (left hood drape). Hood's left edge is flat (clipped at its square in the video;
  no full copy online: SCP wiki New_Slothman.jpg is a different photo-like image).
- Sources in each folder's source.notes; licences in LICENSES.md (sprites-hard lines). Tools: rebuild/app/tools/sprites_hard/.

## QA
- rebuild: tools/qa_all.py --widths 390 --ids rf2HSTXTehE,_RFXN1Ye3sY,U67wZoy-1fE,JUlTxosCXuk,_Kx4ChHuCgI --redo: 5/5 ok.
- 390x844 touch screenshots (rebuild and main) checked by eye: sprites draw clean on the board/avatar; only console errors are
  the sandbox proxy blocking external CDNs (407 / ERR_TUNNEL).
- main: npm test 13/13 pass; npm run lint 0 errors (87 pre-existing warnings); node qa/validate-modes.mjs: only the known
  hZf3G9Pr1UU staunton3d error, output identical to baseline.

## Left / not done
- art_audit_todo.md leftovers fog (4EIPARnGSSU), the 96px avatars (34iAKIAMKb8, 4oJgefAYN4k, 3_eutZExN2c, 5K72RRDBN5U, 88CgS9anXJs),
  Oj5rYPqpldg chadkatter, inm7KvllVu0 trout, QrKIKcYN5m4: SKIPPED on purpose, every one of them is a line in BLURRY_SPRITES.md,
  which the two blurry agents own (avoids two agents on one file). Ready-made fog fix for them: the a8 fog square of
  https://i.ytimg.com/vi/4EIPARnGSSU/maxres1.jpg (board x183-850, y28-695, 83.4px squares; a8 = x185-265,y30-110) is 81px
  vs the current 28px. Note the video's fog is one continuous cloud texture over the board, not a repeated tile.
- CxtttdnwNWk cu tokens: still no clean source. Checked the dev's ArtStation "Chess Ultimate PFP Icons" (artstation.com/artwork/Ke6myy,
  Jesse Lugassy): 23 512px JPEG scene illustrations (2D, with backgrounds, no licence), not the 3D in-game tokens. Left as is.
- t61xLLQbotM magnus: unchanged (see art_audit_todo q4).
- Next step if resumed: nothing in my scope left except cu tokens (would need in-game renders, e.g. from a Steam/App Store screenshot at higher res).
