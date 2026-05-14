"""
Skill Gap Analyzer Test Suite
Demonstrates the skill gap analyzer feature with sample data
"""

import requests
import json

# RAG Service URL
RAG_SERVICE_URL = "http://127.0.0.1:8000"

def test_skill_gap_analyzer():
    """Test the skill gap analyzer with sample resume and knowledge base"""
    
    print("=" * 80)
    print("SKILL GAP ANALYZER - TEST SUITE")
    print("=" * 80)
    
    # Sample Resume (simulating extracted PDF text)
    sample_resume = """
    JOHN DOE
    Email: john@example.com | Phone: (555) 123-4567
    
    PROFESSIONAL SUMMARY
    Experienced software developer with 3 years in data science and machine learning.
    Proficient in Python, data analysis, and building predictive models.
    
    TECHNICAL SKILLS
    - Programming: Python, SQL, JavaScript, HTML, CSS
    - Data Analysis: Pandas, NumPy, Matplotlib, Scikit-learn
    - Databases: PostgreSQL, MongoDB
    - Tools: Git, Jupyter, VS Code
    - Statistics: Statistical Analysis, Probability, A/B Testing
    
    EXPERIENCE
    Senior Python Developer - TechCorp (2022-Present)
    - Developed data pipelines using Python and Pandas
    - Built machine learning models with scikit-learn
    - Performed EDA and statistical analysis
    - Collaborated with teams using Git and Agile
    
    Data Analyst - DataSolutions (2021-2022)
    - Analyzed data using Python and SQL
    - Created visualizations with Matplotlib
    - Developed statistical models
    
    EDUCATION
    Bachelor of Science in Computer Science
    University of Technology (2021)
    GPA: 3.8/4.0
    
    PROJECTS
    - Stock Price Prediction: Built ML model using scikit-learn, achieved 85% accuracy
    - Customer Segmentation: Used clustering algorithms on customer data
    
    CERTIFICATIONS
    - Machine Learning Specialization (Coursera)
    - Data Science with Python (DataCamp)
    """
    
    # Sample Knowledge Base (from CSV)
    knowledge_base = [
        {
            "role": "Machine Learning Intern",
            "skills": "python sklearn pandas numpy scipy statistics sql data visualization feature engineering model evaluation regression classification clustering"
        },
        {
            "role": "Data Science Intern",
            "skills": "python pandas numpy sql data visualization statistics probability tableau powerbi feature engineering data cleaning eda"
        },
        {
            "role": "AI Research Intern",
            "skills": "python machine learning deep learning tensorflow pytorch keras pandas numpy scipy statistics sql data visualization feature engineering"
        },
        {
            "role": "Data Engineer Intern",
            "skills": "python sql hadoop spark mapreduce distributed systems data pipeline etl design patterns databases performance optimization"
        }
    ]
    
    # Prepare request payload
    payload = {
        "resume_text": sample_resume,
        "internship_kb": knowledge_base,
        "top_k": 4
    }
    
    print("\n📋 TEST INPUT")
    print("-" * 80)
    print(f"Resume Excerpt: {sample_resume[:200]}...")
    print(f"\nKnowledge Base: {len(knowledge_base)} roles loaded")
    print(f"Request: Recommend top {payload['top_k']} roles")
    
    # Call RAG Service
    print("\n🔄 CALLING RAG SERVICE...")
    print("-" * 80)
    
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
        
        print(f"✅ Success! Received {len(recommendations)} recommendations\n")
        
        # Display Results
        print("📊 RECOMMENDATIONS WITH SKILL GAPS")
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
                print(f"      ✓ You match all required skills!")
        
        # Summary Statistics
        print("\n" + "=" * 80)
        print("📈 ANALYSIS SUMMARY")
        print("-" * 80)
        total_missing = sum(len(r.get("missing_skills", [])) for r in recommendations)
        perfect_matches = sum(1 for r in recommendations if len(r.get("missing_skills", [])) == 0)
        
        print(f"Total Recommendations: {len(recommendations)}")
        print(f"Perfect Skill Matches: {perfect_matches}")
        print(f"Total Missing Skills Across All Roles: {total_missing}")
        print(f"Average Skills Gap per Role: {total_missing / len(recommendations):.1f}" if recommendations else "N/A")
        
        # Skill Gap Categories
        print("\n🎯 SKILL GAP BY CATEGORY")
        print("-" * 80)
        
        all_missing = set()
        for rec in recommendations:
            all_missing.update(rec.get("missing_skills", []))
        
        # Categorize skills (simple heuristic)
        ml_skills = {s for s in all_missing if any(x in s for x in ['tensor', 'pytorch', 'keras', 'deep', 'neural', 'learning'])}
        data_skills = {s for s in all_missing if any(x in s for x in ['tableau', 'powerbi', 'spark', 'hadoop', 'etl', 'pipeline'])}
        infra_skills = {s for s in all_missing if any(x in s for x in ['docker', 'kubernetes', 'hadoop', 'spark', 'distributed'])}
        other_skills = all_missing - ml_skills - data_skills - infra_skills
        
        if ml_skills:
            print(f"🤖 ML/Deep Learning: {', '.join(sorted(ml_skills))}")
        if data_skills:
            print(f"📊 Data Tools: {', '.join(sorted(data_skills))}")
        if infra_skills:
            print(f"⚙️  Infrastructure: {', '.join(sorted(infra_skills))}")
        if other_skills:
            print(f"📚 Other: {', '.join(sorted(other_skills))}")
        
        print("\n" + "=" * 80)
        print("✅ TEST COMPLETED SUCCESSFULLY")
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
    success = test_skill_gap_analyzer()
    exit(0 if success else 1)
