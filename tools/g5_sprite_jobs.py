"""Sprite jobs for tools/g5_sprites.py: J(source_png, 'id/name.png', crop=..., tol=..., size=..., recolor=...)"""
def add_jobs(J):
    # Wizard Chess
    J('DMtaRFMpCWc_pixel_wizard.png', 'DMtaRFMpCWc/bard.png', crop=(40, 0, 420, 380), keepc=[(0, 240, 255), (0, 200, 230)], tol=70, grow=3, size=160)
    J('DMtaRFMpCWc_minotaur.png', 'DMtaRFMpCWc/minotaur.png', size=160, sq=True)
    J('DMtaRFMpCWc_iso_tiles.png', 'DMtaRFMpCWc/dungeon.png', size=256)
    # King of the Bridge
    J('WEYUcaJTBso_troll.png', 'WEYUcaJTBso/troll.png', crop=(70, 60, 470, 460), size=200)
    J('M0rsyuvaTrk_horned_opponent.png', 'M0rsyuvaTrk/troll.png', size=128)
    J('M0rsyuvaTrk_rulebook.png', 'M0rsyuvaTrk/rulebook.png', size=256, sq=False)
    J('Y7KKKTTkwNk_goose.png', 'Y7KKKTTkwNk/goose.png', crop=(40, 170, 560, 560), tol=45, dark=90, size=220)
    J('Y7KKKTTkwNk_goose_sunglasses.png', 'Y7KKKTTkwNk/goose_sunglasses.png', crop=(10, 50, 210, 210), tol=45, dark=110, size=200)
    # Shotgun King
    J('NK4Upb_s8Ok_shotgun_king.png', 'NK4Upb_s8Ok/shotgun_king_art.png', size=256)
    J('NK4Upb_s8Ok_floor_board.png', 'NK4Upb_s8Ok/floor_board.png', size=268, sq=False)
    # Pawnbarian
    J('Kzt9ItpGtYg_pawnbarian_helmet.png', 'Kzt9ItpGtYg/hero.png', crop=(0, 110, 512, 512), tol=50, dark=90, size=200)
    J('Kzt9ItpGtYg_pawnbarian_helmet.png', 'Kzt9ItpGtYg/hero_avatar.png', crop=(56, 120, 456, 512), size=160)
    J('Kzt9ItpGtYg_lion_enemy.png', 'Kzt9ItpGtYg/lion.png', size=80)
    J('Kzt9ItpGtYg_piece_card.png', 'Kzt9ItpGtYg/card.png', size=80, sq=False)
    # Ouroboros King
    J('_RFXN1Ye3sY_portal_mage_icon.png', '_RFXN1Ye3sY/portal_mage.png', tol=40, size=100)
    J('_RFXN1Ye3sY_ouroboros_queen.png', '_RFXN1Ye3sY/ouroboros_queen.png', size=256)
    J('_RFXN1Ye3sY_ouroboros_queen.png', '_RFXN1Ye3sY/queen_face.png', crop=(180, 40, 420, 280), size=160)
    J('JAz_qMQpI1o_final_bosses.png', 'JAz_qMQpI1o/final_bosses.png', size=320)
    J('JAz_qMQpI1o_ouroboros_board.png', 'JAz_qMQpI1o/board.png', size=243, sq=False)
