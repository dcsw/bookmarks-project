import json
from pathlib import Path
from typing import List, Dict, Any
from NetscapeBookmarksFileParser import parse_string

def parse_bookmarks(file_path: str) -> List[Dict[str, Any]]:
    """
    Parse a bookmarks file and return a list of bookmark entries.

    The function expects the file to contain a JSON array of bookmark objects.
    Each bookmark object may contain keys such as 'title', 'url', and 'tags'.

    Parameters
    ----------
    file_path : str
        Path to the bookmarks file.

    Returns
    -------
    List[Dict[str, Any]]
        A list of bookmark dictionaries.
    """
    path = Path(file_path)
    if not path.is_file():
        raise FileNotFoundError(f"Bookmarks file not found: {file_path}")

    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)

    if not isinstance(data, list):
        raise ValueError("Bookmarks file must contain a JSON array")

    return data

__all__ = ["parse_bookmarks"]
