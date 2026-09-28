"""Unit tests for Phase 5 Text Cleaning Pipeline (Section 18)."""
from backend.utils.text_cleaner import (
    clean_html,
    normalize_unicode,
    remove_duplicates,
    remove_boilerplate,
    normalize_whitespace,
    clean_job_text
)

def test_clean_html_basic_and_entities():
    raw_html = "<p>Join our team as a <strong>Python Developer</strong>! &amp; work on APIs &gt; 1M req/day.</p>"
    cleaned = clean_html(raw_html)
    assert "<p>" not in cleaned
    assert "<strong>" not in cleaned
    assert "&amp;" not in cleaned
    assert "Python Developer" in cleaned
    assert "& work on APIs > 1M req/day." in cleaned

def test_clean_html_strips_scripts_and_styles():
    raw_html = """
    <style>body { font-size: 14px; }</style>
    <div>
        <h3>Backend Engineer</h3>
        <script>console.log("tracker");</script>
        <p>Must know FastAPI and SQL.</p>
    </div>
    """
    cleaned = clean_html(raw_html)
    assert "font-size" not in cleaned
    assert "tracker" not in cleaned
    assert "Backend Engineer" in cleaned
    assert "Must know FastAPI and SQL." in cleaned

def test_clean_html_formats_lists():
    raw_html = """
    <ul>
        <li>Docker &amp; Kubernetes</li>
        <li>PostgreSQL optimization</li>
    </ul>
    """
    cleaned = clean_html(raw_html)
    assert "• Docker & Kubernetes" in cleaned
    assert "• PostgreSQL optimization" in cleaned

def test_normalize_unicode():
    raw_text = "Here\u2019s a \u201cmodern\u201d role \u2014 Python \u00a0developer."
    normalized = normalize_unicode(raw_text)
    assert normalized == 'Here\'s a "modern" role - Python  developer.'

def test_remove_duplicates():
    repeated_text = """
    Software Engineer - Backend
    Responsibilities:
    Build high-throughput distributed microservices.
    Build high-throughput distributed microservices.
    Requirements:
    5 years of Python development.
    """
    deduped = remove_duplicates(repeated_text)
    assert deduped.count("Build high-throughput distributed microservices.") == 1

def test_remove_boilerplate():
    text_with_eeo = """
    We are looking for a Senior Data Engineer with Snowflake and dbt expertise.
    We are an Equal Opportunity Employer and do not discriminate based on race, color, or religion.
    All qualified applicants will receive consideration for employment without regard to protected status.
    Great compensation and health benefits included.
    """
    cleaned = remove_boilerplate(text_with_eeo)
    assert "Senior Data Engineer" in cleaned
    assert "Equal Opportunity Employer" not in cleaned
    assert "All qualified applicants will receive consideration" not in cleaned
    assert "Great compensation and health benefits included." in cleaned

def test_normalize_whitespace():
    messy = "   Line 1 with    spaces   \n\n\n\n\n\n   Line 2 after huge gap    \n   "
    normalized = normalize_whitespace(messy)
    assert "\n\n\n" not in normalized
    assert normalized == "Line 1 with spaces\n\nLine 2 after huge gap"

def test_clean_job_text_end_to_end():
    messy_posting = """
    <div class="job-description">
        <h2>Senior Backend Engineer (Python / Distributed Systems)</h2>
        <style>.job-header { color: red; }</style>
        <p>We\u2019re hiring a talented <strong>Backend Developer</strong> to scale our infrastructure &amp; APIs.</p>
        <h4>Key Responsibilities:</h4>
        <ul>
            <li>Architect microservices using <strong>FastAPI</strong> and <strong>Flask</strong>.</li>
            <li>Optimize <em>PostgreSQL</em> queries and manage Redis caches.</li>
            <li>Deploy services via Docker and Kubernetes on AWS.</li>
        </ul>
        <p>We are an Equal Opportunity Employer. All qualified applicants will receive consideration for employment without regard to race, religion, sex.</p>
        <script>alert("apply tracking");</script>
    </div>
    """
    result = clean_job_text(messy_posting)

    # Asserts: No HTML, no script/style, no EEO boilerplate, readable text
    assert "<div" not in result
    assert "<h2>" not in result
    assert "style" not in result
    assert "script" not in result
    assert "Equal Opportunity Employer" not in result
    assert "• Architect microservices using FastAPI and Flask." in result
    assert "• Optimize PostgreSQL queries and manage Redis caches." in result
    assert "We're hiring a talented Backend Developer to scale our infrastructure & APIs." in result
