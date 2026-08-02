import re
from typing import List
from app.domain.models import Note

WIKI_LINK_PATTERN = re.compile(r"\[\[((?:[^\]]|\](?!\]))+)\]\]")

class WikiLinkService:
    @staticmethod
    def extract_links(content: str) -> List[str]:
        return WIKI_LINK_PATTERN.findall(content)

    @staticmethod
    def find_linked_notes(content: str, all_notes: List[Note]) -> List[Note]:
        titles = [t.lower() for t in WikiLinkService.extract_links(content)]
        title_map = {n.title.lower(): n for n in all_notes}
        seen = set()
        result = []
        for t in titles:
            if t in title_map and t not in seen:
                seen.add(t)
                result.append(title_map[t])
        return result

    @staticmethod
    def find_backlinks(target: Note, all_notes: List[Note]) -> List[Note]:
        backlinks = []
        seen = set()
        for n in all_notes:
            if n.id == target.id:
                continue
            titles = [t.lower() for t in WikiLinkService.extract_links(n.content)]
            if target.title.lower() in titles and n.id not in seen:
                seen.add(n.id)
                backlinks.append(n)
        return backlinks
