"""Cut the small CC0 source clips in tools/sfx/sources/ from the original downloads.

You only need this to re-derive the clips; make_sfx.py reads tools/sfx/sources/ directly.
Usage:  python3 tools/sfx/prepare_sources.py <raw-cache-dir>

<raw-cache-dir> must hold the original downloads, laid out as:
  kenney/<pack>/Audio/<file>.ogg   Kenney packs (kenney.nl/assets/<pack>), CC0 1.0
  vcsl/<file>.wav                  Versilian Community Sample Library (github.com/sgossner/VCSL), CC0 1.0
  vsco/<file>.wav                  VSCO 2 Community Edition (github.com/sgossner/VSCO-2-CE), CC0 1.0
  freesound/<id>.mp3               Freesound HQ previews (freesound.org/s/<id>/), each CC0 1.0
Every clip is cut to the part we use, folded to mono 44.1 kHz and stored as Ogg Vorbis (q5).
Provenance for every clip is in sources.md; sha256 of each clip is in sources.sha256.
"""
import os, sys, subprocess, hashlib

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'sources')

# out name: (raw path under cache, start s, duration s or None for the rest)
K = 'kenney/'
CLIPS = {
    # ---- Kenney Impact Sounds (CC0)
    'k_wood_light_0': (K + 'impact-sounds/Audio/impactWood_light_000.ogg', 0, None),
    'k_wood_light_1': (K + 'impact-sounds/Audio/impactWood_light_001.ogg', 0, None),
    'k_wood_light_2': (K + 'impact-sounds/Audio/impactWood_light_002.ogg', 0, None),
    'k_wood_light_3': (K + 'impact-sounds/Audio/impactWood_light_003.ogg', 0, None),
    'k_wood_light_4': (K + 'impact-sounds/Audio/impactWood_light_004.ogg', 0, None),
    'k_wood_medium_0': (K + 'impact-sounds/Audio/impactWood_medium_000.ogg', 0, None),
    'k_wood_medium_2': (K + 'impact-sounds/Audio/impactWood_medium_002.ogg', 0, None),
    'k_soft_heavy_0': (K + 'impact-sounds/Audio/impactSoft_heavy_000.ogg', 0, None),
    'k_plank_1': (K + 'impact-sounds/Audio/impactPlank_medium_001.ogg', 0, 0.5),
    'k_plank_3': (K + 'impact-sounds/Audio/impactPlank_medium_003.ogg', 0, 0.4),
    'k_punch_medium_0': (K + 'impact-sounds/Audio/impactPunch_medium_000.ogg', 0, None),
    'k_footstep_wood_1': (K + 'impact-sounds/Audio/footstep_wood_001.ogg', 0, None),
    'k_footstep_carpet_2': (K + 'impact-sounds/Audio/footstep_carpet_002.ogg', 0, None),
    # ---- Kenney RPG Audio (CC0)
    'k_cloth_2': (K + 'rpg-audio/Audio/cloth2.ogg', 0, None),
    'k_cloth_4': (K + 'rpg-audio/Audio/cloth4.ogg', 0, None),
    'k_knife_slice_1': (K + 'rpg-audio/Audio/knifeSlice.ogg', 0, None),
    'k_metal_click': (K + 'rpg-audio/Audio/metalClick.ogg', 0, None),
    'k_metal_latch': (K + 'rpg-audio/Audio/metalLatch.ogg', 0, None),
    'k_chop': (K + 'rpg-audio/Audio/chop.ogg', 0, None),
    'k_book_flip_2': (K + 'rpg-audio/Audio/bookFlip2.ogg', 0, None),
    # ---- Kenney Casino Audio (CC0)
    'k_chip_lay_1': (K + 'casino-audio/Audio/chip-lay-1.ogg', 0, None),
    'k_chip_lay_3': (K + 'casino-audio/Audio/chip-lay-3.ogg', 0, None),
    'k_chips_collide_2': (K + 'casino-audio/Audio/chips-collide-2.ogg', 0, None),
    'k_card_slide_2': (K + 'casino-audio/Audio/card-slide-2.ogg', 0, None),
    'k_dice_throw_1': (K + 'casino-audio/Audio/dice-throw-1.ogg', 0, None),
    'k_card_place_1': (K + 'casino-audio/Audio/card-place-1.ogg', 0, None),
    'k_chips_handle_1': (K + 'casino-audio/Audio/chips-handle-1.ogg', 0, None),
    # ---- Kenney Interface Sounds / UI Audio (CC0)
    'k_ui_click_3': (K + 'ui-audio/Audio/click3.ogg', 0, None),
    # ---- VCSL (CC0)
    'v_woodblock_pp': ('vcsl/wood_click_pp_rr1.wav', 0, None),
    'v_woodblock_mp': ('vcsl/wood_click_mp.wav', 0, None),
    'v_framedrum_muted': ('vcsl/HDrumL_HitMuted_v2_rr1_Sum.wav', 0, None),
}
for n in ('C2', 'D#2', 'F#2', 'C3', 'D#3', 'F#3', 'A3'):
    CLIPS['v_organ_' + n] = ('vcsl/NT5_Man3Quiet_%s_rr1.wav' % n, 0, 7.0)
# ---- VSCO 2 CE (CC0): string-section sustains for the warm pads, timpani. VSCO names sound an octave higher
# than written (susvib_C3 sounds C4 = 262 Hz), so clips are named by their sounding pitch.
for out, f in [('vs_cello_D3', 'susvib_D2_v1_1'), ('vs_cello_F3', 'susvib_F2_v1_1'), ('vs_cello_A3', 'susvib_A2_v1_1'),
               ('vs_cello_C4', 'susvib_C3_v1_1'), ('vs_cello_E4', 'susvib_E3_v1_1'),
               ('vs_viola_F4', 'ViolaEns_susvib_F3_v1_1'), ('vs_viola_A4', 'ViolaEns_susvib_A3_v1_1'),
               ('vs_viola_C5', 'ViolaEns_susvib_C4_v1_1'),
               ('vs_violin_C5', 'VlnEns_susVib_C4_v1'), ('vs_violin_E5', 'VlnEns_susVib_E4_v1')]:
    CLIPS[out] = ('vsco/%s.wav' % f, 0, 4.5)
CLIPS['vs_timpani_lo'] = ('vsco/Timpani2_Hit_v4_rr1_Sum.wav', 0, 3.0)
# ---- Freesound (each CC0 1.0; see sources.md)
for out, fid, s, d in [
    ('fs418509_quack', 418509, 0, None), ('fs427592_pistol', 427592, 0, 1.1), ('fs402789_pistol_indoor', 402789, 1.25, 1.2),
    ('fs427595_shotgun', 427595, 0, 1.3), ('fs235968_explosion', 235968, 0.3, 3.6), ('fs423990_horn', 423990, 0, None), ('fs69570_lion', 69570, 30.6, 2.2), ('fs478934_laugh', 478934, 0, None),
    ('fs35716_scream', 35716, 1.55, 2.2), ('fs60013_whoosh', 60013, 0, None), ('fs683101_whoosh', 683101, 0.1, 0.6),
    ('fs45650_fuse', 45650, 1.0, 1.6),
    ('fs52906_siren', 52906, 2.0, 2.4), ('fs163453_crossbow', 163453, 0, None), ('fs743246_stone', 743246, 0, None),
    ('fs202092_chest', 202092, 0, 2.6),
    # v4 cinematic layers
    ('fs430977_impact', 430977, 0, 2.6), ('fs408141_lowimpact', 408141, 0, 2.2), ('fs348243_punch', 348243, 0, 0.3),
    ('fs189779_boom', 189779, 0, 3.0)]:
    CLIPS[out] = ('freesound/%d.mp3' % fid, s, d)

# ---- v5 additions: own layers per event (all CC0, see sources.md)
for out, rel in [('k_wood_heavy_1', 'impact-sounds/Audio/impactWood_heavy_001.ogg'),
                 ('k_wood_heavy_3', 'impact-sounds/Audio/impactWood_heavy_003.ogg'),
                 ('k_mining_4', 'impact-sounds/Audio/impactMining_004.ogg'),
                 ('k_soft_medium_1', 'impact-sounds/Audio/impactSoft_medium_001.ogg'),
                 ('k_punch_heavy_1', 'impact-sounds/Audio/impactPunch_heavy_001.ogg'),
                 ('k_footstep_carpet_0', 'impact-sounds/Audio/footstep_carpet_000.ogg'),
                 ('k_book_close', 'rpg-audio/Audio/bookClose.ogg'), ('k_book_place_1', 'rpg-audio/Audio/bookPlace1.ogg'),
                 ('k_book_flip_1', 'rpg-audio/Audio/bookFlip1.ogg'), ('k_book_flip_3', 'rpg-audio/Audio/bookFlip3.ogg'),
                 ('k_door_close_1', 'rpg-audio/Audio/doorClose_1.ogg'), ('k_draw_knife_1', 'rpg-audio/Audio/drawKnife1.ogg'),
                 ('k_knife_slice_2', 'rpg-audio/Audio/knifeSlice2.ogg'), ('k_cloth_3', 'rpg-audio/Audio/cloth3.ogg'),
                 ('k_leather_drop', 'rpg-audio/Audio/dropLeather.ogg'),
                 ('k_card_fan_1', 'casino-audio/Audio/card-fan-1.ogg'), ('k_card_shove_2', 'casino-audio/Audio/card-shove-2.ogg'),
                 ('k_chips_stack_2', 'casino-audio/Audio/chips-stack-2.ogg')]:
    CLIPS[out] = (K + rel, 0, None)
CLIPS['v_handdrum'] = ('vcsl/HDrumS_Hand_v1_rr1_Sum.wav', 0, None)
CLIPS['v_logdrum'] = ('vcsl/LogDrumLo_MedM_v1_rr1_Sum.wav', 0, 0.8)
CLIPS['v_bassdrum'] = ('vcsl/BDrumNew_hit_v5_rr1_Sum.wav', 0, 1.6)
for out, f, s, d in [('vs_timp_roll_lo', 'Timpani2_Roll_v5_rr1_Sum', 0, 3.0), ('vs_timp_roll_hi', 'Timpani4_Roll_v3_rr1_Sum', 0, 2.5),
                     ('vs_timp_hi', 'Timpani4_Hit_v3_rr1_Sum', 0, 2.2), ('vs_timp_1', 'Timpani1_Hit_v3_rr1_Sum', 0, 2.5),
                     ('vs_bassdrum_rub', 'bassdrum_rub1_v1', 0, 3.2)]:
    CLIPS[out] = ('vsco/%s.wav' % f, s, d)
for out, fid, s, d in [('fs560510_debris_a', 560510, 2.95, 4.0), ('fs560510_debris_b', 560510, 7.95, 4.6),
                       ('fs255111_boom', 255111, 0, 4.0), ('fs222517_hit', 222517, 0, 4.0),
                       ('fs569746_gravel', 569746, 0, 4.4), ('fs462162_rubble', 462162, 0.85, 2.0),
                       ('fs743232_carve', 743232, 0, None), ('fs462879_ethereal', 462879, 0.3, 4.2),
                       ('fs60027_swosh', 60027, 0.08, None), ('fs146932_wind', 146932, 0.6, 4.8),
                       ('fs446010_backwoosh', 446010, 0, None)]:
    CLIPS[out] = ('freesound/%d.mp3' % fid, s, d)


def main(cache):
    os.makedirs(OUT, exist_ok=True)
    sums = []
    for name, (rel, s, d) in sorted(CLIPS.items()):
        src = os.path.join(cache, rel)
        dst = os.path.join(OUT, name + '.ogg')
        cmd = ['ffmpeg', '-y', '-v', 'error', '-ss', str(s), '-i', src]
        if d:
            cmd += ['-t', str(d)]
        cmd += ['-ac', '1', '-ar', '44100', '-c:a', 'libvorbis', '-q:a', '5', '-map_metadata', '-1', dst]
        subprocess.run(cmd, check=True)
        sums.append('%s  %s' % (hashlib.sha256(open(dst, 'rb').read()).hexdigest(), name + '.ogg'))
    open(os.path.join(HERE, 'sources.sha256'), 'w').write('\n'.join(sums) + '\n')
    print(len(sums), 'clips ->', OUT)


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'raw')
