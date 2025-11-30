import json
from pathlib import Path
from typing import List, Dict, Any
from NetscapeBookmarksFileParser import parse_string

def parse_bookmarks(file_text: str) -> List[Dict[str, Any]]:
    """
    Parse a bookmarks file string and return a list of bookmark entries.

    The function expects the input to be a string containing the contents of a
    Netscape bookmarks file. It uses the `parse_string` function from
    `NetscapeBookmarksFileParser` to parse the string into a list of bookmark
    dictionaries. Each bookmark dictionary may contain keys such as
    'title', 'url', and 'tags'.

    Parameters
    ----------
    file_text : str
        The raw string contents of a Netscape bookmarks file.

    Returns
    -------
    List[Dict[str, Any]]
        A list of bookmark dictionaries parsed from the input string.
    """
    # Use the external parser to convert the string into bookmark data
    bookmarks = parse_string(file_text)

    # Ensure the result is a list of dictionaries
    if not isinstance(bookmarks, list):
        raise ValueError("Parsed bookmarks must be a list")

    return bookmarks

__all__ = ["parse_bookmarks"]
