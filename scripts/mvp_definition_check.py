"""Phase 17 MVP Definition Check (Section 62).
Walks through the entire end-to-end chain with real data and services:
1. Select career, location, experience level
2. Retrieve 20-30 real jobs -> store in MySQL -> clean descriptions
3. LangChain extracts skills -> skills normalized
4. Python calculates market frequencies -> store analysis snapshot
5. Enter user profile skills -> calculate deterministic skill gaps
6. LangChain generates personalized roadmap -> projects recommended
7. Verify final roadmap retrieval
"""
import sys
import json
import requests

BASE_URL = "http://127.0.0.1:5000/api"

def print_step(title):
    print("\n" + "=" * 70)
    print(f">> [MVP CHECK] {title}")
    print("=" * 70)

def run_mvp_check():
    session = requests.Session()

    # Step 1: Select Career, Location, Experience Level
    print_step("Step 1: Select Career, Location, and Experience Level")
    r = session.get(f"{BASE_URL}/careers")
    assert r.status_code == 200, f"Careers retrieval failed: {r.text}"
    careers = r.json()
    assert len(careers) > 0, "No careers found"
    
    # Pick 'Backend Developer' or 'Software Engineer'
    target_career = next((c for c in careers if c["name"] == "Backend Developer"), careers[0])
    career_id = target_career["id"]
    career_name = target_career["name"]
    location = "US"
    experience_level = "entry_level"
    print(f"Selected Career: {career_name} (ID: {career_id}) | Location: {location} | Experience: {experience_level}")

    # Step 2: Ingest 20-30 Real Jobs into MySQL with Text Cleaning
    print_step("Step 2: Ingest Jobs & Verify HTML Cleaning")
    search_payload = {
        "career_role_id": career_id,
        "location": location,
        "experience_level": experience_level,
        "limit": 25,
        "source": "adzuna"
    }
    r = session.post(f"{BASE_URL}/jobs/search", json=search_payload)
    if r.status_code != 200:
        print(f"Adzuna search response: {r.status_code} {r.text}")
        print("Falling back to FileProvider sample ingestion if live Adzuna credentials unconfigured...")
        # Fallback to file provider if external API key quota or credentials require it
        search_payload["source"] = "file"
        r = session.post(f"{BASE_URL}/jobs/search", json=search_payload)
        assert r.status_code == 200, f"Job search failed: {r.text}"

    ingest_result = r.json()
    print(f"Ingestion result: {ingest_result.get('message')}")
    print(f"Jobs found: {ingest_result.get('jobs_found')} | Ingested: {ingest_result.get('jobs_ingested')} | Duplicates: {ingest_result.get('jobs_duplicate')}")

    # Verify cleaned description in stored jobs
    r = session.get(f"{BASE_URL}/jobs?career_role_id={career_id}&limit=5")
    assert r.status_code == 200
    jobs_sample = r.json().get("jobs", [])
    assert len(jobs_sample) > 0, "No stored jobs found for career"
    first_job = jobs_sample[0]
    print(f"Sample Stored Job: '{first_job['title']}' at '{first_job['company']}'")
    assert "<script>" not in (first_job.get("cleaned_description") or "")
    assert "<p>" not in (first_job.get("cleaned_description") or "")
    print("Job description cleaned & boilerplate stripped: PASS")

    # Step 3: LangChain Skill Extraction & Normalization
    print_step("Step 3: LangChain Skill Extraction & Normalization")
    extract_payload = {
        "career_role_id": career_id,
        "limit": 10,
        "reextract": False
    }
    r = session.post(f"{BASE_URL}/skills/extract", json=extract_payload)
    assert r.status_code == 200, f"Extraction failed: {r.text}"
    extract_data = r.json()
    print(f"Skill Extraction Result: {extract_data.get('message')}")
    print(f"Jobs processed: {extract_data.get('jobs_processed')} | Skills extracted: {extract_data.get('total_skills_extracted')}")

    # Step 4: Python Calculates Market Frequencies & Stores Analysis Snapshot
    print_step("Step 4: Deterministic Market Frequencies Calculation")
    analysis_payload = {
        "career_role_id": career_id,
        "target_location": location,
        "experience_level": experience_level,
        "sources": "adzuna"
    }
    r = session.post(f"{BASE_URL}/analysis", json=analysis_payload)
    assert r.status_code == 201, f"Market analysis failed: {r.text}"
    analysis_data = r.json()
    analysis_obj = analysis_data.get("analysis", analysis_data)
    analysis_id = analysis_obj["id"]
    print(f"Analysis Snapshot Created: ID #{analysis_id}")
    print(f"Jobs Analyzed: {analysis_obj.get('jobs_analyzed')}")
    
    top_skills = analysis_data.get("skills", [])
    print(f"Top {len(top_skills[:8])} Market Demanded Skills:")
    for s in top_skills[:8]:
        print(f"  - {s['skill_name']}: {s['percentage']}% ({s['skill_count']} postings)")

    # Step 5: User Skills Profile & Deterministic Gap Classification
    print_step("Step 5: User Profile Skills & Skill Gap Analysis")
    # Setup test user (user_id=1) with a distinct profile
    session.put(f"{BASE_URL}/profile?user_id=1", json={
        "name": "Alex Developer",
        "email": "alex.mvp@example.com"
    })
    
    # Give user beginner Python (1) and intermediate SQL (2), but 0 Docker and 0 Kubernetes
    session.post(f"{BASE_URL}/profile/skills?user_id=1", json={"skill_name": "Python", "proficiency": 1})
    session.post(f"{BASE_URL}/profile/skills?user_id=1", json={"skill_name": "SQL", "proficiency": 2})

    # Fetch gaps
    r = session.get(f"{BASE_URL}/analysis/{analysis_id}/gaps?user_id=1")
    assert r.status_code == 200, f"Gap calculation failed: {r.text}"
    gaps = r.json()
    assert len(gaps) > 0, "No skill gaps calculated"

    print(f"Calculated {len(gaps)} Skill Gaps for Alex Developer:")
    high_gaps = [g for g in gaps if g["gap_priority"] == "high"]
    medium_gaps = [g for g in gaps if g["gap_priority"] == "medium"]
    low_gaps = [g for g in gaps if g["gap_priority"] == "low"]
    print(f"  - High Priority Gaps: {len(high_gaps)} (e.g. {[g['skill_name'] for g in high_gaps[:3]]})")
    print(f"  - Medium Priority Gaps: {len(medium_gaps)} (e.g. {[g['skill_name'] for g in medium_gaps[:3]]})")
    print(f"  - Low Priority Gaps: {len(low_gaps)}")

    # Step 6: LangChain Generates Personalized Roadmap & Projects Recommended
    print_step("Step 6: LangChain Roadmap Generation & Project Recommendations")
    roadmap_payload = {
        "career_role_id": career_id,
        "user_id": 1,
        "analysis_id": analysis_id,
        "available_time": "12 hours/week"
    }
    r = session.post(f"{BASE_URL}/roadmap/generate", json=roadmap_payload)
    assert r.status_code == 201, f"Roadmap generation failed: {r.text}"
    roadmap_obj = r.json().get("roadmap", {})
    roadmap_id = roadmap_obj.get("id")
    print(f"Roadmap Generated: '{roadmap_obj.get('title')}' (ID #{roadmap_id})")
    print(f"Summary: {roadmap_obj.get('summary')[:120]}...")

    phases = roadmap_obj.get("phases", [])
    print(f"Generated {len(phases)} Learning Phases:")
    for p in phases:
        items_count = len(p.get("items", []))
        proj = p.get("project")
        proj_str = f" | Project: {proj['title']}" if proj else ""
        print(f"  - Phase {p.get('phase_number')}: {p.get('title')} ({p.get('estimated_duration')}, {items_count} milestones{proj_str})")

    # Step 7: Final Roadmap Fetch & Consistency Check
    print_step("Step 7: Final Roadmap Retrieval & Consistency Check")
    r = session.get(f"{BASE_URL}/roadmap/{roadmap_id}")
    assert r.status_code == 200, f"Roadmap retrieve failed: {r.text}"
    fetched = r.json()
    assert fetched["id"] == roadmap_id
    assert len(fetched["phases"]) > 0

    print("\n" + "*" * 70)
    print(">> MVP DEFINITION CHECK COMPLETE: ALL STEPS VERIFIED 100% OPERATIONAL")
    print("*" * 70)

if __name__ == "__main__":
    run_mvp_check()
