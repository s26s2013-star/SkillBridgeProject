import pymongo
from pymongo.errors import ConnectionFailure
import logging
import pandas as pd
import sys
import os
import certifi 
ca = certifi.where()
# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Placeholder for the MongoDB connection string
MONGO_URI = "mongodb+srv://manaralnabhani95_db_user:B%26techp5@cluster0.wjwh5vq.mongodb.net/SkillBridgeDB?appName=Cluster0"

def get_db():
    try:
        client = pymongo.MongoClient(MONGO_URI, tlsCAFile=ca)
        # Verify connection
        client.admin.command('ping')
        db = client["SkillBridgeDB"]
        return db
    except ConnectionFailure as e:
        logger.error(f"Could not connect to MongoDB: {e}")
        raise

def seed_skills():
    db = get_db()
    skills_collection = db["skills"]
    
    # 30 skills covering the specified majors:
    # Information System, Software Engineering, Network Computing, Web & Mobile Technologies, Cloud Computing, Data Science & AI, Cyber Security
    skills_data = [
        {
            "major": "Cloud Computing",
            "skill_name": "Cloud Platforms",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of Cloud Platforms.",
            "intermediate_criteria": "Can apply Cloud Platforms in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of Cloud Platforms.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on Cloud Platforms to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
        {
            "major": "Cloud Computing",
            "skill_name": "Virtualization",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of Virtualization.",
            "intermediate_criteria": "Can apply Virtualization in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of Virtualization.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on Virtualization to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
        {
            "major": "Cloud Computing",
            "skill_name": "Containers",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of Containers.",
            "intermediate_criteria": "Can apply Containers in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of Containers.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on Containers to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
        {
            "major": "Cloud Computing",
            "skill_name": "Deployment & CI/CD",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of Deployment & CI/CD.",
            "intermediate_criteria": "Can apply Deployment & CI/CD in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of Deployment & CI/CD.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on Deployment & CI/CD to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
        {
            "major": "Cloud Computing",
            "skill_name": "Cloud Security",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of Cloud Security.",
            "intermediate_criteria": "Can apply Cloud Security in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of Cloud Security.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on Cloud Security to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
        {
            "major": "Cloud Computing",
            "skill_name": "Distributed Systems",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of Distributed Systems.",
            "intermediate_criteria": "Can apply Distributed Systems in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of Distributed Systems.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on Distributed Systems to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
        {
            "major": "Cloud Computing",
            "skill_name": "Scalability Concepts",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of Scalability Concepts.",
            "intermediate_criteria": "Can apply Scalability Concepts in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of Scalability Concepts.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on Scalability Concepts to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
        {
            "major": "Cyber Security",
            "skill_name": "Network Security",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of Network Security.",
            "intermediate_criteria": "Can apply Network Security in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of Network Security.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on Network Security to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
        {
            "major": "Cyber Security",
            "skill_name": "Cryptography",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of Cryptography.",
            "intermediate_criteria": "Can apply Cryptography in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of Cryptography.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on Cryptography to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
        {
            "major": "Cyber Security",
            "skill_name": "Ethical Hacking / Pen Testing",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of Ethical Hacking / Pen Testing.",
            "intermediate_criteria": "Can apply Ethical Hacking / Pen Testing in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of Ethical Hacking / Pen Testing.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on Ethical Hacking / Pen Testing to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
        {
            "major": "Cyber Security",
            "skill_name": "Risk Assessment",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of Risk Assessment.",
            "intermediate_criteria": "Can apply Risk Assessment in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of Risk Assessment.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on Risk Assessment to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
        {
            "major": "Cyber Security",
            "skill_name": "Security Policies & Governance",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of Security Policies & Governance.",
            "intermediate_criteria": "Can apply Security Policies & Governance in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of Security Policies & Governance.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on Security Policies & Governance to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
        {
            "major": "Cyber Security",
            "skill_name": "Incident Response",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of Incident Response.",
            "intermediate_criteria": "Can apply Incident Response in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of Incident Response.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on Incident Response to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
        {
            "major": "Cyber Security",
            "skill_name": "Vulnerability Analysis",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of Vulnerability Analysis.",
            "intermediate_criteria": "Can apply Vulnerability Analysis in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of Vulnerability Analysis.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on Vulnerability Analysis to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
        {
            "major": "Cyber Security",
            "skill_name": "Authentication & Access Control",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of Authentication & Access Control.",
            "intermediate_criteria": "Can apply Authentication & Access Control in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of Authentication & Access Control.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on Authentication & Access Control to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
        {
            "major": "Data Science & AI",
            "skill_name": "Python / R Programming",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of Python / R Programming.",
            "intermediate_criteria": "Can apply Python / R Programming in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of Python / R Programming.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on Python / R Programming to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
        {
            "major": "Data Science & AI",
            "skill_name": "Data Analysis",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of Data Analysis.",
            "intermediate_criteria": "Can apply Data Analysis in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of Data Analysis.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on Data Analysis to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
        {
            "major": "Data Science & AI",
            "skill_name": "Machine Learning",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of Machine Learning.",
            "intermediate_criteria": "Can apply Machine Learning in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of Machine Learning.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on Machine Learning to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
        {
            "major": "Data Science & AI",
            "skill_name": "Deep Learning Basics",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of Deep Learning Basics.",
            "intermediate_criteria": "Can apply Deep Learning Basics in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of Deep Learning Basics.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on Deep Learning Basics to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
        {
            "major": "Data Science & AI",
            "skill_name": "Data Visualization",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of Data Visualization.",
            "intermediate_criteria": "Can apply Data Visualization in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of Data Visualization.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on Data Visualization to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
        {
            "major": "Data Science & AI",
            "skill_name": "Statistics & Probability",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of Statistics & Probability.",
            "intermediate_criteria": "Can apply Statistics & Probability in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of Statistics & Probability.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on Statistics & Probability to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
        {
            "major": "Data Science & AI",
            "skill_name": "SQL & Data Handling",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of SQL & Data Handling.",
            "intermediate_criteria": "Can apply SQL & Data Handling in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of SQL & Data Handling.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on SQL & Data Handling to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
        {
            "major": "Data Science & AI",
            "skill_name": "Model Evaluation",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of Model Evaluation.",
            "intermediate_criteria": "Can apply Model Evaluation in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of Model Evaluation.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on Model Evaluation to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
        {
            "major": "Information System",
            "skill_name": "Database Management",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of Database Management.",
            "intermediate_criteria": "Can apply Database Management in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of Database Management.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on Database Management to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
        {
            "major": "Information System",
            "skill_name": "Business Process Analysis",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of Business Process Analysis.",
            "intermediate_criteria": "Can apply Business Process Analysis in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of Business Process Analysis.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on Business Process Analysis to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
        {
            "major": "Information System",
            "skill_name": "ERP Systems",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of ERP Systems.",
            "intermediate_criteria": "Can apply ERP Systems in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of ERP Systems.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on ERP Systems to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
        {
            "major": "Information System",
            "skill_name": "IT Project Management",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of IT Project Management.",
            "intermediate_criteria": "Can apply IT Project Management in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of IT Project Management.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on IT Project Management to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
        {
            "major": "Information System",
            "skill_name": "Systems Analysis & Design",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of Systems Analysis & Design.",
            "intermediate_criteria": "Can apply Systems Analysis & Design in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of Systems Analysis & Design.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on Systems Analysis & Design to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
        {
            "major": "Information System",
            "skill_name": "Decision Support Systems",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of Decision Support Systems.",
            "intermediate_criteria": "Can apply Decision Support Systems in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of Decision Support Systems.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on Decision Support Systems to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
        {
            "major": "Network Computing",
            "skill_name": "Networking Fundamentals",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of Networking Fundamentals.",
            "intermediate_criteria": "Can apply Networking Fundamentals in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of Networking Fundamentals.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on Networking Fundamentals to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
        {
            "major": "Network Computing",
            "skill_name": "Routing & Switching",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of Routing & Switching.",
            "intermediate_criteria": "Can apply Routing & Switching in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of Routing & Switching.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on Routing & Switching to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
        {
            "major": "Network Computing",
            "skill_name": "Network Configuration",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of Network Configuration.",
            "intermediate_criteria": "Can apply Network Configuration in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of Network Configuration.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on Network Configuration to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
        {
            "major": "Network Computing",
            "skill_name": "Troubleshooting Networks",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of Troubleshooting Networks.",
            "intermediate_criteria": "Can apply Troubleshooting Networks in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of Troubleshooting Networks.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on Troubleshooting Networks to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
        {
            "major": "Network Computing",
            "skill_name": "Network Security Basics",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of Network Security Basics.",
            "intermediate_criteria": "Can apply Network Security Basics in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of Network Security Basics.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on Network Security Basics to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
        {
            "major": "Network Computing",
            "skill_name": "Wireless Networks",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of Wireless Networks.",
            "intermediate_criteria": "Can apply Wireless Networks in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of Wireless Networks.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on Wireless Networks to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
        {
            "major": "Network Computing",
            "skill_name": "Protocol Analysis",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of Protocol Analysis.",
            "intermediate_criteria": "Can apply Protocol Analysis in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of Protocol Analysis.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on Protocol Analysis to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
        {
            "major": "Software Engineering",
            "skill_name": "Programming",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of Programming.",
            "intermediate_criteria": "Can apply Programming in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of Programming.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on Programming to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
        {
            "major": "Software Engineering",
            "skill_name": "Data Structures & Algorithms",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of Data Structures & Algorithms.",
            "intermediate_criteria": "Can apply Data Structures & Algorithms in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of Data Structures & Algorithms.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on Data Structures & Algorithms to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
        {
            "major": "Software Engineering",
            "skill_name": "Software Design Patterns",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of Software Design Patterns.",
            "intermediate_criteria": "Can apply Software Design Patterns in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of Software Design Patterns.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on Software Design Patterns to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
        {
            "major": "Software Engineering",
            "skill_name": "OOP",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of OOP.",
            "intermediate_criteria": "Can apply OOP in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of OOP.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on OOP to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
        {
            "major": "Software Engineering",
            "skill_name": "Git",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of Git.",
            "intermediate_criteria": "Can apply Git in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of Git.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on Git to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
        {
            "major": "Software Engineering",
            "skill_name": "Testing",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of Testing.",
            "intermediate_criteria": "Can apply Testing in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of Testing.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on Testing to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
        {
            "major": "Software Engineering",
            "skill_name": "Software Architecture",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of Software Architecture.",
            "intermediate_criteria": "Can apply Software Architecture in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of Software Architecture.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on Software Architecture to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
        {
            "major": "Software Engineering",
            "skill_name": "Debugging & Problem Solving",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of Debugging & Problem Solving.",
            "intermediate_criteria": "Can apply Debugging & Problem Solving in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of Debugging & Problem Solving.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on Debugging & Problem Solving to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
        {
            "major": "Web & Mobile Technologies",
            "skill_name": "HTML",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of HTML.",
            "intermediate_criteria": "Can apply HTML in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of HTML.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on HTML to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
        {
            "major": "Web & Mobile Technologies",
            "skill_name": "CSS",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of CSS.",
            "intermediate_criteria": "Can apply CSS in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of CSS.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on CSS to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
        {
            "major": "Web & Mobile Technologies",
            "skill_name": "JavaScript",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of JavaScript.",
            "intermediate_criteria": "Can apply JavaScript in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of JavaScript.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on JavaScript to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
        {
            "major": "Web & Mobile Technologies",
            "skill_name": "React",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of React.",
            "intermediate_criteria": "Can apply React in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of React.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on React to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
        {
            "major": "Web & Mobile Technologies",
            "skill_name": "Backend/APIs",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of Backend/APIs.",
            "intermediate_criteria": "Can apply Backend/APIs in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of Backend/APIs.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on Backend/APIs to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
        {
            "major": "Web & Mobile Technologies",
            "skill_name": "SQL/NoSQL",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of SQL/NoSQL.",
            "intermediate_criteria": "Can apply SQL/NoSQL in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of SQL/NoSQL.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on SQL/NoSQL to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
        {
            "major": "Web & Mobile Technologies",
            "skill_name": "Mobile Development Basics",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of Mobile Development Basics.",
            "intermediate_criteria": "Can apply Mobile Development Basics in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of Mobile Development Basics.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on Mobile Development Basics to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
        {
            "major": "Web & Mobile Technologies",
            "skill_name": "REST APIs",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of REST APIs.",
            "intermediate_criteria": "Can apply REST APIs in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of REST APIs.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on REST APIs to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
        {
            "major": "Web & Mobile Technologies",
            "skill_name": "UI/UX Basics",
            "category": "Technical",
            "key_components": ["Core Principles", "Practical Application", "Troubleshooting"],
            "beginner_criteria": "Understands basic concepts and terminology of UI/UX Basics.",
            "intermediate_criteria": "Can apply UI/UX Basics in standard scenarios and solve common problems.",
            "advanced_criteria": "Demonstrates advanced expertise and architectural understanding of UI/UX Basics.",
            "assessment_type": "code",
            "assessment_description": "Complete a practical assignment focusing on UI/UX Basics to demonstrate your knowledge.",
            "source": "Curriculum Mapping"
        },
    ]

    try:
        if skills_collection.count_documents({}) == 0:
            result = skills_collection.insert_many(skills_data)
            logger.info(f"Successfully seeded {len(result.inserted_ids)} skills into the database.")
        else:
            logger.info("skills collection already seeded, skipping to avoid duplicates.")
    except Exception as e:
        logger.error(f"Failed to seed skills collection: {e}")
        raise

def seed_technical_questions():
    db = get_db()
    tech_qs_collection = db["technical_questions"]
    
    questions_data = [
        {
            "major": "Web & Mobile Technologies",
            "skill_name": "React",
            "question_number": 1,
            "question_text": "What is the primary purpose of the Virtual DOM in React?",
            "options": [
                {"option_text": "It allows React to compute differences in memory and apply only the minimal necessary updates to the actual DOM.", "score": 3},
                {"option_text": "It directly updates the browser's DOM immediately after every state change.", "score": 1},
                {"option_text": "It creates a lightweight copy of the DOM to batch updates, but still relies on expensive frequent repaints.", "score": 2}
            ]
        },
        {
            "major": "Web & Mobile Technologies",
            "skill_name": "React",
            "question_number": 2,
            "question_text": "Which of the following best describes the use of the useEffect hook?",
            "options": [
                {"option_text": "It replaces the need for standard state management and holds all variables.", "score": 1},
                {"option_text": "It handles side effects such as data fetching or subscriptions, running asynchronously after the render.", "score": 3},
                {"option_text": "It is used for side effects, but it runs synchronously blocking the browser paint.", "score": 2}
            ]
        },
        {
            "major": "Web & Mobile Technologies",
            "skill_name": "React",
            "question_number": 3,
            "question_text": "How does React handle state updates inside standard event handlers?",
            "options": [
                {"option_text": "State updates are batched, but only if they are inside asynchronous callbacks like setTimeout.", "score": 2},
                {"option_text": "State updates are applied immediately one by one, causing multiple re-renders.", "score": 1},
                {"option_text": "State updates are batched automatically, resulting in a single re-render for performance.", "score": 3}
            ]
        },
        {
            "major": "Cloud Computing",
            "skill_name": "Cloud Platforms",
            "question_number": 1,
            "question_text": "A company wants virtual servers, storage, and networking while keeping control over the operating system and deployed software. Which cloud service model best fits this need?",
            "options": [
                {"option_text": "Using infrastructure-level services that provide control over OS and resources", "score": 3},
                {"option_text": "Using cloud services without managing infrastructure details", "score": 1},
                {"option_text": "Using a platform that allows application deployment without managing infrastructure", "score": 2}
            ]
        },
        {
            "major": "Cloud Computing",
            "skill_name": "Cloud Platforms",
            "question_number": 2,
            "question_text": "Which scenario most clearly represents public cloud usage?",
            "options": [
                {"option_text": "Using computing resources inside an organization only", "score": 1},
                {"option_text": "Using scalable cloud services provided by third-party providers over the internet", "score": 3},
                {"option_text": "Accessing shared computing services over the internet", "score": 2}
            ]
        },
        {
            "major": "Cloud Computing",
            "skill_name": "Cloud Platforms",
            "question_number": 3,
            "question_text": "Which benefit is most directly associated with cloud platforms during peak traffic periods?",
            "options": [
                {"option_text": "Adjusting resources when needed", "score": 2},
                {"option_text": "Handling workloads with fixed resources", "score": 1},
                {"option_text": "Automatically scaling resources based on demand", "score": 3}
            ]
        },
        {
            "major": "Cloud Computing",
            "skill_name": "Virtualization",
            "question_number": 1,
            "question_text": "What is the main purpose of virtualization in modern infrastructure?",
            "options": [
                {"option_text": "Running isolated virtual systems efficiently on shared physical hardware", "score": 3},
                {"option_text": "Improving system performance in general", "score": 1},
                {"option_text": "Running multiple systems on shared hardware", "score": 2}
            ]
        },
        {
            "major": "Cloud Computing",
            "skill_name": "Virtualization",
            "question_number": 2,
            "question_text": "Which software layer is responsible for creating and managing virtual machines?",
            "options": [
                {"option_text": "A general system software layer", "score": 1},
                {"option_text": "A hypervisor that manages virtual machines and resources", "score": 3},
                {"option_text": "A system layer that manages virtual machines", "score": 2}
            ]
        },
        {
            "major": "Cloud Computing",
            "skill_name": "Virtualization",
            "question_number": 3,
            "question_text": "If a hypervisor runs directly on the hardware rather than on top of a host operating system, it is best classified as:",
            "options": [
                {"option_text": "A Type 1 hypervisor running directly on hardware", "score": 3},
                {"option_text": "A system that depends on an operating system", "score": 1},
                {"option_text": "A system closely interacting with hardware", "score": 2}
            ]
        }
    ]
    
    try:
        # Clear out the temporary documents from the previous step without dropping the collection
        tech_qs_collection.delete_many({})
        
        result = tech_qs_collection.insert_many(questions_data)
        logger.info(f"Successfully seeded {len(result.inserted_ids)} finalized technical questions into the database.")
    except Exception as e:
        logger.error(f"Failed to seed technical_questions collection: {e}")
        raise

def seed_market_data():
    db = get_db()
    job_market_collection = db["job_market"]
    
    try:
        if job_market_collection.count_documents({}) == 0:
            csv_path = os.path.join(os.path.dirname(__file__), 'jobData.csv')
            if not os.path.exists(csv_path):
                logger.error(f"CSV file not found at {csv_path}")
                return
                
            df = pd.read_csv(csv_path, encoding='latin-1')
            
            # Clean data: drop completely empty rows, fill NaNs with empty string
            df = df.dropna(how='all')
            df = df.fillna('')
            
            jobs_data = df.to_dict(orient='records')
            
            if jobs_data:
                result = job_market_collection.insert_many(jobs_data)
                logger.info(f"Successfully seeded {len(result.inserted_ids)} jobs into the job_market collection.")
            else:
                logger.info("CSV was empty, no jobs inserted.")
        else:
            logger.info("job_market collection already seeded, skipping.")
    except Exception as e:
        logger.error(f"Failed to seed job_market collection: {e}")
        raise

if __name__ == "__main__":
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        if command == "skills":
            seed_skills()
        elif command == "jobs":
            seed_market_data()
        elif command == "tech_qs":
            seed_technical_questions()
        elif command == "all":
            seed_skills()
            seed_market_data()
            seed_technical_questions()
        else:
            print("Usage: python database.py [skills|jobs|tech_qs|all]")
    else:
        # Default behavior to avoid regressions
        logger.info("Running general seeder script...")
        seed_skills()
        seed_market_data()
        seed_technical_questions()
