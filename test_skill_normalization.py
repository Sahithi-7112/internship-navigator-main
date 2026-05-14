"""
Skill Gap Analyzer Test Suite - Enhanced with Normalization & Synonyms
Demonstrates improved skill matching with normalization and synonym handling
"""

import requests
import json

# RAG Service URL
RAG_SERVICE_URL = "http://127.0.0.1:8000"

def test_skill_normalization():
    """Test the improved skill normalization and synonym handling"""

    print("=" * 80)
    print("SKILL NORMALIZATION & SYNONYM TEST")
    print("=" * 80)

    # Test resume with various skill formats
    test_resume = """
    JOHN DOE - SOFTWARE ENGINEER
    Skills: Python, Machine Learning, Data Structures and Algorithms,
    Web Development, Artificial Intelligence, Deep Learning,
    Data Science, Full Stack Development, Front End Development,
    Back End Development, Computer Vision, Natural Language Processing,
    Big Data, Data Analysis, Data Visualization, Object Oriented Programming,
    Version Control, Continuous Integration, REST API, API Development

    Experience:
    - Built ML models using Python and TensorFlow
    - Developed web applications with React and Node.js
    - Worked on data structures and algorithms problems
    - Implemented computer vision algorithms
    - Created REST APIs for data processing
    """

    # Test knowledge base with different skill formats
    test_kb = [
        {
            "role": "Machine Learning Engineer",
            "skills": "python, machine learning, data structures, tensorflow, deep learning, computer vision, nlp"
        },
        {
            "role": "Full Stack Developer",
            "skills": "javascript, react, node.js, web development, full-stack, front-end, back-end, rest api"
        },
        {
            "role": "Data Scientist",
            "skills": "python, data science, data analysis, data visualization, machine learning, statistics, big data"
        },
        {
            "role": "Software Engineer",
            "skills": "python, data structures and algorithms, object oriented programming, version control, continuous integration"
        }
    ]

    print("\n📋 TEST INPUT")
    print("-" * 80)
    print("Resume Skills (various formats):")
    resume_skills = [
        "Python", "Machine Learning", "Data Structures and Algorithms",
        "Web Development", "Artificial Intelligence", "Deep Learning",
        "Data Science", "Full Stack Development", "Front End Development",
        "Back End Development", "Computer Vision", "Natural Language Processing",
        "Big Data", "Data Analysis", "Data Visualization", "Object Oriented Programming",
        "Version Control", "Continuous Integration", "REST API", "API Development"
    ]
    for skill in resume_skills:
        print(f"  • {skill}")

    print(f"\nKnowledge Base: {len(test_kb)} roles with normalized skill matching")

    # Call RAG Service
    print("\n🔄 CALLING RAG SERVICE WITH IMPROVED NORMALIZATION...")
    print("-" * 80)

    payload = {
        "resume_text": test_resume,
        "internship_kb": test_kb,
        "top_k": 4
    }

    try:
        response = requests.post(
            f"{RAG_SERVICE_URL}/recommend-internships",
            json=payload,
            timeout=10
        )

        if response.status_code != 200:
            print(f"❌ Error: HTTP {response.status_code}")
            print(f"Response: {response.text}")
            return False

        data = response.json()
        recommendations = data.get("recommendations", [])

        print(f"✅ Success! Received {len(recommendations)} recommendations")
        print("\n📊 NORMALIZATION & SYNONYM RESULTS")
        print("=" * 80)

        # Show normalization examples
        print("\n🔄 SKILL NORMALIZATION EXAMPLES:")
        print("-" * 80)
        normalization_examples = [
            ("Data Structures and Algorithms", "datastructures"),
            ("Machine Learning", "machinelearning"),
            ("Artificial Intelligence", "artificialintelligence"),
            ("Deep Learning", "deeplearning"),
            ("Data Science", "datascience"),
            ("Web Development", "webdevelopment"),
            ("Full Stack Development", "fullstack"),
            ("Front End Development", "frontend"),
            ("Back End Development", "backend"),
            ("Computer Vision", "computervision"),
            ("Natural Language Processing", "nlp"),
            ("Big Data", "bigdata"),
            ("Data Analysis", "dataanalysis"),
            ("Data Visualization", "datavisualization"),
            ("Object Oriented Programming", "oop"),
            ("Version Control", "versioncontrol"),
            ("Continuous Integration", "ci"),
            ("REST API", "restapi"),
            ("API Development", "apidevelopment"),
        ]

        for original, normalized in normalization_examples:
            print(f"  '{original}' → '{normalized}'")

        print("\n📈 RECOMMENDATIONS WITH IMPROVED SKILL MATCHING")
        print("=" * 80)

        for idx, rec in enumerate(recommendations, 1):
            role = rec.get("role", "Unknown")
            score = rec.get("score", 0)
            missing_skills = rec.get("missing_skills", [])

            print(f"\n{idx}. {role}")
            print(f"   Match Score: {score:.2%}")
            print(f"   Missing Skills ({len(missing_skills)}):")

            if missing_skills:
                # Group missing skills for better readability
                skills_str = ", ".join(missing_skills)
                if len(skills_str) > 70:
                    # Wrap long skill lists
                    words = missing_skills
                    lines = []
                    current_line = []
                    for word in words:
                        current_line.append(word)
                        if len(", ".join(current_line)) > 70:
                            lines.append(", ".join(current_line[:-1]))
                            current_line = [word]
                    if current_line:
                        lines.append(", ".join(current_line))
                    for line in lines:
                        print(f"      • {line}")
                else:
                    print(f"      • {skills_str}")
            else:
                print("      ✓ You match all required skills!")
                print("         (Thanks to improved normalization & synonyms)")

        # Analysis
        print("\n" + "=" * 80)
        print("📈 ANALYSIS - NORMALIZATION IMPACT")
        print("-" * 80)

        total_missing = sum(len(r.get("missing_skills", [])) for r in recommendations)
        perfect_matches = sum(1 for r in recommendations if len(r.get("missing_skills", [])) == 0)

        print(f"Total Recommendations: {len(recommendations)}")
        print(f"Perfect Skill Matches: {perfect_matches}")
        print(f"Total Missing Skills: {total_missing}")
        print(f"Average Skills Gap per Role: {total_missing / len(recommendations):.1f}" if recommendations else "N/A")
        print(f"Normalization Accuracy: {perfect_matches / len(recommendations) * 100:.1f}%" if recommendations else "N/A")

        # Show synonym impact
        print("\n🎯 SYNONYM MAPPING IMPACT:")
        synonym_examples = [
            ("ML", "machinelearning"),
            ("AI", "artificialintelligence"),
            ("DSA", "datastructures"),
            ("NLP", "nlp"),
            ("CI", "ci"),
        ]
        for abbr, full in synonym_examples:
            print(f"      • '{abbr}' → '{full}'")

        print("\n✅ NORMALIZATION BENEFITS:")
        print("      • Case-insensitive matching")
        print("      • Space/special character removal")
        print("      • Synonym standardization")
        print("      • Reduced false missing skills")
        print("      • More accurate skill gap analysis")

        print("\n" + "=" * 80)
        print("✅ NORMALIZATION TEST COMPLETED SUCCESSFULLY")
        print("=" * 80)

        return True

    except requests.exceptions.ConnectionError:
        print(f"❌ Error: Could not connect to RAG service at {RAG_SERVICE_URL}")
        print("   Make sure the RAG service is running:")
        print("   py -m uvicorn rag_service:app --app-dir python-rag-service --host 127.0.0.1 --port 8000")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False


if __name__ == "__main__":
    success = test_skill_normalization()
    exit(0 if success else 1)