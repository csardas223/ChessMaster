# SFX sources

Every Chess Master sound effect is built by `make_sfx.py` from the short clips in `sources/`, all of them
**CC0 1.0 (public domain dedication)** recordings. Nothing here needs attribution, but we credit everyone anyway.
The clips were cut, folded to mono 44.1 kHz and stored as Ogg Vorbis q5 by `prepare_sources.py`
(start / length below); `sources.sha256` holds their checksums. All further processing (pitch, EQ, layering,
saturation, rooms, loudness) happens in `samples.py`, `core.py` and `modes.py`.

## Libraries

| Library | Licence (verified) | Where |
|---|---|---|
| Kenney — Impact Sounds, RPG Audio, Casino Audio, Interface Sounds, UI Audio | CC0 1.0 (pack pages + `License.txt` in each zip) | https://kenney.nl/assets |
| VCSL — Versilian Community Sample Library (Versilian Studios, Sam Gossner) | CC0 1.0 (repository licence) | https://github.com/sgossner/VCSL |
| Freesound — individual sounds listed below, each marked CC0 1.0 on its page (HQ previews used) | CC0 1.0 | https://freesound.org |

Freesound authors: acidsnowflake, AmishRob, analogchill, Bidone, elonen, florianreichelt, Jace, kintana24, LeMudCrab, michorvath, Mikes-MultiMedia, qubodup, rhapsodize, spookymodem, tommccann, unfa, vlammenos.

## Clips

| Clip | Source | Cut |
|---|---|---|
| `fs163453_crossbow.ogg` | Freesound #163453 “Crossbow Shot by LeMudCrab” — https://freesound.org/people/LeMudCrab/sounds/163453/ | 0s to end |
| `fs17502_coin.ogg` | Freesound #17502 “Coin dropping.wav by Jace” — https://freesound.org/people/Jace/sounds/17502/ | 0s to end |
| `fs202092_chest.ogg` | Freesound #202092 “Chest Opening.wav by spookymodem” — https://freesound.org/people/spookymodem/sounds/202092/ | 0s +2.6s |
| `fs221528_glass_break.ogg` | Freesound #221528 “Glass Break by unfa” — https://freesound.org/people/unfa/sounds/221528/ | 0s to end |
| `fs235968_explosion.ogg` | Freesound #235968 “Explosion_01.wav by tommccann” — https://freesound.org/people/tommccann/sounds/235968/ | 0.3s +3.6s |
| `fs255111_boom.ogg` | Freesound #255111 “Cinematic_Boom_Rhapsodize.wav by rhapsodize” — https://freesound.org/people/rhapsodize/sounds/255111/ | 0s +3.2s |
| `fs349698_slow_swoosh.ogg` | Freesound #349698 “light slow swoosh.mp3 by Mikes-MultiMedia” — https://freesound.org/people/Mikes-MultiMedia/sounds/349698/ | 0.25s +1.8s |
| `fs35716_scream.ogg` | Freesound #35716 “scream.wav by analogchill” — https://freesound.org/people/analogchill/sounds/35716/ | 1.55s +2.2s |
| `fs402789_pistol_indoor.ogg` | Freesound #402789 “Small pistol gunshot indoors by acidsnowflake” — https://freesound.org/people/acidsnowflake/sounds/402789/ | 1.25s +1.2s |
| `fs418509_quack.ogg` | Freesound #418509 “single quack from a duck by Mikes-MultiMedia” — https://freesound.org/people/Mikes-MultiMedia/sounds/418509/ | 0s to end |
| `fs423990_horn.ogg` | Freesound #423990 “Car horn beep beep two beeps honk honk by AmishRob” — https://freesound.org/people/AmishRob/sounds/423990/ | 0s to end |
| `fs427592_pistol.ogg` | Freesound #427592 “9mm pistol shot by michorvath” — https://freesound.org/people/michorvath/sounds/427592/ | 0s +1.1s |
| `fs427595_shotgun.ogg` | Freesound #427595 “20 gauge shotgun gunshot by michorvath” — https://freesound.org/people/michorvath/sounds/427595/ | 0s +1.3s |
| `fs45650_fuse.ogg` | Freesound #45650 “fuse_burning_48khz.wav by elonen” — https://freesound.org/people/elonen/sounds/45650/ | 1s +1.6s |
| `fs478934_laugh.ogg` | Freesound #478934 “evil laugh.wav by kintana24” — https://freesound.org/people/kintana24/sounds/478934/ | 0s to end |
| `fs52906_siren.ogg` | Freesound #52906 “police siren.wav by vlammenos” — https://freesound.org/people/vlammenos/sounds/52906/ | 2s +2.4s |
| `fs60013_whoosh.ogg` | Freesound #60013 “Whoosh by qubodup” — https://freesound.org/people/qubodup/sounds/60013/ | 0s to end |
| `fs683101_whoosh.ogg` | Freesound #683101 “quick woosh by florianreichelt” — https://freesound.org/people/florianreichelt/sounds/683101/ | 0.1s +0.6s |
| `fs69570_lion.ogg` | Freesound #69570 “Lion loud.mp3 by Bidone” — https://freesound.org/people/Bidone/sounds/69570/ | 30.6s +2.2s |
| `fs743246_stone.ogg` | Freesound #743246 “Move Stone Rune 4 by qubodup” — https://freesound.org/people/qubodup/sounds/743246/ | 0s to end |
| `k_card_slide_2.ogg` | Kenney, *Casino Audio* — `card-slide-2.ogg` (https://kenney.nl/assets/casino-audio) | 0s to end |
| `k_chip_lay_1.ogg` | Kenney, *Casino Audio* — `chip-lay-1.ogg` (https://kenney.nl/assets/casino-audio) | 0s to end |
| `k_chip_lay_3.ogg` | Kenney, *Casino Audio* — `chip-lay-3.ogg` (https://kenney.nl/assets/casino-audio) | 0s to end |
| `k_chips_collide_2.ogg` | Kenney, *Casino Audio* — `chips-collide-2.ogg` (https://kenney.nl/assets/casino-audio) | 0s to end |
| `k_chop.ogg` | Kenney, *RPG Audio* — `chop.ogg` (https://kenney.nl/assets/rpg-audio) | 0s to end |
| `k_cloth_2.ogg` | Kenney, *RPG Audio* — `cloth2.ogg` (https://kenney.nl/assets/rpg-audio) | 0s to end |
| `k_cloth_4.ogg` | Kenney, *RPG Audio* — `cloth4.ogg` (https://kenney.nl/assets/rpg-audio) | 0s to end |
| `k_coins.ogg` | Kenney, *RPG Audio* — `handleCoins.ogg` (https://kenney.nl/assets/rpg-audio) | 0s to end |
| `k_dice_throw_1.ogg` | Kenney, *Casino Audio* — `dice-throw-1.ogg` (https://kenney.nl/assets/casino-audio) | 0s to end |
| `k_footstep_carpet_2.ogg` | Kenney, *Impact Sounds* — `footstep_carpet_002.ogg` (https://kenney.nl/assets/impact-sounds) | 0s to end |
| `k_footstep_wood_1.ogg` | Kenney, *Impact Sounds* — `footstep_wood_001.ogg` (https://kenney.nl/assets/impact-sounds) | 0s to end |
| `k_if_glass_2.ogg` | Kenney, *Interface Sounds* — `glass_002.ogg` (https://kenney.nl/assets/interface-sounds) | 0s to end |
| `k_knife_slice_1.ogg` | Kenney, *RPG Audio* — `knifeSlice.ogg` (https://kenney.nl/assets/rpg-audio) | 0s to end |
| `k_metal_click.ogg` | Kenney, *RPG Audio* — `metalClick.ogg` (https://kenney.nl/assets/rpg-audio) | 0s to end |
| `k_metal_latch.ogg` | Kenney, *RPG Audio* — `metalLatch.ogg` (https://kenney.nl/assets/rpg-audio) | 0s to end |
| `k_mining_0.ogg` | Kenney, *Impact Sounds* — `impactMining_000.ogg` (https://kenney.nl/assets/impact-sounds) | 0s to end |
| `k_mining_2.ogg` | Kenney, *Impact Sounds* — `impactMining_002.ogg` (https://kenney.nl/assets/impact-sounds) | 0s to end |
| `k_plank_1.ogg` | Kenney, *Impact Sounds* — `impactPlank_medium_001.ogg` (https://kenney.nl/assets/impact-sounds) | 0s +0.5s |
| `k_plank_3.ogg` | Kenney, *Impact Sounds* — `impactPlank_medium_003.ogg` (https://kenney.nl/assets/impact-sounds) | 0s +0.4s |
| `k_punch_medium_0.ogg` | Kenney, *Impact Sounds* — `impactPunch_medium_000.ogg` (https://kenney.nl/assets/impact-sounds) | 0s to end |
| `k_soft_heavy_0.ogg` | Kenney, *Impact Sounds* — `impactSoft_heavy_000.ogg` (https://kenney.nl/assets/impact-sounds) | 0s to end |
| `k_soft_medium_1.ogg` | Kenney, *Impact Sounds* — `impactSoft_medium_001.ogg` (https://kenney.nl/assets/impact-sounds) | 0s to end |
| `k_soft_medium_3.ogg` | Kenney, *Impact Sounds* — `impactSoft_medium_003.ogg` (https://kenney.nl/assets/impact-sounds) | 0s to end |
| `k_ui_click_3.ogg` | Kenney, *UI Audio* — `click3.ogg` (https://kenney.nl/assets/ui-audio) | 0s to end |
| `k_wood_light_0.ogg` | Kenney, *Impact Sounds* — `impactWood_light_000.ogg` (https://kenney.nl/assets/impact-sounds) | 0s to end |
| `k_wood_light_1.ogg` | Kenney, *Impact Sounds* — `impactWood_light_001.ogg` (https://kenney.nl/assets/impact-sounds) | 0s to end |
| `k_wood_light_2.ogg` | Kenney, *Impact Sounds* — `impactWood_light_002.ogg` (https://kenney.nl/assets/impact-sounds) | 0s to end |
| `k_wood_light_3.ogg` | Kenney, *Impact Sounds* — `impactWood_light_003.ogg` (https://kenney.nl/assets/impact-sounds) | 0s to end |
| `k_wood_light_4.ogg` | Kenney, *Impact Sounds* — `impactWood_light_004.ogg` (https://kenney.nl/assets/impact-sounds) | 0s to end |
| `k_wood_medium_0.ogg` | Kenney, *Impact Sounds* — `impactWood_medium_000.ogg` (https://kenney.nl/assets/impact-sounds) | 0s to end |
| `k_wood_medium_2.ogg` | Kenney, *Impact Sounds* — `impactWood_medium_002.ogg` (https://kenney.nl/assets/impact-sounds) | 0s to end |
| `v_bassdrum.ogg` | VCSL (Versilian Studios / Sam Gossner) — `BDrumNew_hit_v5_rr1_Sum.wav` (https://github.com/sgossner/VCSL) | 0s to end |
| `v_chime_A4.ogg` | VCSL (Versilian Studios / Sam Gossner) — `sus_A4_r01_main.wav` (https://github.com/sgossner/VCSL) | 0s +4s |
| `v_chime_C5.ogg` | VCSL (Versilian Studios / Sam Gossner) — `sus_C5_r01_main.wav` (https://github.com/sgossner/VCSL) | 0s +4s |
| `v_chime_E5.ogg` | VCSL (Versilian Studios / Sam Gossner) — `sus_E5_r01_main.wav` (https://github.com/sgossner/VCSL) | 0s +4s |
| `v_chime_G#4.ogg` | VCSL (Versilian Studios / Sam Gossner) — `sus_G#4_r01_main.wav` (https://github.com/sgossner/VCSL) | 0s +4s |
| `v_cymbal_swell.ogg` | VCSL (Versilian Studios / Sam Gossner) — `susCymb1_cresc_2s.wav` (https://github.com/sgossner/VCSL) | 0s to end |
| `v_framedrum_muted.ogg` | VCSL (Versilian Studios / Sam Gossner) — `HDrumL_HitMuted_v2_rr1_Sum.wav` (https://github.com/sgossner/VCSL) | 0s to end |
| `v_glass_A#4.ogg` | VCSL (Versilian Studios / Sam Gossner) — `glass3_A#4_Slow_1_Main.wav` (https://github.com/sgossner/VCSL) | 0s +6s |
| `v_glass_D#4.ogg` | VCSL (Versilian Studios / Sam Gossner) — `glass1_D#4_Slow_1_Main.wav` (https://github.com/sgossner/VCSL) | 0s +6s |
| `v_glass_D5.ogg` | VCSL (Versilian Studios / Sam Gossner) — `glass4_D5_Slow_2_Main.wav` (https://github.com/sgossner/VCSL) | 0s +6s |
| `v_glass_F#4.ogg` | VCSL (Versilian Studios / Sam Gossner) — `glass2_F#4_Slow_1_Main.wav` (https://github.com/sgossner/VCSL) | 0s +6s |
| `v_glock_C6.ogg` | VCSL (Versilian Studios / Sam Gossner) — `glock_soft_C6_01.wav` (https://github.com/sgossner/VCSL) | 0s +2.5s |
| `v_glock_G5.ogg` | VCSL (Versilian Studios / Sam Gossner) — `glock_soft_G5_01.wav` (https://github.com/sgossner/VCSL) | 0s +2.5s |
| `v_gong_p.ogg` | VCSL (Versilian Studios / Sam Gossner) — `gong_p.wav` (https://github.com/sgossner/VCSL) | 0s +6s |
| `v_kalimba_D#4.ogg` | VCSL (Versilian Studios / Sam Gossner) — `MBira3_pluck_Main_D#4_k20_50_100_rr2.wav` (https://github.com/sgossner/VCSL) | 0s +2.5s |
| `v_kalimba_G4.ogg` | VCSL (Versilian Studios / Sam Gossner) — `MBira3_pluck_Main_G4_k22_50_100_rr2.wav` (https://github.com/sgossner/VCSL) | 0s +2.5s |
| `v_marktree_down.ogg` | VCSL (Versilian Studios / Sam Gossner) — `windchimes_desc1.wav` (https://github.com/sgossner/VCSL) | 0s to end |
| `v_marktree_up.ogg` | VCSL (Versilian Studios / Sam Gossner) — `windchimes_slowAsc1.wav` (https://github.com/sgossner/VCSL) | 0s to end |
| `v_organ_A3.ogg` | VCSL (Versilian Studios / Sam Gossner) — `NT5_Man3Quiet_A3_rr1.wav` (https://github.com/sgossner/VCSL) | 0s +7s |
| `v_organ_C2.ogg` | VCSL (Versilian Studios / Sam Gossner) — `NT5_Man3Quiet_C2_rr1.wav` (https://github.com/sgossner/VCSL) | 0s +7s |
| `v_organ_C3.ogg` | VCSL (Versilian Studios / Sam Gossner) — `NT5_Man3Quiet_C3_rr1.wav` (https://github.com/sgossner/VCSL) | 0s +7s |
| `v_organ_D#2.ogg` | VCSL (Versilian Studios / Sam Gossner) — `NT5_Man3Quiet_D#2_rr1.wav` (https://github.com/sgossner/VCSL) | 0s +7s |
| `v_organ_D#3.ogg` | VCSL (Versilian Studios / Sam Gossner) — `NT5_Man3Quiet_D#3_rr1.wav` (https://github.com/sgossner/VCSL) | 0s +7s |
| `v_organ_F#2.ogg` | VCSL (Versilian Studios / Sam Gossner) — `NT5_Man3Quiet_F#2_rr1.wav` (https://github.com/sgossner/VCSL) | 0s +7s |
| `v_organ_F#3.ogg` | VCSL (Versilian Studios / Sam Gossner) — `NT5_Man3Quiet_F#3_rr1.wav` (https://github.com/sgossner/VCSL) | 0s +7s |
| `v_piano_C2.ogg` | VCSL (Versilian Studios / Sam Gossner) — `Upright1_Sus_C2_vl1_rr1.wav` (https://github.com/sgossner/VCSL) | 0s +5s |
| `v_piano_C3.ogg` | VCSL (Versilian Studios / Sam Gossner) — `Upright1_Sus_C3_vl1_rr1.wav` (https://github.com/sgossner/VCSL) | 0s +5s |
| `v_piano_C4.ogg` | VCSL (Versilian Studios / Sam Gossner) — `Upright1_Sus_C4_vl1_rr1.wav` (https://github.com/sgossner/VCSL) | 0s +5s |
| `v_piano_C5.ogg` | VCSL (Versilian Studios / Sam Gossner) — `Upright1_Sus_C5_vl1_rr1.wav` (https://github.com/sgossner/VCSL) | 0s +4s |
| `v_piano_G3.ogg` | VCSL (Versilian Studios / Sam Gossner) — `Upright1_Sus_G3_vl1_rr1.wav` (https://github.com/sgossner/VCSL) | 0s +5s |
| `v_piano_G4.ogg` | VCSL (Versilian Studios / Sam Gossner) — `Upright1_Sus_G4_vl1_rr1.wav` (https://github.com/sgossner/VCSL) | 0s +4s |
| `v_timpani.ogg` | VCSL (Versilian Studios / Sam Gossner) — `Timpani1_Hit_v2_rr1_Sum.wav` (https://github.com/sgossner/VCSL) | 0s +3s |
| `v_vibes_A4.ogg` | VCSL (Versilian Studios / Sam Gossner) — `Vibes_soft_A4_v1_rr1_Main.wav` (https://github.com/sgossner/VCSL) | 0s +3.5s |
| `v_vibes_C5.ogg` | VCSL (Versilian Studios / Sam Gossner) — `Vibes_soft_C5_v1_rr1_Main.wav` (https://github.com/sgossner/VCSL) | 0s +3s |
| `v_vibes_D4.ogg` | VCSL (Versilian Studios / Sam Gossner) — `Vibes_soft_D4_v1_rr1_Main.wav` (https://github.com/sgossner/VCSL) | 0s +3.5s |
| `v_vibes_E5.ogg` | VCSL (Versilian Studios / Sam Gossner) — `Vibes_soft_E5_v1_rr1_Main.wav` (https://github.com/sgossner/VCSL) | 0s +3s |
| `v_woodblock_mp.ogg` | VCSL (Versilian Studios / Sam Gossner) — `wood_click_mp.wav` (https://github.com/sgossner/VCSL) | 0s to end |
| `v_woodblock_pp.ogg` | VCSL (Versilian Studios / Sam Gossner) — `wood_click_pp_rr1.wav` (https://github.com/sgossner/VCSL) | 0s to end |
