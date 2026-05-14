from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re


class KBEntry(BaseModel):
    role: str
    skills: str


class RecommendRequest(BaseModel):
    resume_text: str
    internship_kb: List[KBEntry]
    top_k: int = 3


# Synonym mapping for common skill variations
SKILL_SYNONYMS = {
    "dsa": "datastructures",
    "data structures": "datastructures",
    "data structures and algorithms": "datastructures",
    "data-structures": "datastructures",
    "data_structures": "datastructures",
    "ml": "machinelearning",
    "machine learning": "machinelearning",
    "ai": "artificialintelligence",
    "artificial intelligence": "artificialintelligence",
    "deep learning": "deeplearning",
    "deep-learning": "deeplearning",
    "data science": "datascience",
    "data-science": "datascience",
    "data_science": "datascience",
    "web development": "webdevelopment",
    "web-development": "webdevelopment",
    "web_development": "webdevelopment",
    "full stack": "fullstack",
    "full-stack": "fullstack",
    "full_stack": "fullstack",
    "front end": "frontend",
    "front-end": "frontend",
    "front_end": "frontend",
    "back end": "backend",
    "back-end": "backend",
    "back_end": "backend",
    "computer vision": "computervision",
    "computer-vision": "computervision",
    "computer_vision": "computervision",
    "natural language processing": "nlp",
    "natural-language-processing": "nlp",
    "natural_language_processing": "nlp",
    "big data": "bigdata",
    "big-data": "bigdata",
    "big_data": "bigdata",
    "data analysis": "dataanalysis",
    "data-analysis": "dataanalysis",
    "data_analysis": "dataanalysis",
    "data visualization": "datavisualization",
    "data-visualization": "datavisualization",
    "data_visualization": "datavisualization",
    "object oriented programming": "oop",
    "object-oriented-programming": "oop",
    "object_oriented_programming": "oop",
    "version control": "versioncontrol",
    "version-control": "versioncontrol",
    "version_control": "versioncontrol",
    "continuous integration": "ci",
    "continuous-integration": "ci",
    "continuous_integration": "ci",
    "continuous deployment": "cd",
    "continuous-deployment": "cd",
    "continuous_deployment": "cd",
    "rest api": "restapi",
    "rest-api": "restapi",
    "rest_api": "restapi",
    "api development": "apidevelopment",
    "api-development": "apidevelopment",
    "api_development": "apidevelopment",
}


app = FastAPI()


def normalize_skill_text(skill_text):
    """
    Normalize a single skill text:
    - Convert to lowercase
    - Remove spaces and special characters
    - Keep only alphanumeric characters
    """
    if not skill_text or not isinstance(skill_text, str):
        return ""

    # Convert to lowercase
    normalized = skill_text.lower()

    # Remove spaces and special characters, keep only alphanumeric
    normalized = re.sub(r'[^a-z0-9]', '', normalized)

    return normalized.strip()


def apply_synonym_mapping(skill_text):
    """
    Apply synonym mapping to skill text.
    First normalize, then check for synonyms.
    """
    if not skill_text or not isinstance(skill_text, str):
        return ""

    # First normalize the skill
    normalized = normalize_skill_text(skill_text)

    # Check for synonyms (both original and normalized forms)
    skill_lower = skill_text.lower().strip()
    if skill_lower in SKILL_SYNONYMS:
        return SKILL_SYNONYMS[skill_lower]

    if normalized in SKILL_SYNONYMS:
        return SKILL_SYNONYMS[normalized]

    return normalized


def normalize_skills(skills_string):
    """
    Parse and normalize skills from a string.
    Handles comma and space-separated skills.
    Returns a set of normalized skill strings.
    """
    if not skills_string or not isinstance(skills_string, str):
        return set()

    # Split by both commas and spaces, handling multiple separators
    skills_list = re.split(r'[\s,]+', skills_string.strip())

    # Normalize each skill and apply synonym mapping
    normalized = set()
    for skill in skills_list:
        skill = skill.strip()
        if skill:  # Ignore empty strings
            normalized_skill = apply_synonym_mapping(skill)
            if normalized_skill:  # Only add non-empty normalized skills
                normalized.add(normalized_skill)

    return normalized


def extract_student_skills(resume_text):
    """
    Extract skills from resume text by tokenizing and normalizing.
    Uses word tokenization and applies synonym mapping.
    """
    if not resume_text or not isinstance(resume_text, str):
        return set()

    # Extract potential skill phrases (multi-word and single words)
    # Look for common skill patterns
    skill_patterns = [
        r'\b[a-zA-Z]+(?:\s+[a-zA-Z]+)*\b',  # Multi-word skills
        r'\b[a-zA-Z]+\b',  # Single word skills
    ]

    potential_skills = set()

    for pattern in skill_patterns:
        matches = re.findall(pattern, resume_text, re.IGNORECASE)
        for match in matches:
            # Apply synonym mapping to each potential skill
            normalized = apply_synonym_mapping(match)
            if normalized and len(normalized) > 1:  # Ignore single characters
                potential_skills.add(normalized)

    return potential_skills


def calculate_missing_skills(required_skills, student_skills):
    """
    Calculate missing skills: required skills not in student skills.
    Both inputs should already be normalized sets.
    Returns a sorted list of missing skills.
    """
    if not required_skills or not student_skills:
        # If student has no skills, all required skills are missing
        if required_skills:
            return sorted(list(required_skills))
        return []

    missing = required_skills - student_skills
    return sorted(list(missing))


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/recommend-internships")
def recommend_internships(payload: RecommendRequest):
    if not payload.resume_text.strip():
        return {"recommendations": []}

    kb = payload.internship_kb or []
    if not kb:
        return {"recommendations": []}

    # Extract student skills once for all comparisons
    student_skills = extract_student_skills(payload.resume_text)

    kb_documents = [f"{item.role} {item.skills}" for item in kb]
    all_documents = kb_documents + [payload.resume_text]

    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(all_documents)
    resume_vector = tfidf_matrix[-1]
    similarities = cosine_similarity(resume_vector, tfidf_matrix[:-1])[0]

    role_scores = []
    for idx, score in enumerate(similarities):
        # Parse required skills from KB entry
        required_skills = normalize_skills(kb[idx].skills)
        missing_skills = calculate_missing_skills(required_skills, student_skills)

        role_scores.append({
            "role": kb[idx].role,
            "score": round(float(score), 4),
            "missing_skills": missing_skills
        })

    role_scores.sort(key=lambda x: x["score"], reverse=True)

    unique = []
    seen = set()
    for entry in role_scores:
        role_name = entry["role"].strip().lower()
        if role_name in seen:
            continue
        seen.add(role_name)
        unique.append(entry)
        if len(unique) >= payload.top_k:
            break

    return {"recommendations": unique}

