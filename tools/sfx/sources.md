# SFX sources

Every Chess Master sound effect is built by `make_sfx.py` from the short clips in `sources/`, all of them
**CC0 1.0 (public domain dedication)** recordings, plus noise risers, sine sub booms and thumps that `cine.py`
synthesises itself (filtered noise and sine waves, no instrument leads). Nothing here needs attribution, but we
credit everyone anyway. The clips were cut, folded to mono 44.1 kHz and stored as Ogg Vorbis q5 by
`prepare_sources.py` (start / length below); `sources.sha256` holds their checksums. All further processing (pitch,
EQ, layering, transient shaping, multiband compression, stereo width, plate reverb, loudness / true-peak mastering)
happens in `cine.py`, `core.py` and `modes.py`. Only clips the generator actually uses are kept here.

## Libraries

| Library | Licence (verified) | Where |
|---|---|---|
| Kenney — Impact Sounds, RPG Audio, Casino Audio, UI Audio | CC0 1.0 (pack pages + `License.txt` in each zip) | https://kenney.nl/assets |
| VCSL — Versilian Community Sample Library (Versilian Studios, Sam Gossner) | CC0 1.0 (repository licence) | https://github.com/sgossner/VCSL |
| VSCO 2 Community Edition (Versilian Studios, Sam Gossner): cello / viola / violin section sustains, timpani | CC0 1.0 (repository licence, GitHub reports `cc0-1.0`) | https://github.com/sgossner/VSCO-2-CE |
| Freesound — individual sounds listed below, each marked CC0 1.0 on its page (HQ previews used) | CC0 1.0 | https://freesound.org |

Freesound authors: acidsnowflake, AmishRob, analogchill, AudioPapkin, Bidone, elonen, florianreichelt, Jofae, kintana24, LeMudCrab, michorvath, Mikes-MultiMedia, newagesoup, qubodup, Qvantor, spookymodem, tommccann, unfa, vlammenos.

Not used: the Sonniss #GameAudioGDC bundles are royalty-free for use in games, but their licence forbids supplying
the sounds "as sound effects", original or edited (https://sonniss.com/gameaudiogdc FAQ,
https://sonniss.com/gdc-bundle-license). This open repo ships its source clips, so nothing from them is included.

## Clips

| Clip | Source | Cut |
|---|---|---|
| `fs163453_crossbow.ogg` | Freesound #163453 “Crossbow Shot by LeMudCrab” — https://freesound.org/people/LeMudCrab/sounds/163453/ | 0s to end |
| `fs189779_boom.ogg` | Freesound #189779 “Big Boom by unfa” — https://freesound.org/people/unfa/sounds/189779/ | 0s +3s |
| `fs202092_chest.ogg` | Freesound #202092 “Chest Opening.wav by spookymodem” — https://freesound.org/people/spookymodem/sounds/202092/ | 0s +2.6s |
| `fs235968_explosion.ogg` | Freesound #235968 “Explosion_01.wav by tommccann” — https://freesound.org/people/tommccann/sounds/235968/ | 0.3s +3.6s |
| `fs348243_punch.ogg` | Freesound #348243 “PUNCH-BOXING-02.wav by newagesoup” — https://freesound.org/people/newagesoup/sounds/348243/ | 0s +0.3s |
| `fs35716_scream.ogg` | Freesound #35716 “scream.wav by analogchill” — https://freesound.org/people/analogchill/sounds/35716/ | 1.55s +2.2s |
| `fs402789_pistol_indoor.ogg` | Freesound #402789 “Small pistol gunshot indoors by acidsnowflake” — https://freesound.org/people/acidsnowflake/sounds/402789/ | 1.25s +1.2s |
| `fs408141_lowimpact.ogg` | Freesound #408141 “Cinematic Low Pitch Impact by Jofae” — https://freesound.org/people/Jofae/sounds/408141/ | 0s +2.2s |
| `fs418509_quack.ogg` | Freesound #418509 “single quack from a duck by Mikes-MultiMedia” — https://freesound.org/people/Mikes-MultiMedia/sounds/418509/ | 0s to end |
| `fs423990_horn.ogg` | Freesound #423990 “Car horn beep beep two beeps honk honk by AmishRob” — https://freesound.org/people/AmishRob/sounds/423990/ | 0s to end |
| `fs427592_pistol.ogg` | Freesound #427592 “9mm pistol shot by michorvath” — https://freesound.org/people/michorvath/sounds/427592/ | 0s +1.1s |
| `fs427595_shotgun.ogg` | Freesound #427595 “20 gauge shotgun gunshot by michorvath” — https://freesound.org/people/michorvath/sounds/427595/ | 0s +1.3s |
| `fs430977_impact.ogg` | Freesound #430977 “Big impact.wav by AudioPapkin” — https://freesound.org/people/AudioPapkin/sounds/430977/ | 0s +2.6s |
| `fs45650_fuse.ogg` | Freesound #45650 “fuse_burning_48khz.wav by elonen” — https://freesound.org/people/elonen/sounds/45650/ | 1s +1.6s |
| `fs478934_laugh.ogg` | Freesound #478934 “evil laugh.wav by kintana24” — https://freesound.org/people/kintana24/sounds/478934/ | 0s to end |
| `fs52906_siren.ogg` | Freesound #52906 “police siren.wav by vlammenos” — https://freesound.org/people/vlammenos/sounds/52906/ | 2s +2.4s |
| `fs60013_whoosh.ogg` | Freesound #60013 “Whoosh by qubodup” — https://freesound.org/people/qubodup/sounds/60013/ | 0s to end |
| `fs683101_whoosh.ogg` | Freesound #683101 “quick woosh by florianreichelt” — https://freesound.org/people/florianreichelt/sounds/683101/ | 0.1s +0.6s |
| `fs69570_lion.ogg` | Freesound #69570 “Lion loud.mp3 by Bidone” — https://freesound.org/people/Bidone/sounds/69570/ | 30.6s +2.2s |
| `fs743246_stone.ogg` | Freesound #743246 “Move Stone Rune 4 by qubodup” — https://freesound.org/people/qubodup/sounds/743246/ | 0s to end |
| `fs877966_revswell.ogg` | Freesound #877966 “Reverse Swell 2.5s by Qvantor” — https://freesound.org/people/Qvantor/sounds/877966/ | 0.8s +1.45s |
| `k_book_flip_2.ogg` | Kenney, *RPG Audio* — `bookFlip2.ogg` (https://kenney.nl/assets/rpg-audio) | 0s to end |
| `k_card_place_1.ogg` | Kenney, *Casino Audio* — `card-place-1.ogg` (https://kenney.nl/assets/casino-audio) | 0s to end |
| `k_card_slide_2.ogg` | Kenney, *Casino Audio* — `card-slide-2.ogg` (https://kenney.nl/assets/casino-audio) | 0s to end |
| `k_chip_lay_1.ogg` | Kenney, *Casino Audio* — `chip-lay-1.ogg` (https://kenney.nl/assets/casino-audio) | 0s to end |
| `k_chip_lay_3.ogg` | Kenney, *Casino Audio* — `chip-lay-3.ogg` (https://kenney.nl/assets/casino-audio) | 0s to end |
| `k_chips_collide_2.ogg` | Kenney, *Casino Audio* — `chips-collide-2.ogg` (https://kenney.nl/assets/casino-audio) | 0s to end |
| `k_chips_handle_1.ogg` | Kenney, *Casino Audio* — `chips-handle-1.ogg` (https://kenney.nl/assets/casino-audio) | 0s to end |
| `k_chop.ogg` | Kenney, *RPG Audio* — `chop.ogg` (https://kenney.nl/assets/rpg-audio) | 0s to end |
| `k_cloth_2.ogg` | Kenney, *RPG Audio* — `cloth2.ogg` (https://kenney.nl/assets/rpg-audio) | 0s to end |
| `k_cloth_4.ogg` | Kenney, *RPG Audio* — `cloth4.ogg` (https://kenney.nl/assets/rpg-audio) | 0s to end |
| `k_dice_throw_1.ogg` | Kenney, *Casino Audio* — `dice-throw-1.ogg` (https://kenney.nl/assets/casino-audio) | 0s to end |
| `k_footstep_carpet_2.ogg` | Kenney, *Impact Sounds* — `footstep_carpet_002.ogg` (https://kenney.nl/assets/impact-sounds) | 0s to end |
| `k_footstep_wood_1.ogg` | Kenney, *Impact Sounds* — `footstep_wood_001.ogg` (https://kenney.nl/assets/impact-sounds) | 0s to end |
| `k_knife_slice_1.ogg` | Kenney, *RPG Audio* — `knifeSlice.ogg` (https://kenney.nl/assets/rpg-audio) | 0s to end |
| `k_metal_click.ogg` | Kenney, *RPG Audio* — `metalClick.ogg` (https://kenney.nl/assets/rpg-audio) | 0s to end |
| `k_metal_latch.ogg` | Kenney, *RPG Audio* — `metalLatch.ogg` (https://kenney.nl/assets/rpg-audio) | 0s to end |
| `k_plank_1.ogg` | Kenney, *Impact Sounds* — `impactPlank_medium_001.ogg` (https://kenney.nl/assets/impact-sounds) | 0s +0.5s |
| `k_plank_3.ogg` | Kenney, *Impact Sounds* — `impactPlank_medium_003.ogg` (https://kenney.nl/assets/impact-sounds) | 0s +0.4s |
| `k_punch_medium_0.ogg` | Kenney, *Impact Sounds* — `impactPunch_medium_000.ogg` (https://kenney.nl/assets/impact-sounds) | 0s to end |
| `k_soft_heavy_0.ogg` | Kenney, *Impact Sounds* — `impactSoft_heavy_000.ogg` (https://kenney.nl/assets/impact-sounds) | 0s to end |
| `k_ui_click_3.ogg` | Kenney, *UI Audio* — `click3.ogg` (https://kenney.nl/assets/ui-audio) | 0s to end |
| `k_wood_light_0.ogg` | Kenney, *Impact Sounds* — `impactWood_light_000.ogg` (https://kenney.nl/assets/impact-sounds) | 0s to end |
| `k_wood_light_1.ogg` | Kenney, *Impact Sounds* — `impactWood_light_001.ogg` (https://kenney.nl/assets/impact-sounds) | 0s to end |
| `k_wood_light_2.ogg` | Kenney, *Impact Sounds* — `impactWood_light_002.ogg` (https://kenney.nl/assets/impact-sounds) | 0s to end |
| `k_wood_light_3.ogg` | Kenney, *Impact Sounds* — `impactWood_light_003.ogg` (https://kenney.nl/assets/impact-sounds) | 0s to end |
| `k_wood_light_4.ogg` | Kenney, *Impact Sounds* — `impactWood_light_004.ogg` (https://kenney.nl/assets/impact-sounds) | 0s to end |
| `k_wood_medium_0.ogg` | Kenney, *Impact Sounds* — `impactWood_medium_000.ogg` (https://kenney.nl/assets/impact-sounds) | 0s to end |
| `k_wood_medium_2.ogg` | Kenney, *Impact Sounds* — `impactWood_medium_002.ogg` (https://kenney.nl/assets/impact-sounds) | 0s to end |
| `v_framedrum_muted.ogg` | VCSL (Versilian Studios / Sam Gossner) — `HDrumL_HitMuted_v2_rr1_Sum.wav` (https://github.com/sgossner/VCSL) | 0s to end |
| `v_organ_A3.ogg` | VCSL (Versilian Studios / Sam Gossner) — `NT5_Man3Quiet_A3_rr1.wav` (https://github.com/sgossner/VCSL) | 0s +7s |
| `v_organ_C2.ogg` | VCSL (Versilian Studios / Sam Gossner) — `NT5_Man3Quiet_C2_rr1.wav` (https://github.com/sgossner/VCSL) | 0s +7s |
| `v_organ_C3.ogg` | VCSL (Versilian Studios / Sam Gossner) — `NT5_Man3Quiet_C3_rr1.wav` (https://github.com/sgossner/VCSL) | 0s +7s |
| `v_organ_D#2.ogg` | VCSL (Versilian Studios / Sam Gossner) — `NT5_Man3Quiet_D#2_rr1.wav` (https://github.com/sgossner/VCSL) | 0s +7s |
| `v_organ_D#3.ogg` | VCSL (Versilian Studios / Sam Gossner) — `NT5_Man3Quiet_D#3_rr1.wav` (https://github.com/sgossner/VCSL) | 0s +7s |
| `v_organ_F#2.ogg` | VCSL (Versilian Studios / Sam Gossner) — `NT5_Man3Quiet_F#2_rr1.wav` (https://github.com/sgossner/VCSL) | 0s +7s |
| `v_organ_F#3.ogg` | VCSL (Versilian Studios / Sam Gossner) — `NT5_Man3Quiet_F#3_rr1.wav` (https://github.com/sgossner/VCSL) | 0s +7s |
| `v_woodblock_mp.ogg` | VCSL (Versilian Studios / Sam Gossner) — `wood_click_mp.wav` (https://github.com/sgossner/VCSL) | 0s to end |
| `v_woodblock_pp.ogg` | VCSL (Versilian Studios / Sam Gossner) — `wood_click_pp_rr1.wav` (https://github.com/sgossner/VCSL) | 0s to end |
| `vs_cello_A3.ogg` | VSCO 2 Community Edition (Versilian Studios / Sam Gossner) — `Strings/Cello Section/susvib/susvib_A2_v1_1.wav` (https://github.com/sgossner/VSCO-2-CE) | 0s +4.5s |
| `vs_cello_B4.ogg` | VSCO 2 Community Edition (Versilian Studios / Sam Gossner) — `Strings/Cello Section/susvib/susvib_B3_v1_1.wav` (https://github.com/sgossner/VSCO-2-CE) | 0s +4.5s |
| `vs_cello_C4.ogg` | VSCO 2 Community Edition (Versilian Studios / Sam Gossner) — `Strings/Cello Section/susvib/susvib_C3_v1_1.wav` (https://github.com/sgossner/VSCO-2-CE) | 0s +4.5s |
| `vs_cello_D3.ogg` | VSCO 2 Community Edition (Versilian Studios / Sam Gossner) — `Strings/Cello Section/susvib/susvib_D2_v1_1.wav` (https://github.com/sgossner/VSCO-2-CE) | 0s +4.5s |
| `vs_cello_E4.ogg` | VSCO 2 Community Edition (Versilian Studios / Sam Gossner) — `Strings/Cello Section/susvib/susvib_E3_v1_1.wav` (https://github.com/sgossner/VSCO-2-CE) | 0s +4.5s |
| `vs_cello_F3.ogg` | VSCO 2 Community Edition (Versilian Studios / Sam Gossner) — `Strings/Cello Section/susvib/susvib_F2_v1_1.wav` (https://github.com/sgossner/VSCO-2-CE) | 0s +4.5s |
| `vs_cello_G4.ogg` | VSCO 2 Community Edition (Versilian Studios / Sam Gossner) — `Strings/Cello Section/susvib/susvib_G3_v1_1.wav` (https://github.com/sgossner/VSCO-2-CE) | 0s +4.5s |
| `vs_timpani_lo.ogg` | VSCO 2 Community Edition (Versilian Studios / Sam Gossner) — `Percussion/Timpani/Timpani2_Hit_v4_rr1_Sum.wav` (https://github.com/sgossner/VSCO-2-CE) | 0s +3s |
| `vs_viola_A4.ogg` | VSCO 2 Community Edition (Versilian Studios / Sam Gossner) — `Strings/Viola Section/susvib/ViolaEns_susvib_A3_v1_1.wav` (https://github.com/sgossner/VSCO-2-CE) | 0s +4.5s |
| `vs_viola_C5.ogg` | VSCO 2 Community Edition (Versilian Studios / Sam Gossner) — `Strings/Viola Section/susvib/ViolaEns_susvib_C4_v1_1.wav` (https://github.com/sgossner/VSCO-2-CE) | 0s +4.5s |
| `vs_viola_F4.ogg` | VSCO 2 Community Edition (Versilian Studios / Sam Gossner) — `Strings/Viola Section/susvib/ViolaEns_susvib_F3_v1_1.wav` (https://github.com/sgossner/VSCO-2-CE) | 0s +4.5s |
| `vs_violin_C5.ogg` | VSCO 2 Community Edition (Versilian Studios / Sam Gossner) — `Strings/Violin Section/susVib/VlnEns_susVib_C4_v1.wav` (https://github.com/sgossner/VSCO-2-CE) | 0s +4.5s |
| `vs_violin_E5.ogg` | VSCO 2 Community Edition (Versilian Studios / Sam Gossner) — `Strings/Violin Section/susVib/VlnEns_susVib_E4_v1.wav` (https://github.com/sgossner/VSCO-2-CE) | 0s +4.5s |
