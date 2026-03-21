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
MONGO_URI = "mongodb+srv://Btechp_db_user:0mWTOVX6V0thXvUk@cluster0.ci52bsd.mongodb.net/?retryWrites=true&w=majority&tlsAllowInvalidCertificates=true&appName=Cluster0"

def get_db():
    try:
        client = pymongo.MongoClient(MONGO_URI, tlsCAFile=ca)
        # Verify connection
        client.admin.command('ping')
        db = client["skillbridge"]
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
        # Information System
        {
            "major": "Information System",
            "skill_name": "Systems Analysis",
            "category": "Technical",
            "key_components": ["Requirements Gathering", "Process Modeling", "System Design"],
            "beginner_criteria": "Can assist in gathering requirements and documenting existing systems.",
            "intermediate_criteria": "Capable of leading requirement gathering and modeling standard business processes.",
            "advanced_criteria": "Designs complex system architectures and optimizes enterprise-level processes.",
            "assessment_type": "upload",
            "assessment_description": "Upload a System Requirements Specification (SRS) or a BPMN process model for a library management system.",
            "source": "O*NET"
        },
        {
            "major": "Information System",
            "skill_name": "Database Management",
            "category": "Technical",
            "key_components": ["Data Modeling", "SQL", "Database Optimization"],
            "beginner_criteria": "Can write basic CRUD queries and understand basic relational concepts.",
            "intermediate_criteria": "Can design normalized schemas and optimize complex queries.",
            "advanced_criteria": "Manages enterprise database administration, distributed databases, and performance tuning.",
            "assessment_type": "code",
            "assessment_description": "Write a SQL script to create a normalized database schema for an e-commerce platform, including tables for Users, Orders, and Products.",
            "source": "ESCO"
        },
        {
            "major": "Information System",
            "skill_name": "Business Intelligence",
            "category": "Technical",
            "key_components": ["Data Warehousing", "Reporting", "ETL"],
            "beginner_criteria": "Can create basic reports using BI tools.",
            "intermediate_criteria": "Develops dashboards and builds simple ETL pipelines.",
            "advanced_criteria": "Architects enterprise BI solutions and complex data integration strategies.",
            "assessment_type": "upload",
            "assessment_description": "Upload a sample PowerBI or Tableau dashboard layout (PDF/Image) that analyzes sales trends for the last quarter.",
            "source": "O*NET"
        },
        {
            "major": "Information System",
            "skill_name": "Project Management",
            "category": "Soft",
            "key_components": ["Planning", "Risk Management", "Resource Allocation"],
            "beginner_criteria": "Can track tasks and assist in project documentation.",
            "intermediate_criteria": "Manages small to medium projects independently from start to finish.",
            "advanced_criteria": "Oversees large, complex programs with cross-functional teams and significant budgets.",
            "assessment_type": "upload",
            "assessment_description": "Upload a GANTT chart or Project Plan for a 3-month software development lifecycle.",
            "source": "Bloom's"
        },
        
        # Software Engineering
        {
            "major": "Software Engineering",
            "skill_name": "Object-Oriented Programming",
            "category": "Technical",
            "key_components": ["Encapsulation", "Inheritance", "Polymorphism"],
            "beginner_criteria": "Understands OOP concepts and can write basic classes.",
            "intermediate_criteria": "Applies design patterns and writes modular, maintainable code.",
            "advanced_criteria": "Architects large-scale object-oriented systems with complex abstractions.",
            "assessment_type": "code",
            "assessment_description": "Implement a 'Shape' class hierarchy in Python or Java with inheritance and polymorphism for Circle and Square classes.",
            "source": "ESCO"
        },
        {
            "major": "Software Engineering",
            "skill_name": "Software Testing",
            "category": "Technical",
            "key_components": ["Unit Testing", "Integration Testing", "TDD"],
            "beginner_criteria": "Can write simple unit tests for individual functions.",
            "intermediate_criteria": "Implements integration tests and applies Test-Driven Development (TDD).",
            "advanced_criteria": "Designs automated testing frameworks and complete CI/CD testing pipelines.",
            "assessment_type": "code",
            "assessment_description": "Write unit tests using PyTest or Jest for a function that calculates compound interest over time.",
            "source": "O*NET"
        },
        {
            "major": "Software Engineering",
            "skill_name": "Version Control",
            "category": "Technical",
            "key_components": ["Branching Strategies", "Merging", "Conflict Resolution"],
            "beginner_criteria": "Can commit, push, and pull code from repositories.",
            "intermediate_criteria": "Manages branches, pull requests, and resolves merge conflicts.",
            "advanced_criteria": "Designs repository architectures, manages release strategies, and automates Git workflows.",
            "assessment_type": "upload",
            "assessment_description": "Upload a screenshot of a git log showing at least 3 branches and 2 successful merge resolutions.",
            "source": "ESCO"
        },
        {
            "major": "Software Engineering",
            "skill_name": "Team Collaboration",
            "category": "Soft",
            "key_components": ["Active Listening", "Conflict Resolution", "Empathy"],
            "beginner_criteria": "Participates constructively in team meetings and discussions.",
            "intermediate_criteria": "Facilitates team discussions and actively helps resolve minor conflicts.",
            "advanced_criteria": "Builds high-performing teams, mentors others, and resolves complex interpersonal issues.",
            "assessment_type": "upload",
            "assessment_description": "Upload a certificate of completion for a team leadership or agile collaboration course.",
            "source": "Bloom's"
        },
        {
            "major": "Software Engineering",
            "skill_name": "Software Architecture",
            "category": "Technical",
            "key_components": ["Microservices", "System Design", "Scalability"],
            "beginner_criteria": "Understands basic client-server and monolithic architectures.",
            "intermediate_criteria": "Can design scalable microservices and understand system trade-offs.",
            "advanced_criteria": "Defines enterprise technical vision, selects appropriate architectural patterns, and ensures high availability.",
            "assessment_type": "upload",
            "assessment_description": "Upload a C4 model diagram or Unified Modeling Language (UML) diagram for a distributed microservices architecture.",
            "source": "O*NET"
        },
        
        # Network Computing
        {
            "major": "Network Computing",
            "skill_name": "Network Configuration",
            "category": "Technical",
            "key_components": ["Switching", "VLANs", "Subnetting"],
            "beginner_criteria": "Can configure basic switches and understand IP addressing.",
            "intermediate_criteria": "Implements VLANs, spanning tree protocols, and complex subnet assignments.",
            "advanced_criteria": "Architects enterprise campus networks and automates network provisioning.",
            "assessment_type": "code",
            "assessment_description": "Write a Cisco IOS configuration snippet for a router with two VLANs, a sub-interface, and an IP address.",
            "source": "ESCO"
        },
        {
            "major": "Network Computing",
            "skill_name": "Routing Implementation",
            "category": "Technical",
            "key_components": ["OSPF", "BGP", "Static Routing"],
            "beginner_criteria": "Can configure static routes and basic dynamic routing protocols.",
            "intermediate_criteria": "Implements multi-area OSPF and basic BGP peering.",
            "advanced_criteria": "Designs complex WAN routing, traffic engineering, and large-scale autonomous systems.",
            "assessment_type": "code",
            "assessment_description": "Write an OSPF configuration for a 3-router topology using Area 0.",
            "source": "O*NET"
        },
        {
            "major": "Network Computing",
            "skill_name": "Network Troubleshooting",
            "category": "Technical",
            "key_components": ["Packet Analysis", "Diagnostic Tools", "Fault Isolation"],
            "beginner_criteria": "Uses basic tools like ping and traceroute to identify issues.",
            "intermediate_criteria": "Analyzes packet captures to diagnose protocol discrepancies.",
            "advanced_criteria": "Resolves complex intermittent issues across distributed multi-vendor networks.",
            "assessment_type": "upload",
            "assessment_description": "Upload a Wireshark pcap analysis report identifying a TCP 3-way handshake failure.",
            "source": "ESCO"
        },
        {
            "major": "Network Computing",
            "skill_name": "Analytical Problem Solving",
            "category": "Soft",
            "key_components": ["Critical Thinking", "Root Cause Analysis", "Logical Reasoning"],
            "beginner_criteria": "Can solve straightforward problems using given procedures.",
            "intermediate_criteria": "Deconstructs complex problems and identifies underlying root causes.",
            "advanced_criteria": "Develops innovative solutions to unprecedented and systemic problems.",
            "assessment_type": "upload",
            "assessment_description": "Upload a root-cause analysis (RCA) document for a systemic technical failure you solved.",
            "source": "Bloom's"
        },

        # Web & Mobile Technologies
        {
            "major": "Web & Mobile Technologies",
            "skill_name": "Front-End Development",
            "category": "Technical",
            "key_components": ["HTML/CSS", "JavaScript", "Frameworks (React/Vue)"],
            "beginner_criteria": "Builds static web pages and implements basic interactive scripts.",
            "intermediate_criteria": "Develops dynamic Single Page Applications using modern frameworks.",
            "advanced_criteria": "Architects highly performant, accessible, and scalable frontend codebases.",
            "assessment_type": "code",
            "assessment_description": "Create a responsive React component that fetches a list of users from a mock API and displays them in a card grid.",
            "source": "O*NET"
        },
        {
            "major": "Web & Mobile Technologies",
            "skill_name": "Back-End Development",
            "category": "Technical",
            "key_components": ["API Design", "Server Logic", "Authentication"],
            "beginner_criteria": "Creates basic RESTful endpoints and connects to databases.",
            "intermediate_criteria": "Implements secure, paginated, and optimized APIs with middleware.",
            "advanced_criteria": "Architects distributed backends dealing with high concurrency and data consistency.",
            "assessment_type": "code",
            "assessment_description": "Build a simple FastAPI or Express.js endpoint that handles a POST request, validates JSON input, and returns a success message.",
            "source": "ESCO"
        },
        {
            "major": "Web & Mobile Technologies",
            "skill_name": "Mobile App Development",
            "category": "Technical",
            "key_components": ["Native/Cross-Platform", "State Management", "Mobile UI/UX"],
            "beginner_criteria": "Builds simple mobile screens with hardcoded data.",
            "intermediate_criteria": "Develops complete mobile applications integrating with REST APIs and device features.",
            "advanced_criteria": "Optimizes mobile performance, memory usage, and manages complex offline synchronization strategies.",
            "assessment_type": "code",
            "assessment_description": "Write a React Native functional component that uses 'useState' and 'useEffect' to track a user's geolocation.",
            "source": "O*NET"
        },
        {
            "major": "Web & Mobile Technologies",
            "skill_name": "Responsive Web Design",
            "category": "Technical",
            "key_components": ["Media Queries", "Flexbox/Grid", "Mobile-First Approach"],
            "beginner_criteria": "Uses frameworks like Bootstrap to create responsive layouts.",
            "intermediate_criteria": "Writes custom CSS utilizing modern layout techniques for complex responsive designs.",
            "advanced_criteria": "Designs fluid typography, advanced responsive animations, and accessible cross-device experiences.",
            "assessment_type": "code",
            "assessment_description": "Create a CSS Grid layout for a 3-column dashboard that stacks vertically on mobile devices (max-width: 768px).",
            "source": "ESCO"
        },
        {
            "major": "Web & Mobile Technologies",
            "skill_name": "UI/UX Concepts",
            "category": "Technical",
            "key_components": ["Wireframing", "User Research", "Prototyping"],
            "beginner_criteria": "Can build basic wireframes and follow design patterns.",
            "intermediate_criteria": "Conducts user testing and creates interactive prototypes.",
            "advanced_criteria": "Establishes enterprise design systems and leads comprehensive UX strategies.",
            "assessment_type": "upload",
            "assessment_description": "Upload a link to a Figma prototype or a PDF wireframe for a mobile fitness tracking app.",
            "source": "O*NET"
        },

        # Cloud Computing
        {
            "major": "Cloud Computing",
            "skill_name": "Cloud Architecture",
            "category": "Technical",
            "key_components": ["IaaS/PaaS", "High Availability", "Disaster Recovery"],
            "beginner_criteria": "Deploys simple virtual machines and storage buckets in the cloud.",
            "intermediate_criteria": "Designs fault-tolerant architectures utilizing load balancing and auto-scaling.",
            "advanced_criteria": "Architects multi-region, multi-cloud enterprise deployments with strict compliance requirements.",
            "assessment_type": "upload",
            "assessment_description": "Upload a CloudFormation template or a high-level architectural diagram for a multi-tier web application.",
            "source": "ESCO"
        },
        {
            "major": "Cloud Computing",
            "skill_name": "Containerization",
            "category": "Technical",
            "key_components": ["Docker", "Kubernetes", "Container Registries"],
            "beginner_criteria": "Can run pre-built container images and write simple Dockerfiles.",
            "intermediate_criteria": "Orchestrates multi-container applications using Docker Compose and basic Kubernetes.",
            "advanced_criteria": "Manages large-scale Kubernetes clusters, service meshes, and complex deployment strategies.",
            "assessment_type": "code",
            "assessment_description": "Write a multi-stage Dockerfile for a Node.js or Python application to minimize image size.",
            "source": "O*NET"
        },
        {
            "major": "Cloud Computing",
            "skill_name": "Serverless Computing",
            "category": "Technical",
            "key_components": ["FaaS", "Event-Driven Architecture", "API Gateways"],
            "beginner_criteria": "Deploys simple functions triggered by basic events.",
            "intermediate_criteria": "Designs event-driven applications integrating various serverless services (e.g., Queues, Databases).",
            "advanced_criteria": "Optimizes serverless architectures for cost, cold starts, and complex distributed transactions.",
            "assessment_type": "code",
            "assessment_description": "Write an AWS Lambda function (Python/Node) that triggers on an S3 upload and logs the filename.",
            "source": "ESCO"
        },
        {
            "major": "Cloud Computing",
            "skill_name": "Infrastructure as Code",
            "category": "Technical",
            "key_components": ["Terraform", "CloudFormation", "Automation"],
            "beginner_criteria": "Can read and modify existing IaC templates.",
            "intermediate_criteria": "Writes modular infrastructure code to provision entire environments.",
            "advanced_criteria": "Implements GitOps pipelines and creates generalized, reusable IaC modules for enterprise use.",
            "assessment_type": "code",
            "assessment_description": "Write a Terraform module that creates a VPC with two public subnets and an Internet Gateway.",
            "source": "O*NET"
        },

        # Data Science & AI
        {
            "major": "Data Science & AI",
            "skill_name": "Machine Learning",
            "category": "Technical",
            "key_components": ["Supervised Learning", "Model Evaluation", "Feature Engineering"],
            "beginner_criteria": "Can train simple models using libraries like Scikit-Learn.",
            "intermediate_criteria": "Performs complex feature engineering, hyperparameter tuning, and cross-validation.",
            "advanced_criteria": "Develops novel ML architectures, deploys models at scale, and monitors drift.",
            "assessment_type": "code",
            "assessment_description": "Write a Python script using Scikit-learn to train a Random Forest classifier on the Iris dataset.",
            "source": "ESCO"
        },
        {
            "major": "Data Science & AI",
            "skill_name": "Data Visualization",
            "category": "Technical",
            "key_components": ["Dashboards", "Storytelling", "Plotting Libraries"],
            "beginner_criteria": "Creates basic charts (bar, line, scatter) from clean data.",
            "intermediate_criteria": "Develops interactive dashboards and synthesizes complex data into clear narratives.",
            "advanced_criteria": "Designs bespoke, dynamic, data-driven visualizations and enterprise reporting platforms.",
            "assessment_type": "code",
            "assessment_description": "Create a Matplotlib or D3.js script to generate a heatmap representing web traffic hourly.",
            "source": "O*NET"
        },
        {
            "major": "Data Science & AI",
            "skill_name": "Statistical Analysis",
            "category": "Technical",
            "key_components": ["Hypothesis Testing", "Probability", "Regression"],
            "beginner_criteria": "Calculates descriptive statistics and understands basic probability.",
            "intermediate_criteria": "Performs A/B testing, ANOVA, and multivariable linear regression.",
            "advanced_criteria": "Applies advanced Bayesian methods, time-series forecasting, and causal inference techniques.",
            "assessment_type": "code",
            "assessment_description": "Write a Python script using SciPy to perform a T-test on two sets of experimental data.",
            "source": "ESCO"
        },
        {
            "major": "Data Science & AI",
            "skill_name": "Deep Learning",
            "category": "Technical",
            "key_components": ["Neural Networks", "NLP", "Computer Vision"],
            "beginner_criteria": "Understands fundamental neural network concepts and can use pre-trained models.",
            "intermediate_criteria": "Builds and trains CNNs or RNNs for specific tasks using PyTorch or TensorFlow.",
            "advanced_criteria": "Designs massive transformer models, optimizes training on distributed GPUs, and invents new architectures.",
            "assessment_type": "code",
            "assessment_description": "Implement a simple Neural Network with one hidden layer using PyTorch to solve an XOR problem.",
            "source": "O*NET"
        },

        # Cyber Security
        {
            "major": "Cyber Security",
            "skill_name": "Penetration Testing",
            "category": "Technical",
            "key_components": ["Vulnerability Exploitation", "Network Scanning", "Reporting"],
            "beginner_criteria": "Performs automated vulnerability scans and basic payload delivery.",
            "intermediate_criteria": "Exploits complex vulnerabilities and chains exploits to gain broader access.",
            "advanced_criteria": "Conducts advanced red-teaming operations, custom exploit development, and evasion techniques.",
            "assessment_type": "code",
            "assessment_description": "Write a Python script to perform a basic port scan on a target IP address (legal/ethical use only).",
            "source": "ESCO"
        },
        {
            "major": "Cyber Security",
            "skill_name": "Cryptography",
            "category": "Technical",
            "key_components": ["Encryption", "Hashing", "Public Key Infrastructure"],
            "beginner_criteria": "Understands basic encryption vs. hashing concepts and applications.",
            "intermediate_criteria": "Implements secure communication protocols and manages cryptographic keys.",
            "advanced_criteria": "Designs custom cryptosystems, analyzes cryptographic weaknesses, and implements zero-knowledge proofs.",
            "assessment_type": "code",
            "assessment_description": "Implement an AES-256 encryption/decryption function in Python using the cryptography library.",
            "source": "O*NET"
        },
        {
            "major": "Cyber Security",
            "skill_name": "Incident Response",
            "category": "Technical",
            "key_components": ["Threat Hunting", "Forensics", "Malware Analysis"],
            "beginner_criteria": "Follows standard operational procedures when an alert is triggered.",
            "intermediate_criteria": "Conducts digital forensics and analyzes memory dumps to identify root causes of breaches.",
            "advanced_criteria": "Leads enterprise-wide incident response efforts against advanced persistent threats (APTs).",
            "assessment_type": "upload",
            "assessment_description": "Upload a forensic analysis report of a suspected phishing email, identifying headers and malicious links.",
            "source": "ESCO"
        },
        {
            "major": "Cyber Security",
            "skill_name": "Cyber Security Compliance",
            "category": "Technical",
            "key_components": ["ISO 27001", "NIST", "Risk Assessment"],
            "beginner_criteria": "Understands basic security policies and compliance concepts.",
            "intermediate_criteria": "Conducts IT risk assessments and maps security controls to specific frameworks.",
            "advanced_criteria": "Architects enterprise compliance programs and guides organizations through major certification audits.",
            "assessment_type": "upload",
            "assessment_description": "Upload an Executive Summary of a NIST 800-53 or ISO 27001 internal audit.",
            "source": "O*NET"
        }
    ]

    try:
        # Drop collection to force update with new schema/fields
        skills_collection.drop()
        result = skills_collection.insert_many(skills_data)
        logger.info(f"Successfully seeded {len(result.inserted_ids)} skills into the database.")
    except Exception as e:
        logger.error(f"Failed to seed skills collection: {e}")
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
        elif command == "all":
            seed_skills()
            seed_market_data()
        else:
            print("Usage: python database.py [skills|jobs|all]")
    else:
        # Default behavior to avoid regressions
        logger.info("Running general seeder script...")
        seed_skills()
        seed_market_data()
