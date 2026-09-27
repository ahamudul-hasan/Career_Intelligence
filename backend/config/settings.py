"""System configuration and gap analysis thresholds.
Configurable thresholds per Section 50 of the specifications.
"""

# Skill Gap Analysis Thresholds
# High gap: skill frequency >= HIGH_GAP_MIN_FREQUENCY and user proficiency <= HIGH_GAP_MAX_PROFICIENCY
GAP_THRESHOLDS = {
    "HIGH_GAP_MIN_FREQUENCY": 50.0,       # Market demand percentage >= 50%
    "HIGH_GAP_MAX_PROFICIENCY": 1,        # 0 = None, 1 = Beginner
    "MEDIUM_GAP_MIN_FREQUENCY": 25.0,     # Market demand percentage >= 25%
    "MEDIUM_GAP_MAX_PROFICIENCY": 2,      # 2 = Intermediate
    "LOW_GAP_MIN_FREQUENCY": 10.0,        # Market demand percentage >= 10%
}

# Supported Experience Levels
EXPERIENCE_LEVELS = ["entry_level", "mid_level", "senior"]

# Supported Job Sources
JOB_SOURCES = ["adzuna", "jooble", "manual", "file"]

# Supported Career Categories
CAREER_CATEGORIES = [
    "Software Development",
    "AI / ML",
    "Data",
    "Infrastructure",
    "Security",
    "Quality"
]
