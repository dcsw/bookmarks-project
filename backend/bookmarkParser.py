import json
from pathlib import Path
from typing import List, Dict, Any
from NetscapeBookmarksFileParser import parser, NetscapeBookmarksFile

    
    # Access the root folder: bookmarks_file.bookmarks
def flatten_folder(folder):
    flat_list = []
    
    # Add shortcuts (bookmarks) from this folder
    for shortcut in folder.shortcuts:
        flat_list.append(shortcut)
    
    # Recursively flatten child folders
    for child_folder in folder.folders:
        flat_list.extend(flatten_folder(child_folder))
    
    return flat_list

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
        ...
    """
    netscapeBookmarksFile = NetscapeBookmarksFile(file_text)
    
    # Use the external parser to convert the string into bookmark data
    bookmarks = parser.parse(netscapeBookmarksFile)

    # Ensure the result is a list of dictionaries
    if not isinstance(bookmarks, NetscapeBookmarksFile):
        raise ValueError("Parsed bookmarks must be a NetscapeBookmarksFile")


    return flatten_folder(bookmarks.bookmarks)

    # return bookmarks

__all__ = ["parse_bookmarks"]
