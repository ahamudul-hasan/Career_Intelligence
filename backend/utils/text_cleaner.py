"""Text cleaning utilities for job descriptions (Phase 5 / Section 18)."""
import re
import unicodedata

def clean_html(raw_html: str) -> str:
    """Remove HTML tags from raw job descriptions."""
    if not raw_html:
        return ""
    clean_text = re.sub(r"<[^>]+>", " ", raw_html)
    return " ".join(clean_text.split())

def normalize_whitespace(text: str) -> str:
    """Collapse excess newlines and whitespace into clean single spaces or paragraphs."""
    if not text:
        return ""
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n\s*\n+", "\n\n", text)
    return text.strip()

def normalize_unicode(text: str) -> str:
    """Normalize unicode characters (NFKD)."""
    if not text:
        return ""
    return unicodedata.normalize("NFKD", text)

def clean_job_text(raw_text: str) -> str:
    """Full pipeline to clean raw job text: remove HTML, normalize unicode and whitespace."""
    if not raw_text:
        return ""
    text = clean_html(raw_text)
    text = normalize_unicode(text)
    text = normalize_whitespace(text)
    return text
