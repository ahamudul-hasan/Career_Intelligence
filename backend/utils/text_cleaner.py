# Text cleaning utilities stub
import re

def clean_html(raw_html: str) -> str:
    """Remove HTML tags from raw job descriptions."""
    if not raw_html:
        return ""
    clean_text = re.sub(r"<[^>]+>", " ", raw_html)
    return " ".join(clean_text.split())
