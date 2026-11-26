"""Find sustained tonal ringing (bell / chime / ding) in the generated sounds.

Usage: python3 tools/sfx/ring_check.py [files...]   (default: every built sound in assets/)

For each STFT frame (46 ms window, 11.6 ms hop) we look for narrow spectral peaks between 250 Hz and 12 kHz that
stand well above the local spectral floor (prominence >= PROM dB over a +-300 Hz median) and are loud enough
to hear (within FLOOR dB of the sound's loudest frame). A ring is such a peak that persists at the same
frequency (+-1.5 %) across consecutive frames. We report the longest one; > LIMIT_MS is flagged.
Below 250 Hz a persistent component is a drum/body thump, not a ding, so it is ignored.

v4: the user OK'd tonal low booms and warm pads like their reference, so a persistent partial is only a "ring"
(bell / chime / ding / glass ping) when it is STRUCK: it is born on a broadband hit (an onset), reaches its loudest within
its first ~35 ms and then decays. A bowed-string pad that swells in (its loudest point comes later) is reported as "pad" and not flagged.
Anything struck that rings past LIMIT_MS is flagged, at any pitch from 250 Hz to 12 kHz. (Checked against VCSL
chimes, glockenspiel, hand bell, marimba, kalimba, most vibraphone notes and upright piano: all flagged.)
"""
import os, sys, glob, subprocess
import numpy as np
from scipy import signal
from scipy.ndimage import median_filter

SR = 44100
PROM = 14.0      # dB above the local spectral floor
FLOOR = 38.0     # dB below the loudest frame: quieter than this is inaudible behind the rest
LIMIT_MS = 150.0
ALLOW = {'honk'}   # a car horn has to be a horn (tonal by nature, not a bell); reported but not flagged
FMIN, FMAX = 250.0, 12000.0


def load(p):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                       capture_output=True, check=True)
    return np.frombuffer(r.stdout, np.float32).astype(float)


def longest_ring(x):
    x = np.concatenate([np.zeros(int(SR * 0.1)), x])   # so a hit at t=0 still reads as an onset
    nper, hop = 2048, 512
    f, t, Z = signal.stft(x, SR, nperseg=nper, noverlap=nper - hop, boundary=None, padded=False)
    P = 20 * np.log10(np.abs(Z) + 1e-9)
    band = (f >= FMIN) & (f <= FMAX)
    fb = f[band]
    Pb = P[band]
    df = f[1] - f[0]
    w = int(600 / df) | 1
    floor = median_filter(Pb, size=(w, 1), mode='nearest')
    top = np.max(Pb)
    # broadband onsets: frames whose total energy jumps >= 9 dB over the frame two hops earlier
    E = 10 * np.log10(np.sum(10 ** (P / 10), 0) + 1e-12)
    onset = np.zeros(len(E), bool)
    onset[2:] = (E[2:] - E[:-2] >= 9.0) & (E[2:] >= E.max() - 40)
    near_onset = np.convolve(onset.astype(float), np.ones(5), 'same') > 0
    peaks = []   # per frame: list of (freq, level)
    for j in range(Pb.shape[1]):
        col = Pb[:, j]
        idx, _ = signal.find_peaks(col)
        keep = [i for i in idx if col[i] - floor[i, j] >= PROM and col[i] >= top - FLOOR]
        peaks.append([(fb[i], col[i]) for i in keep])
    best, best_f, best_t = 0.0, 0.0, 0.0       # longest struck ring
    pad = 0.0                                  # longest swelled (bowed / pad) partial, informational
    tracks = []  # [freq, start_frame, last_frame, levels]
    for j, fr in enumerate(peaks):
        nxt = []
        for fq, lv in fr:
            m = [tr for tr in tracks if abs(tr[0] - fq) <= max(1.5 * df, 0.015 * fq) and tr[2] == j - 1]
            if m:
                tr = m[0]
                tracks.remove(tr)
                nxt.append([fq, tr[1], j, tr[3] + [lv]])
            else:
                nxt.append([fq, j, j, [lv]])
        for tr in nxt:
            d = (tr[2] - tr[1] + 1) * hop / SR * 1000 + (nper - hop) / SR * 1000 * 0.5
            if tr[2] <= tr[1]:
                continue
            lv = np.array(tr[3])
            # struck: born on a broadband hit, loudest within its first ~70 ms, and decaying from there
            struck = bool(near_onset[tr[1]]) and int(np.argmax(lv)) <= 6 and (lv.max() - lv[-1]) >= 6.0
            if struck and d > best:
                best, best_f, best_t = d, tr[0], tr[1] * hop / SR
            if not struck:
                pad = max(pad, d)
        tracks = [tr for tr in tracks if tr[2] >= j - 1] + nxt
    return best, best_f, best_t, pad


def main(files):
    bad = []
    for p in files:
        x = load(p)
        d, fq, t0, pd = longest_ring(x)
        flag = d > LIMIT_MS and os.path.splitext(os.path.basename(p))[0] not in ALLOW
        print('%-58s struck ring %6.0f ms @ %6.0f Hz (t=%.2fs) pad %5.0f ms %s' % (os.path.relpath(p), d, fq, t0, pd,
                                                                               'RING' if flag else 'ok'))
        if flag:
            bad.append(p)
    return bad


if __name__ == '__main__':
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
    fs = sys.argv[1:] or sorted(glob.glob(os.path.join(root, 'assets', 'sounds', '*.mp3')) +
                                glob.glob(os.path.join(root, 'assets', 'sounds', '*.wav')) +
                                glob.glob(os.path.join(root, 'assets', 'modes', '*', '*.wav')))
    b = main(fs)
    print('\n%d with a struck ring > %d ms' % (len(b), LIMIT_MS))
