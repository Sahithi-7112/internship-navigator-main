# Skill Gap Analyzer Feature Implementation

## Overview
The Skill Gap Analyzer is an AI-powered feature that identifies missing skills for recommended internship roles based on a student's resume. It integrates seamlessly with the existing RAG (Retrieval-Augmented Generation) recommendation system.

## Architecture

### 1. Data Sources
- **CSV Knowledge Base** (`internship_roles_skills_clean_600.csv`)
  - Contains columns: `role` and `skills`
  - Skills are stored as space/comma-separated text
  - Example: "AI Research Intern" → "python sklearn pandas numpy data cleaning eda statistics..."

- **Student Resume** 
  - PDF format, extracted to plain text
  - Contains work experience, technical skills, projects, education

### 2. Logic Flow

```
Resume Upload
    ↓
Extract Resume Text (PDF → TXT)
    ↓
Tokenize Resume → Student Skills (set of words)
    ↓
Load CSV Knowledge Base
    ↓
For Each Role:
    ├─ Parse Required Skills from CSV
    ├─ Normalize Skills (lowercase, deduplicate)
    ├─ Calculate TF-IDF Similarity Score
    ├─ Compare Required vs Student Skills
    └─ Generate Missing Skills List
    ↓
Return Recommendations with Missing Skills
    ↓
Display UI with Skill Gap Analysis
```

### 3. Key Components

#### A. RAG Service (`python-rag-service/rag_service.py`)

**New Functions:**

1. **`normalize_skills(skills_string)`**
   - Parses skills from CSV column (handles comma and space separators)
   - Normalizes: lowercase, trims whitespace, removes duplicates
   - Returns: Set of normalized skill strings
   - Handles null/empty values gracefully

2. **`extract_student_skills(resume_text)`**
   - Tokenizes resume text into individual words
   - Extracts only alphanumeric tokens
   - Converts to lowercase for case-insensitive matching
   - Returns: Set of student skills from resume

3. **`calculate_missing_skills(required_skills, student_skills)`**
   - Performs set difference: required - student
   - Returns sorted list of missing skills
   - Handles empty sets appropriately

**Enhanced Endpoint:**

`POST /recommend-internships`
- Input: Resume text + Knowledge base
- Processing:
  - Extracts student skills once
  - For each KB entry:
    - Normalizes required skills
    - Calculates missing skills
    - Includes in response
- Output: 
  ```json
  {
    "recommendations": [
      {
        "role": "AI Research Intern",
        "score": 0.7234,
        "missing_skills": ["tensorflow", "keras", "docker"]
      },
      ...
    ]
  }
  ```

#### B. Backend Route (`routes/recommendations.js`)

No changes required - automatically passes through `missing_skills` from RAG service to frontend.

#### C. Frontend Component (`src/pages/student/recommendations.tsx`)

**Type Definition:**
```typescript
interface Role {
  role: string;
  score: number;
  missing_skills: string[];
}
```

**UI Features:**
- **Skill Gap Section** for each recommended role
- **visual indicators:**
  - Missing skills displayed as yellow badges
  - "✓ You match all required skills" if no gaps
- **Improved layout:**
  - Better spacing and hierarchy
  - Score displayed as percentage
  - Bordered cards for visual separation

## Data Processing

### Skill Normalization Process

**Input:** `"Python sklearn pandas numpy data cleaning eda statistics probability visualization PowerBI tableau feature engineering"`

**Process:**
1. Split by spaces and commas: `['Python', 'sklearn', 'pandas', ...]`
2. Lowercase: `['python', 'sklearn', 'pandas', ...]`
3. Trim whitespace: (already done)
4. Remove empty strings: (already filtered)
5. Create set (deduplicates): `{'python', 'sklearn', 'pandas', ...}`

**Output:** Set of normalized skills

### Resume Tokenization Process

**Input:** Resume PDF text:
```
"Experienced Python developer with 2 years in machine learning. 
Skills: Python, TensorFlow, scikit-learn, Pandas, SQL..."
```

**Process:**
1. Extract text from PDF
2. Convert to lowercase
3. Tokenize into words: `['experienced', 'python', 'developer', ...]`
4. Keep only alphanumeric: `['experienced', 'python', 'developer', ...]`
5. Create set: `{'experienced', 'python', 'developer', ...}`

**Output:** Set of student skills

### Skill Comparison

**Required:** `{'python', 'sklearn', 'pandas', 'numpy', 'tensorflow', 'keras'}`
**Student:** `{'python', 'sklearn', 'pandas', 'sql', 'java'}`
**Missing:** `{'numpy', 'tensorflow', 'keras'}`

## API Response Format

```json
{
  "roles": [
    {
      "role": "Machine Learning Intern",
      "score": 0.8456,
      "missing_skills": ["tensorflow", "keras", "docker"]
    },
    {
      "role": "Data Science Intern", 
      "score": 0.7234,
      "missing_skills": ["powerbi", "spark"]
    },
    {
      "role": "AI Research Intern",
      "score": 0.6912,
      "missing_skills": []
    }
  ],
  "internships": [...]
}
```

## UI Display

### Recommended Roles Section

```
┌─ Machine Learning Intern
│  Match Score: 84.6%
│  Skills Gap:
│  [tensorflow] [keras] [docker]
│
├─ Data Science Intern
│  Match Score: 72.3%
│  Skills Gap:
│  [powerbi] [spark]
│
└─ AI Research Intern
   Match Score: 69.1%
   Skills Gap:
   ✓ You match all required skills
```

## Implementation Rules

✅ **Implemented:**
- [x] Case-insensitive comparison
- [x] Null/empty value handling
- [x] Duplicate skill removal
- [x] Multiple separator support (comma, space)
- [x] Sorted output for consistency
- [x] TF-IDF relevance scoring maintained
- [x] Zero-length lists for perfect matches

## Testing

### Test Case 1: Full Skill Match
- Resume contains: "Python Django REST framework PostgreSQL"
- Role requires: "python django rest postgresql"
- Expected: `missing_skills: []` → "✓ You match all required skills"

### Test Case 2: Partial Match
- Resume contains: "Python Pandas NumPy SQL"
- Role requires: "python pandas numpy tensorflow keras sql"
- Expected: `missing_skills: ["tensorflow", "keras"]`

### Test Case 3: No Match
- Resume contains: "Java C++ C#"
- Role requires: "python tensorflow pytorch sklearn"
- Expected: `missing_skills: ["python", "tensorflow", "pytorch", "sklearn"]`

## Files Modified

1. **`python-rag-service/rag_service.py`**
   - Added skill normalization functions
   - Enhanced recommendation endpoint
   - Added missing_skills calculation

2. **`src/pages/student/recommendations.tsx`**
   - Added Role interface with missing_skills
   - Enhanced UI with skill gap section
   - Added visual badges for missing skills
   - Improved layout and styling

## Running the Feature

### Prerequisites
- All three services running:
  ```bash
  # Terminal 1: RAG Service
  py -m uvicorn rag_service:app --app-dir python-rag-service --host 127.0.0.1 --port 8000
  
  # Terminal 2: Backend
  npm run server
  
  # Terminal 3: Frontend  
  npm run dev
  ```

### User Flow
1. Student logs in to dashboard
2. Navigate to "AI Recommendations" page
3. Upload their resume (PDF format)
4. System analyzes resume and displays:
   - Matched internship roles with scores
   - Skills gap for each role
   - Matching internships available

## Limitations & Future Improvements

### Current Limitations
- Skill matching is lexical (word-based), not semantic
- Acronyms not handled (e.g., "NLP" vs "Natural Language Processing")
- Singular/plural forms not normalized (e.g., "test" vs "tests")

### Potential Enhancements
1. **Semantic Skill Matching**
   - Use word embeddings or synonyms
   - Map similar skills (e.g., "JS" → "JavaScript")

2. **Skill Proficiency Levels**
   - Add beginner/intermediate/advanced levels
   - Track skill depth from resume context

3. **Learning Path Recommendations**
   - Suggest online courses for missing skills
   - Prioritize up-skilling opportunities

4. **Historical Tracking**
   - Store skill assessments over time
   - Show improvement progress

## Success Metrics

- ✅ Missing skills correctly identified
- ✅ UI displays skill gaps clearly
- ✅ Case-insensitive matching works
- ✅ Handles edge cases (null, empty, duplicates)
- ✅ Maintains TF-IDF scoring
- ✅ All services integration seamless
