#!/usr/bin/env python3
"""
Skill Gap Analyzer Integration Example
Shows how to integrate skill gap analysis into your application
"""

# ============================================================================
# Example 1: Direct RAG Service Integration
# ============================================================================

import requests
import json

def get_skill_gaps(resume_text, knowledge_base_records, top_k=3):
    """
    Get recommendations with skill gaps from RAG service
    
    Args:
        resume_text: Extracted PDF text
        knowledge_base_records: List of {'role': str, 'skills': str}
        top_k: Number of top recommendations to return
        
    Returns:
        List of dicts with role, score, and missing_skills
    """
    rag_url = "http://127.0.0.1:8000/recommend-internships"
    
    payload = {
        "resume_text": resume_text,
        "internship_kb": knowledge_base_records,
        "top_k": top_k
    }
    
    response = requests.post(rag_url, json=payload)
    response.raise_for_status()
    
    data = response.json()
    return data.get("recommendations", [])


# ============================================================================
# Example 2: Processing Skills Gap Data
# ============================================================================

def analyze_skill_gaps(recommendations):
    """
    Process recommendations to extract insights
    
    Args:
        recommendations: List from get_skill_gaps()
        
    Returns:
        Dict with analysis results
    """
    analysis = {
        "total_roles": len(recommendations),
        "perfect_matches": [],
        "moderate_gaps": [],
        "large_gaps": [],
        "all_missing_skills": set(),
        "average_gap_size": 0
    }
    
    total_skills = 0
    
    for rec in recommendations:
        role = rec.get("role")
        missing = rec.get("missing_skills", [])
        gap_size = len(missing)
        
        analysis["all_missing_skills"].update(missing)
        total_skills += gap_size
        
        if gap_size == 0:
            analysis["perfect_matches"].append(role)
        elif gap_size <= 3:
            analysis["moderate_gaps"].append({
                "role": role,
                "count": gap_size,
                "skills": missing
            })
        else:
            analysis["large_gaps"].append({
                "role": role,
                "count": gap_size,
                "skills": missing
            })
    
    if recommendations:
        analysis["average_gap_size"] = total_skills / len(recommendations)
    
    analysis["all_missing_skills"] = sorted(list(analysis["all_missing_skills"]))
    
    return analysis


# ============================================================================
# Example 3: Categorizing Skills
# ============================================================================

SKILL_CATEGORIES = {
    "Machine Learning": [
        "tensorflow", "keras", "pytorch", "deep", "neural",
        "learning", "model", "training", "prediction"
    ],
    "Data Tools": [
        "tableau", "powerbi", "visualization", "plotting",
        "spark", "hadoop", "etl", "pipeline"
    ],
    "Statistics": [
        "statistics", "probability", "scipy", "statsmodels",
        "hypothesis", "test", "regression", "anova"
    ],
    "Database/SQL": [
        "sql", "database", "mongodb", "postgresql",
        "mysql", "nosql", "query", "orm"
    ],
    "DevOps/Infrastructure": [
        "docker", "kubernetes", "distributed", "systems",
        "deployment", "cloud", "aws", "gcp"
    ]
}

def categorize_missing_skills(missing_skills):
    """
    Categorize missing skills into groups
    
    Args:
        missing_skills: List of skill strings
        
    Returns:
        Dict mapping category to skills in that category
    """
    categorized = {cat: [] for cat in SKILL_CATEGORIES.keys()}
    categorized["Other"] = []
    
    for skill in missing_skills:
        categorized_flag = False
        skill_lower = skill.lower()
        
        for category, keywords in SKILL_CATEGORIES.items():
            if any(kw in skill_lower for kw in keywords):
                categorized[category].append(skill)
                categorized_flag = True
                break
        
        if not categorized_flag:
            categorized["Other"].append(skill)
    
    # Remove empty categories
    return {k: v for k, v in categorized.items() if v}


# ============================================================================
# Example 4: Creating Learning Recommendations
# ============================================================================

LEARNING_RESOURCES = {
    "tensorflow": {
        "type": "Deep Learning Framework",
        "difficulty": "Advanced",
        "resources": [
            {"name": "TensorFlow Official Tutorial", "url": "https://www.tensorflow.org/tutorials"},
            {"name": "Deep Learning Specialization (Coursera)", "url": "https://www.coursera.org/specializations/deep-learning"},
            {"name": "Fast.ai (practical deep learning)", "url": "https://www.fast.ai"}
        ]
    },
    "tableau": {
        "type": "Data Visualization",
        "difficulty": "Beginner",
        "resources": [
            {"name": "Tableau Official Training", "url": "https://www.tableau.com/learn"},
            {"name": "DataCamp Tableau Course", "url": "https://www.datacamp.com/courses/tableau"},
            {"name": "Udemy Tableau Masterclass", "url": "https://www.udemy.com/"}
        ]
    },
    "spark": {
        "type": "Big Data Processing",
        "difficulty": "Intermediate",
        "resources": [
            {"name": "Spark Official Documentation", "url": "https://spark.apache.org/docs/latest/"},
            {"name": "Databricks Academy", "url": "https://academy.databricks.com"},
            {"name": "PySpark Tutorial", "url": "https://spark.apache.org/docs/latest/api/python/"}
        ]
    }
}

def get_learning_path(missing_skills, priority_count=5):
    """
    Generate learning recommendations for missing skills
    
    Args:
        missing_skills: List of missing skill strings
        priority_count: Number of top priority skills to focus on
        
    Returns:
        List of learning recommendations
    """
    recommendations = []
    
    for skill in missing_skills[:priority_count]:
        skill_lower = skill.lower()
        
        # Try to find exact or partial match in resources
        resource = None
        for known_skill, resource_info in LEARNING_RESOURCES.items():
            if known_skill in skill_lower or skill_lower in known_skill:
                resource = {
                    "skill": skill,
                    **resource_info,
                    "priority": "High" if missing_skills.index(skill) < 3 else "Medium"
                }
                break
        
        if resource:
            recommendations.append(resource)
        else:
            # Generic recommendation if skill not found
            recommendations.append({
                "skill": skill,
                "type": "Technical Skill",
                "difficulty": "Intermediate",
                "priority": "Medium",
                "resources": [
                    {"name": f"Search '{skill}' on Udemy", "url": "https://www.udemy.com"},
                    {"name": f"Search '{skill}' on Coursera", "url": "https://www.coursera.org"},
                    {"name": f"GitHub - {skill} awesome list", "url": "https://github.com"}
                ]
            })
    
    return recommendations


# ============================================================================
# Example 5: Complete Workflow
# ============================================================================

def complete_skill_analysis_workflow(resume_text, knowledge_base):
    """
    Complete workflow from resume to skill gap analysis and recommendations
    """
    
    print("=" * 80)
    print("SKILL GAP ANALYSIS WORKFLOW")
    print("=" * 80)
    
    # Step 1: Get recommendations with skill gaps
    print("\n1️⃣ Fetching recommendations with skill gaps...")
    try:
        recommendations = get_skill_gaps(resume_text, knowledge_base, top_k=3)
        print(f"   ✅ Got {len(recommendations)} recommendations")
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return None
    
    # Step 2: Analyze gaps
    print("\n2️⃣ Analyzing skill gaps...")
    analysis = analyze_skill_gaps(recommendations)
    print(f"   • Perfect matches: {len(analysis['perfect_matches'])}")
    print(f"   • Moderate gaps: {len(analysis['moderate_gaps'])}")
    print(f"   • Large gaps: {len(analysis['large_gaps'])}")
    print(f"   • Average gap size: {analysis['average_gap_size']:.1f} skills")
    
    # Step 3: Categorize skills
    print("\n3️⃣ Categorizing missing skills...")
    all_missing = analysis["all_missing_skills"]
    categorized = categorize_missing_skills(all_missing)
    for category, skills in categorized.items():
        print(f"   • {category}: {len(skills)} skills")
    
    # Step 4: Generate learning path
    print("\n4️⃣ Generating learning recommendations...")
    learning_path = get_learning_path(all_missing, priority_count=5)
    for rec in learning_path:
        print(f"   • {rec['skill']} ({rec['type']})")
        print(f"     Priority: {rec['priority']}")
    
    # Step 5: Summary
    print("\n5️⃣ SUMMARY")
    print("   " + "-" * 76)
    
    print("\n   📍 TOP RECOMMENDATIONS:")
    for i, rec in enumerate(recommendations[:3], 1):
        missing_count = len(rec.get("missing_skills", []))
        print(f"   {i}. {rec['role']}")
        print(f"      Score: {rec['score']:.2%} | Missing: {missing_count} skills")
    
    if analysis["perfect_matches"]:
        print(f"\n   ✓ PERFECT MATCH ROLES:")
        for role in analysis["perfect_matches"]:
            print(f"      • {role}")
    
    if categorized:
        print(f"\n   🎯 SKILL GAP CATEGORIES:")
        for category, skills in sorted(categorized.items()):
            print(f"      • {category}: {', '.join(skills[:3])}...")
    
    print("\n" + "=" * 80)
    
    return {
        "recommendations": recommendations,
        "analysis": analysis,
        "learning_path": learning_path,
        "categorized_skills": categorized
    }


# ============================================================================
# Example 6: Frontend Integration (React Example)
# ============================================================================

REACT_COMPONENT_EXAMPLE = """
// src/components/SkillGapCard.tsx

interface SkillGapProps {
  role: string;
  score: number;
  missing_skills: string[];
}

export function SkillGapCard({ role, score, missing_skills }: SkillGapProps) {
  return (
    <div className="border-l-4 border-blue-400 p-4 bg-white">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg">{role}</h3>
          <p className="text-sm text-gray-600">
            Match Score: {(score * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="mt-3">
        <p className="text-sm font-medium">Skills Gap:</p>
        {missing_skills.length > 0 ? (
          <div className="flex flex-wrap gap-2 mt-2">
            {missing_skills.map((skill) => (
              <span
                key={skill}
                className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-green-600 mt-2">
            ✓ You match all required skills
          </p>
        )}
      </div>
    </div>
  );
}
"""


# ============================================================================
# Main Entry Point
# ============================================================================

if __name__ == "__main__":
    # Example usage
    sample_resume = """
    Software developer with 3 years experience in Python and data analysis.
    Skills: Python, Pandas, NumPy, SQL, Git
    """
    
    sample_kb = [
        {
            "role": "Machine Learning Intern",
            "skills": "python sklearn tensorflow keras pandas numpy"
        },
        {
            "role": "Data Science Intern",
            "skills": "python pandas sql tableau powerbi"
        }
    ]
    
    print("Starting complete skill analysis workflow...\n")
    # result = complete_skill_analysis_workflow(sample_resume, sample_kb)
    # Uncommented above line to run the workflow

    print("\n✅ Integration examples ready to use!")
    print("\nIntegration Points:")
    print("1. get_skill_gaps() - Direct RAG service integration")
    print("2. analyze_skill_gaps() - Process recommendations")
    print("3. categorize_missing_skills() - Group skills by type")
    print("4. get_learning_path() - Generate learning recommendations")
    print("5. complete_skill_analysis_workflow() - End-to-end example")
    print("\nReact Component Example:")
    print("- SkillGapCard component for displaying gaps in UI")
