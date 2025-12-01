import json
from pathlib import Path
from typing import List, Dict, Any
from NetscapeBookmarksFileParser import parser, NetscapeBookmarksFile, BookmarkFolder, BookmarkShortcut


def flatten_folder(folder: BookmarkFolder) -> List[BookmarkShortcut]:
    """
    Recursively flatten a BookmarkFolder into a list of BookmarkShortcut objects.

    Parameters
    ----------
    folder : BookmarkFolder
        The folder to flatten.

    Returns
    -------
    List[BookmarkShortcut]
        A flat list of all bookmark shortcuts contained within the folder and its
        subfolders.
    """
    flat_list: List[BookmarkShortcut] = []

    # Iterate over the mixed items array
    for item in folder.items:
        if isinstance(item, BookmarkShortcut):
            flat_list.append(item)
        elif isinstance(item, BookmarkFolder):
            flat_list.extend(flatten_folder(item))
        else:
            # Unknown item type; ignore or log if needed
            pass

    return flat_list


def parse_bookmarks(file_text: str) -> List[Dict[str, Any]]:
    """
    Parse a bookmarks file string and return a list of bookmark entries.

    The function expects the input to be a string containing the contents of a
    Netscape bookmarks file. It uses the `parser` from
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
    netscapeBookmarksFile = NetscapeBookmarksFile(file_text)

    # Use the external parser to convert the string into bookmark data
    bookmarks = parser.parse(netscapeBookmarksFile)

    # Ensure the result is a NetscapeBookmarksFile instance
    if not isinstance(bookmarks, NetscapeBookmarksFile):
        raise ValueError("Parsed bookmarks must be a NetscapeBookmarksFile")

    # Flatten the root folder into a list of shortcuts
    shortcuts = flatten_folder(bookmarks.bookmarks)

    # Convert each BookmarkShortcut to a plain dictionary
    result: List[Dict[str, Any]] = []
    for shortcut in shortcuts:
        result.append({
            "title": shortcut.name,
            "url": shortcut.href,
            "icon_base64": shortcut.icon_base64,
            "icon_url": shortcut.icon_url,
            "icon_url_fake": shortcut.icon_url_fake,
            "add_date_unix": shortcut.add_date_unix,
            "comment": shortcut.comment,
            "feed": shortcut.feed,
            "last_modified_unix": shortcut.last_modified_unix,
            "last_visit_unix": shortcut.last_visit_unix
            # "tags": getattr(shortcut, "tags", []),
        })

    return result


__all__ = ["parse_bookmarks"]
