"""Cut the small CC0 source clips in tools/sfx/sources/ from the original downloads.

You only need this to re-derive the clips; make_sfx.py reads tools/sfx/sources/ directly.
Usage:  python3 tools/sfx/prepare_sources.py <raw-cache-dir>

<raw-cache-dir> must hold the original downloads, laid out as:
  kenney/<pack>/Audio/<file>.ogg   Kenney packs (kenney.nl/assets/<pack>), CC0 1.0
  vcsl/<file>.wav                  Versilian Community Sample Library (github.com/sgossner/VCSL), CC0 1.0
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
    'k_soft_medium_1': (K + 'impact-sounds/Audio/impactSoft_medium_001.ogg', 0, None),
    'k_soft_medium_3': (K + 'impact-sounds/Audio/impactSoft_medium_003.ogg', 0, None),
    'k_soft_heavy_0': (K + 'impact-sounds/Audio/impactSoft_heavy_000.ogg', 0, None),
    'k_plank_1': (K + 'impact-sounds/Audio/impactPlank_medium_001.ogg', 0, 0.5),
    'k_plank_3': (K + 'impact-sounds/Audio/impactPlank_medium_003.ogg', 0, 0.4),
    'k_punch_medium_0': (K + 'impact-sounds/Audio/impactPunch_medium_000.ogg', 0, None),
    'k_footstep_wood_1': (K + 'impact-sounds/Audio/footstep_wood_001.ogg', 0, None),
    'k_footstep_carpet_2': (K + 'impact-sounds/Audio/footstep_carpet_002.ogg', 0, None),
    'k_wood_heavy_0': (K + 'impact-sounds/Audio/impactWood_heavy_000.ogg', 0, None),
    'k_soft_heavy_2': (K + 'impact-sounds/Audio/impactSoft_heavy_002.ogg', 0, None),
    # ---- Kenney RPG Audio (CC0)
    'k_cloth_2': (K + 'rpg-audio/Audio/cloth2.ogg', 0, None),
    'k_cloth_4': (K + 'rpg-audio/Audio/cloth4.ogg', 0, None),
    'k_coins': (K + 'rpg-audio/Audio/handleCoins.ogg', 0, None),
    'k_knife_slice_1': (K + 'rpg-audio/Audio/knifeSlice.ogg', 0, None),
    'k_metal_click': (K + 'rpg-audio/Audio/metalClick.ogg', 0, None),
    'k_metal_latch': (K + 'rpg-audio/Audio/metalLatch.ogg', 0, None),
    'k_chop': (K + 'rpg-audio/Audio/chop.ogg', 0, None),
    'k_cloth_3': (K + 'rpg-audio/Audio/cloth3.ogg', 0, None),
    'k_book_place_1': (K + 'rpg-audio/Audio/bookPlace1.ogg', 0, None),
    'k_book_close': (K + 'rpg-audio/Audio/bookClose.ogg', 0, None),
    'k_book_open': (K + 'rpg-audio/Audio/bookOpen.ogg', 0, None),
    'k_book_flip_2': (K + 'rpg-audio/Audio/bookFlip2.ogg', 0, None),
    # ---- Kenney Casino Audio (CC0)
    'k_chip_lay_1': (K + 'casino-audio/Audio/chip-lay-1.ogg', 0, None),
    'k_chip_lay_3': (K + 'casino-audio/Audio/chip-lay-3.ogg', 0, None),
    'k_chips_collide_2': (K + 'casino-audio/Audio/chips-collide-2.ogg', 0, None),
    'k_card_slide_2': (K + 'casino-audio/Audio/card-slide-2.ogg', 0, None),
    'k_dice_throw_1': (K + 'casino-audio/Audio/dice-throw-1.ogg', 0, None),
    'k_card_place_1': (K + 'casino-audio/Audio/card-place-1.ogg', 0, None),
    'k_card_fan_1': (K + 'casino-audio/Audio/card-fan-1.ogg', 0, None),
    'k_chips_stack_2': (K + 'casino-audio/Audio/chips-stack-2.ogg', 0, None),
    'k_chips_handle_1': (K + 'casino-audio/Audio/chips-handle-1.ogg', 0, None),
    # ---- Kenney Interface Sounds / UI Audio (CC0)
    'k_ui_click_3': (K + 'ui-audio/Audio/click3.ogg', 0, None),
    # ---- VCSL (CC0)
    'v_piano_C2': ('vcsl/Upright1_Sus_C2_vl1_rr1.wav', 0, 5.0),
    'v_piano_C3': ('vcsl/Upright1_Sus_C3_vl1_rr1.wav', 0, 5.0),
    'v_piano_G3': ('vcsl/Upright1_Sus_G3_vl1_rr1.wav', 0, 5.0),
    'v_piano_C4': ('vcsl/Upright1_Sus_C4_vl1_rr1.wav', 0, 5.0),
    'v_piano_G4': ('vcsl/Upright1_Sus_G4_vl1_rr1.wav', 0, 4.0),
    'v_piano_C5': ('vcsl/Upright1_Sus_C5_vl1_rr1.wav', 0, 4.0),
    'v_woodblock_pp': ('vcsl/wood_click_pp_rr1.wav', 0, None),
    'v_woodblock_mp': ('vcsl/wood_click_mp.wav', 0, None),
    'v_timpani': ('vcsl/Timpani1_Hit_v2_rr1_Sum.wav', 0, 3.0),
    'v_bassdrum': ('vcsl/BDrumNew_hit_v5_rr1_Sum.wav', 0, None),
    'v_framedrum_muted': ('vcsl/HDrumL_HitMuted_v2_rr1_Sum.wav', 0, None),
}
for n in ('C2', 'D#2', 'F#2', 'C3', 'D#3', 'F#3', 'A3'):
    CLIPS['v_organ_' + n] = ('vcsl/NT5_Man3Quiet_%s_rr1.wav' % n, 0, 7.0)
# ---- Freesound (each CC0 1.0; see sources.md)
for out, fid, s, d in [
    ('fs418509_quack', 418509, 0, None), ('fs427592_pistol', 427592, 0, 1.1), ('fs402789_pistol_indoor', 402789, 1.25, 1.2),
    ('fs427595_shotgun', 427595, 0, 1.3), ('fs235968_explosion', 235968, 0.3, 3.6), ('fs255111_boom', 255111, 0, 3.2),
    ('fs423990_horn', 423990, 0, None), ('fs69570_lion', 69570, 30.6, 2.2), ('fs478934_laugh', 478934, 0, None),
    ('fs35716_scream', 35716, 1.55, 2.2), ('fs60013_whoosh', 60013, 0, None), ('fs683101_whoosh', 683101, 0.1, 0.6),
    ('fs221528_glass_break', 221528, 0, None), ('fs45650_fuse', 45650, 1.0, 1.6),
    ('fs52906_siren', 52906, 2.0, 2.4), ('fs163453_crossbow', 163453, 0, None), ('fs743246_stone', 743246, 0, None),
    ('fs202092_chest', 202092, 0, 2.6)]:
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
