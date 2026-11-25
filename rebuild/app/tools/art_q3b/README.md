art-audit-q3b one-off fixes (2026-11-25). Inputs are YouTube thumbnails downloaded to the working dir
(https://i.ytimg.com/vi/<id>/maxresdefault.jpg | maxres1-3.jpg) and xiangqi.com help-page images.
- xq_disc.py <assets/modes/fUQXSj5jVUk>: chariot/cannon discs (line art from
  https://www.xiangqi.com/media/en/pages/help__pieces-and-moves/chariots.png and .../cannon.w1439.webp) on the set's flat disc;
  advisor_r/_b.png = the crowned-figure disc that was wired as the chariot (xiangqi.com advisor icon, see video frames maxres1).
- gab.py out.png: d9oDfmcMJvA Gabriel statue keyed off the pink highlight square in d9oDfmcMJvA maxres1.jpg (crop 250,320,500,560).
- mag2.py fR_maxresdefault.jpg out.png: fRZmYTwLE54 magnet recut from the maxresdefault thumbnail.
- ek.py <png> <r>: keep the largest opaque component (+ pixels within r px of it); electric_king r=12, toaster/thought r=0.
- pa.py <png...>: paint the white UI arrow tip out of passant_ai.png's left edge.
- Chaturaji boats mZUViBNWt6E/boat_*.png = copies of oGP4TUDjSVk/boat_*.png (same chess.com art, recut by art-audit-q4).
- f4O--Ai7B9A opp2.png = d3sspair's chess.com avatar (96px original upload, identical art):
  https://images.chesscomfiles.com/uploads/v1/user/206219591.ce3f254d.200x200o.509ab9f1f150.jpeg (copy in research/frames/sprites_web/);
  opp1.png = inner avatar from maxres1 (923,30,974,81) without the chess.com frame (full username unknown, no hi-res copy).
