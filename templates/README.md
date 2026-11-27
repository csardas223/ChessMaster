# Templates

Reusable starting points for the maintainer (see docs/MAINTAINER.md for the daily routine).

| template | use it for |
|---|---|
| `under-construction/` | a new video whose mode is not fully playable yet: the lobby hero + "Coming soon" screen with a per-part build list |
| `new-mode/mode.js` | the mode file skeleton, copied to `data/modes/<videoId>.js` |
| `new-mode/research.json` | the research spec skeleton, copied to `research/modes/<videoId>.json` |
| `new-mode/ART_CHECKLIST.md` | the art check every new or changed sprite passes before it is pushed (three passes) |
| `new-mode/qa_mode.py` | the phone QA script skeleton, copied to `tools/qa_<short>.py` |

Copy, then replace every `TODO`. A copied file that still contains `TODO` is not done: `grep -rn TODO data/modes/<id>.js`.
