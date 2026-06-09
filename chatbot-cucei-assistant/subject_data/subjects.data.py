"""Subject data registry."""

from __future__ import annotations

import json
from pathlib import Path

_BASE_DIR = Path(__file__).resolve().parent

def _load_subject(code: str):
    with (_BASE_DIR / f"{code}.data.json").open("r", encoding="utf-8") as file:
        return json.load(file)


IGFO = _load_subject("IGFO")
ILOT = _load_subject("ILOT")
INBI = _load_subject("INBI")
INCE = _load_subject("INCE")
INDU = _load_subject("INDU")
INEA = _load_subject("INEA")
INFO = _load_subject("INFO")
INME = _load_subject("INME")
INNI = _load_subject("INNI")
INRO = _load_subject("INRO")
ITOG = _load_subject("ITOG")
LILT = _load_subject("LILT")
ICIV = _load_subject("ICIV")
LQFB = _load_subject("LQFB")
LQUI = _load_subject("LQUI")
LIMA = _load_subject("LIMA")

# IMEI is not included because we couldn't find study plans for it
# ICOM is not included because we couldn't find study plans for it
# LINA is not included because we couldn't find study plans for it
# ICIM is not included because we couldn't find study plans for it
# LIFI is not included because we couldn't find study plans for it


subjectsData = {
    "INNI": INNI,
    "INFO": INFO,
    "LILT": LILT,
    "ILOT": ILOT,
    "INRO": INRO,
    "INCE": INCE,
    "INEA": INEA,
    "INBI": INBI,
    "INME": INME,
    "INDU": INDU,
    "ITOG": ITOG,
    "IGFO": IGFO,
    "ICIV": ICIV,
    "LQFB": LQFB,
    "LQUI": LQUI,
    "LIMA": LIMA,
}
