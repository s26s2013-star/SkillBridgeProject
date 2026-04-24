import logging
from database import get_db
import sys

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def seed_technical_questions():
    db = get_db()
    tech_qs_collection = db["technical_questions"]
    
    questions_data = [
        # Major: Cloud Computing
        {
            "major": "Cloud Computing",
            "skill_name": "Cloud Platforms",
            "question_number": 1,
            "question_text": "A company wants virtual servers, storage, and networking while keeping control over the OS and deployed software. Which cloud service model best fits?",
            "options": [
                { "option_text": "IaaS", "score": 3, "is_correct": True },
                { "option_text": "SaaS", "score": 1, "is_correct": False },
                { "option_text": "PaaS", "score": 2, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "NIST SP 800-145"
        },
        {
            "major": "Cloud Computing",
            "skill_name": "Cloud Platforms",
            "question_number": 2,
            "question_text": "Which scenario most clearly represents public cloud usage?",
            "options": [
                { "option_text": "Using AWS EC2 instances on demand over the internet", "score": 3, "is_correct": True },
                { "option_text": "Running VMware cluster inside one organization's data center", "score": 1, "is_correct": False },
                { "option_text": "Using a local NAS without external access", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "AWS cloud basics"
        },
        {
            "major": "Cloud Computing",
            "skill_name": "Cloud Platforms",
            "question_number": 3,
            "question_text": "Which benefit is most directly associated with cloud platforms during peak traffic periods?",
            "options": [
                { "option_text": "Elastic resource allocation based on demand", "score": 3, "is_correct": True },
                { "option_text": "Fixed capacity regardless of demand", "score": 1, "is_correct": False },
                { "option_text": "Manual hardware replacement before scaling", "score": 2, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "NIST SP 800-145"
        },
        {
            "major": "Cloud Computing",
            "skill_name": "Virtualization",
            "question_number": 1,
            "question_text": "What is the main purpose of virtualization in modern infrastructure?",
            "options": [
                { "option_text": "To run multiple isolated systems on shared physical hardware", "score": 3, "is_correct": True },
                { "option_text": "To make web pages load faster automatically", "score": 1, "is_correct": False },
                { "option_text": "To replace all networking protocols", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "VMware virtualization overview"
        },
        {
            "major": "Cloud Computing",
            "skill_name": "Virtualization",
            "question_number": 2,
            "question_text": "Which software layer is responsible for creating and managing virtual machines?",
            "options": [
                { "option_text": "Hypervisor", "score": 3, "is_correct": True },
                { "option_text": "Compiler", "score": 1, "is_correct": False },
                { "option_text": "Load balancer", "score": 2, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "IBM hypervisor overview"
        },
        {
            "major": "Cloud Computing",
            "skill_name": "Virtualization",
            "question_number": 3,
            "question_text": "If a hypervisor runs directly on hardware rather than on top of a host OS, it is best classified as:",
            "options": [
                { "option_text": "Type 1 hypervisor", "score": 3, "is_correct": True },
                { "option_text": "Type 2 hypervisor", "score": 2, "is_correct": False },
                { "option_text": "Container runtime", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "IBM hypervisor overview"
        },
        {
            "major": "Cloud Computing",
            "skill_name": "Containers",
            "question_number": 1,
            "question_text": "What makes containers lighter than traditional VMs?",
            "options": [
                { "option_text": "They share the host OS kernel", "score": 3, "is_correct": True },
                { "option_text": "They always include a full guest OS", "score": 1, "is_correct": False },
                { "option_text": "They eliminate networking needs", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Docker container overview"
        },
        {
            "major": "Cloud Computing",
            "skill_name": "Containers",
            "question_number": 2,
            "question_text": "Which tool is most strongly associated with building and running containers?",
            "options": [
                { "option_text": "Docker", "score": 3, "is_correct": True },
                { "option_text": "Jenkins", "score": 1, "is_correct": False },
                { "option_text": "Wireshark", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Docker getting started docs"
        },
        {
            "major": "Cloud Computing",
            "skill_name": "Containers",
            "question_number": 3,
            "question_text": "Why are containers widely used in deployment pipelines?",
            "options": [
                { "option_text": "They provide consistent runtime environments across stages", "score": 3, "is_correct": True },
                { "option_text": "They guarantee zero bugs", "score": 1, "is_correct": False },
                { "option_text": "They replace all cloud platforms", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Kubernetes concepts"
        },
        {
            "major": "Cloud Computing",
            "skill_name": "Deployment and CI/CD",
            "question_number": 1,
            "question_text": "What is the main goal of Continuous Integration?",
            "options": [
                { "option_text": "Integrate changes frequently and validate them automatically", "score": 3, "is_correct": True },
                { "option_text": "Merge code infrequently to avoid conflicts", "score": 1, "is_correct": False },
                { "option_text": "Deploy directly to production without testing", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Martin Fowler on CI"
        },
        {
            "major": "Cloud Computing",
            "skill_name": "Deployment and CI/CD",
            "question_number": 2,
            "question_text": "A team uses Jenkins to build, test, and package code whenever developers push changes. This is an example of:",
            "options": [
                { "option_text": "A CI/CD pipeline", "score": 3, "is_correct": True },
                { "option_text": "Manual regression only", "score": 1, "is_correct": False },
                { "option_text": "Database sharding", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Jenkins documentation"
        },
        {
            "major": "Cloud Computing",
            "skill_name": "Deployment and CI/CD",
            "question_number": 3,
            "question_text": "Which practice most reduces release risk in CI/CD environments?",
            "options": [
                { "option_text": "Using small frequent changes with automated validation", "score": 3, "is_correct": True },
                { "option_text": "Skipping automated tests to save time", "score": 1, "is_correct": False },
                { "option_text": "Deploying only once per year", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Martin Fowler on CI"
        },
        {
            "major": "Cloud Computing",
            "skill_name": "Cloud Security",
            "question_number": 1,
            "question_text": "In the shared responsibility model, which statement is correct?",
            "options": [
                { "option_text": "Security responsibilities are divided between provider and customer", "score": 3, "is_correct": True },
                { "option_text": "The provider is responsible for everything", "score": 1, "is_correct": False },
                { "option_text": "The customer is responsible for nothing", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "AWS shared responsibility model"
        },
        {
            "major": "Cloud Computing",
            "skill_name": "Cloud Security",
            "question_number": 2,
            "question_text": "Which issue is a direct cloud security concern?",
            "options": [
                { "option_text": "Data breach caused by weak access control", "score": 3, "is_correct": True },
                { "option_text": "Adding more virtual CPUs", "score": 1, "is_correct": False },
                { "option_text": "Selecting a theme color for the dashboard", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "NIST Cybersecurity Framework"
        },
        {
            "major": "Cloud Computing",
            "skill_name": "Cloud Security",
            "question_number": 3,
            "question_text": "What is encryption primarily used for in cloud systems?",
            "options": [
                { "option_text": "To protect data confidentiality", "score": 3, "is_correct": True },
                { "option_text": "To improve UI design", "score": 1, "is_correct": False },
                { "option_text": "To scale compute nodes", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "FIPS 197 AES standard"
        },
        {
            "major": "Cloud Computing",
            "skill_name": "Distributed Systems",
            "question_number": 1,
            "question_text": "Which description best matches a distributed system?",
            "options": [
                { "option_text": "Multiple networked computers coordinating to provide a service", "score": 3, "is_correct": True },
                { "option_text": "A single offline machine", "score": 1, "is_correct": False },
                { "option_text": "A web page with no backend", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Distributed Systems textbook"
        },
        {
            "major": "Cloud Computing",
            "skill_name": "Distributed Systems",
            "question_number": 2,
            "question_text": "Which challenge commonly appears in distributed systems but not in single-process apps?",
            "options": [
                { "option_text": "Network latency and partial failures", "score": 3, "is_correct": True },
                { "option_text": "Font selection", "score": 1, "is_correct": False },
                { "option_text": "Monitor calibration", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Google SRE book"
        },
        {
            "major": "Cloud Computing",
            "skill_name": "Distributed Systems",
            "question_number": 3,
            "question_text": "What does fault tolerance mean in distributed services?",
            "options": [
                { "option_text": "Continuing to operate acceptably despite some component failures", "score": 3, "is_correct": True },
                { "option_text": "Stopping immediately after any fault", "score": 1, "is_correct": False },
                { "option_text": "Using only one server", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Google SRE book"
        },
        {
            "major": "Cloud Computing",
            "skill_name": "Scalability Concepts",
            "question_number": 1,
            "question_text": "What does scalability describe in system design?",
            "options": [
                { "option_text": "The ability to handle increased load effectively", "score": 3, "is_correct": True },
                { "option_text": "The ability to reduce all security controls", "score": 1, "is_correct": False },
                { "option_text": "The use of one fixed server forever", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "AWS Well-Architected Framework"
        },
        {
            "major": "Cloud Computing",
            "skill_name": "Scalability Concepts",
            "question_number": 2,
            "question_text": "Which option is an example of horizontal scaling?",
            "options": [
                { "option_text": "Adding more servers behind a load balancer", "score": 3, "is_correct": True },
                { "option_text": "Adding RAM to one existing server", "score": 2, "is_correct": False },
                { "option_text": "Changing a password policy", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "AWS architecture guidance"
        },
        {
            "major": "Cloud Computing",
            "skill_name": "Scalability Concepts",
            "question_number": 3,
            "question_text": "Which option is an example of vertical scaling?",
            "options": [
                { "option_text": "Upgrading CPU and memory on one server", "score": 3, "is_correct": True },
                { "option_text": "Adding more separate nodes", "score": 2, "is_correct": False },
                { "option_text": "Deleting logs", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "AWS architecture guidance"
        },
        # Major: Cyber Security
        {
            "major": "Cyber Security",
            "skill_name": "Network Security",
            "question_number": 1,
            "question_text": "Which control most directly limits unauthorized inbound traffic?",
            "options": [
                { "option_text": "Firewall rules", "score": 3, "is_correct": True },
                { "option_text": "CPU overclocking", "score": 1, "is_correct": False },
                { "option_text": "Screen brightness", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "NIST SP 800-41"
        },
        {
            "major": "Cyber Security",
            "skill_name": "Network Security",
            "question_number": 2,
            "question_text": "Why is network segmentation important in security architecture?",
            "options": [
                { "option_text": "It limits lateral movement after compromise", "score": 3, "is_correct": True },
                { "option_text": "It improves image resolution", "score": 1, "is_correct": False },
                { "option_text": "It replaces encryption entirely", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "NIST Cybersecurity Framework"
        },
        {
            "major": "Cyber Security",
            "skill_name": "Network Security",
            "question_number": 3,
            "question_text": "Which activity best reflects network security monitoring?",
            "options": [
                { "option_text": "Capturing and reviewing suspicious traffic patterns", "score": 3, "is_correct": True },
                { "option_text": "Changing desktop wallpapers only", "score": 1, "is_correct": False },
                { "option_text": "Formatting unused disks weekly", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Wireshark user guide"
        },
        {
            "major": "Cyber Security",
            "skill_name": "Cryptography",
            "question_number": 1,
            "question_text": "What is the main purpose of encryption?",
            "options": [
                { "option_text": "To protect confidentiality of data", "score": 3, "is_correct": True },
                { "option_text": "To compress files", "score": 1, "is_correct": False },
                { "option_text": "To route traffic", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "FIPS 197 AES standard"
        },
        {
            "major": "Cyber Security",
            "skill_name": "Cryptography",
            "question_number": 2,
            "question_text": "Which approach uses one key for both encryption and decryption?",
            "options": [
                { "option_text": "Symmetric cryptography", "score": 3, "is_correct": True },
                { "option_text": "Asymmetric cryptography", "score": 2, "is_correct": False },
                { "option_text": "Hashing", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "NIST cryptographic guidelines"
        },
        {
            "major": "Cyber Security",
            "skill_name": "Cryptography",
            "question_number": 3,
            "question_text": "Which security property is best provided by a cryptographic hash when verifying downloaded files?",
            "options": [
                { "option_text": "Integrity", "score": 3, "is_correct": True },
                { "option_text": "Availability", "score": 1, "is_correct": False },
                { "option_text": "Bandwidth control", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "NIST hash standards"
        },
        {
            "major": "Cyber Security",
            "skill_name": "Ethical Hacking / Pen Testing",
            "question_number": 1,
            "question_text": "What is a primary goal of authorized penetration testing?",
            "options": [
                { "option_text": "To identify exploitable weaknesses under agreed scope", "score": 3, "is_correct": True },
                { "option_text": "To damage systems permanently", "score": 1, "is_correct": False },
                { "option_text": "To replace patch management", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "NIST SP 800-115"
        },
        {
            "major": "Cyber Security",
            "skill_name": "Ethical Hacking / Pen Testing",
            "question_number": 2,
            "question_text": "Which statement best reflects ethical hacking practice?",
            "options": [
                { "option_text": "Testing must occur with authorization, scope, and rules of engagement", "score": 3, "is_correct": True },
                { "option_text": "Testing without permission is acceptable if you learn something", "score": 1, "is_correct": False },
                { "option_text": "Reports are optional", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "OWASP Testing Guide v4"
        },
        {
            "major": "Cyber Security",
            "skill_name": "Ethical Hacking / Pen Testing",
            "question_number": 3,
            "question_text": "During a web security assessment, what should happen after confirming a vulnerability?",
            "options": [
                { "option_text": "Document evidence, impact, and remediation recommendations", "score": 3, "is_correct": True },
                { "option_text": "Publish it on social media", "score": 1, "is_correct": False },
                { "option_text": "Exploit other organizations with the same flaw", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "OWASP Testing Guide v4"
        },
        {
            "major": "Cyber Security",
            "skill_name": "Risk Assessment",
            "question_number": 1,
            "question_text": "What is the purpose of a cybersecurity risk assessment?",
            "options": [
                { "option_text": "To identify, estimate, and prioritize risks", "score": 3, "is_correct": True },
                { "option_text": "To rewrite all applications", "score": 1, "is_correct": False },
                { "option_text": "To replace incident response", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "NIST SP 800-30 Rev.1"
        },
        {
            "major": "Cyber Security",
            "skill_name": "Risk Assessment",
            "question_number": 2,
            "question_text": "Which combination is central when estimating information security risk?",
            "options": [
                { "option_text": "Threats, vulnerabilities, likelihood, and impact", "score": 3, "is_correct": True },
                { "option_text": "Logo, color, and typography", "score": 1, "is_correct": False },
                { "option_text": "Number of printers in the office", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "NIST SP 800-30 Rev.1"
        },
        {
            "major": "Cyber Security",
            "skill_name": "Risk Assessment",
            "question_number": 3,
            "question_text": "If a system has a severe vulnerability but no plausible threat source, the assessed risk is usually:",
            "options": [
                { "option_text": "Lower than if both threat and vulnerability are present", "score": 3, "is_correct": True },
                { "option_text": "Automatically maximal", "score": 1, "is_correct": False },
                { "option_text": "Exactly zero in all cases", "score": 2, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "NIST SP 800-30 Rev.1"
        },
        {
            "major": "Cyber Security",
            "skill_name": "Security Policies and Governance",
            "question_number": 1,
            "question_text": "What is the main purpose of an information security policy?",
            "options": [
                { "option_text": "To define organizational expectations and controls", "score": 3, "is_correct": True },
                { "option_text": "To replace technical tools completely", "score": 1, "is_correct": False },
                { "option_text": "To guarantee zero incidents", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "NIST SP 800-53 Rev.5"
        },
        {
            "major": "Cyber Security",
            "skill_name": "Security Policies and Governance",
            "question_number": 2,
            "question_text": "Which statement best reflects security governance?",
            "options": [
                { "option_text": "Leadership oversight and accountability are part of governance", "score": 3, "is_correct": True },
                { "option_text": "Security is only the IT team's problem", "score": 1, "is_correct": False },
                { "option_text": "Compliance means no risk exists", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "NIST Cybersecurity Framework"
        },
        {
            "major": "Cyber Security",
            "skill_name": "Security Policies and Governance",
            "question_number": 3,
            "question_text": "Why should security policies be reviewed periodically?",
            "options": [
                { "option_text": "Threats, technologies, and business requirements change", "score": 3, "is_correct": True },
                { "option_text": "Because policies expire every week", "score": 1, "is_correct": False },
                { "option_text": "Only for cosmetic updates", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "NIST SP 800-53 Rev.5"
        },
        {
            "major": "Cyber Security",
            "skill_name": "Incident Response",
            "question_number": 1,
            "question_text": "What is the first priority once a serious security incident is confirmed?",
            "options": [
                { "option_text": "Begin controlled response according to the incident process", "score": 3, "is_correct": True },
                { "option_text": "Delete all evidence immediately", "score": 1, "is_correct": False },
                { "option_text": "Turn off documentation", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "NIST incident response guidance"
        },
        {
            "major": "Cyber Security",
            "skill_name": "Incident Response",
            "question_number": 2,
            "question_text": "Which activity belongs to the analysis phase of incident response?",
            "options": [
                { "option_text": "Determining scope, affected assets, and likely cause", "score": 3, "is_correct": True },
                { "option_text": "Designing a new company logo", "score": 1, "is_correct": False },
                { "option_text": "Deleting logs before review", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "NIST Cybersecurity Framework"
        },
        {
            "major": "Cyber Security",
            "skill_name": "Incident Response",
            "question_number": 3,
            "question_text": "Why is post-incident review important?",
            "options": [
                { "option_text": "It supports lessons learned and control improvement", "score": 3, "is_correct": True },
                { "option_text": "It is only for legal teams", "score": 1, "is_correct": False },
                { "option_text": "It guarantees future immunity", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "NIST incident response practices"
        },
        {
            "major": "Cyber Security",
            "skill_name": "Vulnerability Analysis",
            "question_number": 1,
            "question_text": "What does vulnerability analysis primarily aim to do?",
            "options": [
                { "option_text": "Identify weaknesses that could be exploited", "score": 3, "is_correct": True },
                { "option_text": "Encrypt all data automatically", "score": 1, "is_correct": False },
                { "option_text": "Replace logging systems", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "NIST SP 800-115"
        },
        {
            "major": "Cyber Security",
            "skill_name": "Vulnerability Analysis",
            "question_number": 2,
            "question_text": "Which result from a vulnerability scanner requires analyst review before prioritization?",
            "options": [
                { "option_text": "Potential findings and their context", "score": 3, "is_correct": True },
                { "option_text": "Only successful backups", "score": 1, "is_correct": False },
                { "option_text": "The office seating map", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "NIST SP 800-115"
        },
        {
            "major": "Cyber Security",
            "skill_name": "Vulnerability Analysis",
            "question_number": 3,
            "question_text": "When prioritizing remediation, which factor is usually most important?",
            "options": [
                { "option_text": "Exploitability and business impact", "score": 3, "is_correct": True },
                { "option_text": "How attractive the dashboard looks", "score": 1, "is_correct": False },
                { "option_text": "Screen size", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "NIST risk and vulnerability management"
        },
        {
            "major": "Cyber Security",
            "skill_name": "Authentication and Access Control",
            "question_number": 1,
            "question_text": "What is the purpose of authentication?",
            "options": [
                { "option_text": "To verify identity", "score": 3, "is_correct": True },
                { "option_text": "To compress database files", "score": 1, "is_correct": False },
                { "option_text": "To define brand colors", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "NIST Digital Identity Guidelines SP 800-63"
        },
        {
            "major": "Cyber Security",
            "skill_name": "Authentication and Access Control",
            "question_number": 2,
            "question_text": "Which principle best reduces unnecessary permissions?",
            "options": [
                { "option_text": "Least privilege", "score": 3, "is_correct": True },
                { "option_text": "Universal administrator access", "score": 1, "is_correct": False },
                { "option_text": "Shared anonymous credentials", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "NIST SP 800-53 access control family"
        },
        {
            "major": "Cyber Security",
            "skill_name": "Authentication and Access Control",
            "question_number": 3,
            "question_text": "Why is multi-factor authentication stronger than password-only access?",
            "options": [
                { "option_text": "It uses multiple independent evidence factors", "score": 3, "is_correct": True },
                { "option_text": "It removes the need for identity proofing", "score": 1, "is_correct": False },
                { "option_text": "It works only offline", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "NIST Digital Identity Guidelines SP 800-63"
        },
        # Major: Data Science and AI
        {
            "major": "Data Science and AI",
            "skill_name": "Python / R Programming",
            "question_number": 1,
            "question_text": "Which choice best reflects good data-science scripting practice?",
            "options": [
                { "option_text": "Use reusable functions and clear libraries for analysis steps", "score": 3, "is_correct": True },
                { "option_text": "Write one long script with no functions", "score": 1, "is_correct": False },
                { "option_text": "Store all logic in screenshots", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Python documentation"
        },
        {
            "major": "Data Science and AI",
            "skill_name": "Python / R Programming",
            "question_number": 2,
            "question_text": "Why are libraries such as pandas in Python or dplyr in R commonly used?",
            "options": [
                { "option_text": "They support structured data manipulation efficiently", "score": 3, "is_correct": True },
                { "option_text": "They replace statistics completely", "score": 1, "is_correct": False },
                { "option_text": "They only improve graphics cards", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Python docs / R Project"
        },
        {
            "major": "Data Science and AI",
            "skill_name": "Python / R Programming",
            "question_number": 3,
            "question_text": "A student writes code that works once but breaks when column names change. Which skill is weakest?",
            "options": [
                { "option_text": "Robust programming and reproducibility", "score": 3, "is_correct": True },
                { "option_text": "Deep learning theory only", "score": 1, "is_correct": False },
                { "option_text": "Network cabling", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Python best practices"
        },
        {
            "major": "Data Science and AI",
            "skill_name": "Data Analysis",
            "question_number": 1,
            "question_text": "What is usually the first meaningful step after loading a new dataset?",
            "options": [
                { "option_text": "Inspect structure, missing values, and basic summaries", "score": 3, "is_correct": True },
                { "option_text": "Build a neural network immediately", "score": 1, "is_correct": False },
                { "option_text": "Delete random rows", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "pandas getting started"
        },
        {
            "major": "Data Science and AI",
            "skill_name": "Data Analysis",
            "question_number": 2,
            "question_text": "Why is exploratory data analysis important?",
            "options": [
                { "option_text": "It helps reveal patterns, anomalies, and data quality issues", "score": 3, "is_correct": True },
                { "option_text": "It guarantees causation", "score": 1, "is_correct": False },
                { "option_text": "It is only for report decoration", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "pandas documentation"
        },
        {
            "major": "Data Science and AI",
            "skill_name": "Data Analysis",
            "question_number": 3,
            "question_text": "If a dataset has many missing entries in a key feature, what should an analyst do first?",
            "options": [
                { "option_text": "Assess the pattern and impact of missingness before choosing a treatment", "score": 3, "is_correct": True },
                { "option_text": "Ignore the issue and continue", "score": 1, "is_correct": False },
                { "option_text": "Always replace with zero", "score": 2, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "pandas missing data guidance"
        },
        {
            "major": "Data Science and AI",
            "skill_name": "Machine Learning",
            "question_number": 1,
            "question_text": "What is the core purpose of machine learning in supervised tasks?",
            "options": [
                { "option_text": "To learn patterns from labeled data for prediction", "score": 3, "is_correct": True },
                { "option_text": "To remove all need for data", "score": 1, "is_correct": False },
                { "option_text": "To replace databases", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "scikit-learn overview"
        },
        {
            "major": "Data Science and AI",
            "skill_name": "Machine Learning",
            "question_number": 2,
            "question_text": "Why should training and test data be separated?",
            "options": [
                { "option_text": "To evaluate generalization on unseen data", "score": 3, "is_correct": True },
                { "option_text": "To increase monitor resolution", "score": 1, "is_correct": False },
                { "option_text": "To remove labels from the project", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "scikit-learn model selection"
        },
        {
            "major": "Data Science and AI",
            "skill_name": "Machine Learning",
            "question_number": 3,
            "question_text": "Which issue is indicated when a model performs very well on training data but poorly on new data?",
            "options": [
                { "option_text": "Overfitting", "score": 3, "is_correct": True },
                { "option_text": "Underfitting", "score": 2, "is_correct": False },
                { "option_text": "Compression", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "scikit-learn learning concepts"
        },
        {
            "major": "Data Science and AI",
            "skill_name": "Deep Learning Basics",
            "question_number": 1,
            "question_text": "What distinguishes deep learning models from simpler ML models?",
            "options": [
                { "option_text": "They use layered neural networks to learn hierarchical representations", "score": 3, "is_correct": True },
                { "option_text": "They require no data", "score": 1, "is_correct": False },
                { "option_text": "They never need tuning", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "TensorFlow neural network basics"
        },
        {
            "major": "Data Science and AI",
            "skill_name": "Deep Learning Basics",
            "question_number": 2,
            "question_text": "Which problem type is deep learning especially known for handling well?",
            "options": [
                { "option_text": "Image and speech recognition", "score": 3, "is_correct": True },
                { "option_text": "Printer installation only", "score": 1, "is_correct": False },
                { "option_text": "Spreadsheet formatting", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "TensorFlow tutorials"
        },
        {
            "major": "Data Science and AI",
            "skill_name": "Deep Learning Basics",
            "question_number": 3,
            "question_text": "Why is the amount of training data often important in deep learning?",
            "options": [
                { "option_text": "Larger models often need enough data to learn useful patterns without memorizing noise", "score": 3, "is_correct": True },
                { "option_text": "Because more data always removes bias fully", "score": 1, "is_correct": False },
                { "option_text": "Because labels are irrelevant", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "TensorFlow learn resources"
        },
        {
            "major": "Data Science and AI",
            "skill_name": "Data Visualization",
            "question_number": 1,
            "question_text": "What is the main purpose of data visualization in analytics?",
            "options": [
                { "option_text": "To communicate patterns and insights clearly", "score": 3, "is_correct": True },
                { "option_text": "To replace all statistics", "score": 1, "is_correct": False },
                { "option_text": "To avoid checking quality", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Tableau visualization basics"
        },
        {
            "major": "Data Science and AI",
            "skill_name": "Data Visualization",
            "question_number": 2,
            "question_text": "Which chart is generally most suitable for showing a trend over time?",
            "options": [
                { "option_text": "Line chart", "score": 3, "is_correct": True },
                { "option_text": "Pie chart", "score": 2, "is_correct": False },
                { "option_text": "Random color grid", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Tableau chart selection"
        },
        {
            "major": "Data Science and AI",
            "skill_name": "Data Visualization",
            "question_number": 3,
            "question_text": "Which visualization mistake most harms interpretation?",
            "options": [
                { "option_text": "Using a misleading axis or inappropriate chart type", "score": 3, "is_correct": True },
                { "option_text": "Adding a title", "score": 1, "is_correct": False },
                { "option_text": "Using consistent legends", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Tableau data visualization guidance"
        },
        {
            "major": "Data Science and AI",
            "skill_name": "Statistics and Probability",
            "question_number": 1,
            "question_text": "Why are probability concepts important in data science?",
            "options": [
                { "option_text": "They help quantify uncertainty and support inference", "score": 3, "is_correct": True },
                { "option_text": "They only matter in networking", "score": 1, "is_correct": False },
                { "option_text": "They remove variance from real data", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Khan Academy statistics"
        },
        {
            "major": "Data Science and AI",
            "skill_name": "Statistics and Probability",
            "question_number": 2,
            "question_text": "What does a sample mean represent?",
            "options": [
                { "option_text": "A measure of central tendency for observed values", "score": 3, "is_correct": True },
                { "option_text": "A guaranteed population truth", "score": 2, "is_correct": False },
                { "option_text": "A kind of encryption", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Khan Academy statistics"
        },
        {
            "major": "Data Science and AI",
            "skill_name": "Statistics and Probability",
            "question_number": 3,
            "question_text": "If variability in data is large, what usually happens to confidence in a point estimate?",
            "options": [
                { "option_text": "Uncertainty typically increases", "score": 3, "is_correct": True },
                { "option_text": "Uncertainty disappears", "score": 1, "is_correct": False },
                { "option_text": "The estimate becomes exact", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Statistics and inference foundations"
        },
        {
            "major": "Data Science and AI",
            "skill_name": "SQL and Data Handling",
            "question_number": 1,
            "question_text": "Which SQL statement is primarily used to retrieve filtered data?",
            "options": [
                { "option_text": "SELECT", "score": 3, "is_correct": True },
                { "option_text": "DROP", "score": 1, "is_correct": False },
                { "option_text": "GRANT", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "PostgreSQL documentation"
        },
        {
            "major": "Data Science and AI",
            "skill_name": "SQL and Data Handling",
            "question_number": 2,
            "question_text": "Why are joins important in SQL-based analysis?",
            "options": [
                { "option_text": "They combine related data from multiple tables", "score": 3, "is_correct": True },
                { "option_text": "They encrypt records", "score": 1, "is_correct": False },
                { "option_text": "They only format text", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "PostgreSQL documentation"
        },
        {
            "major": "Data Science and AI",
            "skill_name": "SQL and Data Handling",
            "question_number": 3,
            "question_text": "Which practice most improves data integrity when storing structured business data?",
            "options": [
                { "option_text": "Using keys and constraints appropriately", "score": 3, "is_correct": True },
                { "option_text": "Duplicating records in many tables without control", "score": 1, "is_correct": False },
                { "option_text": "Storing everything in screenshots", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "PostgreSQL constraints documentation"
        },
        {
            "major": "Data Science and AI",
            "skill_name": "Model Evaluation",
            "question_number": 1,
            "question_text": "Why is model evaluation necessary after training a predictive model?",
            "options": [
                { "option_text": "To measure how well it performs on relevant metrics", "score": 3, "is_correct": True },
                { "option_text": "To make charts look nicer", "score": 1, "is_correct": False },
                { "option_text": "To avoid using test data", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "scikit-learn model evaluation guide"
        },
        {
            "major": "Data Science and AI",
            "skill_name": "Model Evaluation",
            "question_number": 2,
            "question_text": "Which metric is commonly used for classification tasks?",
            "options": [
                { "option_text": "Accuracy", "score": 3, "is_correct": True },
                { "option_text": "Mean absolute error only", "score": 2, "is_correct": False },
                { "option_text": "Throughput only", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "scikit-learn metrics documentation"
        },
        {
            "major": "Data Science and AI",
            "skill_name": "Model Evaluation",
            "question_number": 3,
            "question_text": "If a classifier has high accuracy on an imbalanced dataset, what should the evaluator also inspect?",
            "options": [
                { "option_text": "Precision, recall, or F1 score", "score": 3, "is_correct": True },
                { "option_text": "Only font choice", "score": 1, "is_correct": False },
                { "option_text": "Only CPU temperature", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "scikit-learn classification metrics"
        },
        # Major: Information System
        {
            "major": "Information System",
            "skill_name": "Database Management",
            "question_number": 1,
            "question_text": "Which activity belongs most directly to database management?",
            "options": [
                { "option_text": "Designing schemas, maintaining integrity, and managing access", "score": 3, "is_correct": True },
                { "option_text": "Changing monitor settings", "score": 1, "is_correct": False },
                { "option_text": "Configuring Wi-Fi channels", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "PostgreSQL documentation"
        },
        {
            "major": "Information System",
            "skill_name": "Database Management",
            "question_number": 2,
            "question_text": "Why are normalization principles used in relational database design?",
            "options": [
                { "option_text": "To reduce redundancy and improve consistency", "score": 3, "is_correct": True },
                { "option_text": "To increase duplication intentionally", "score": 1, "is_correct": False },
                { "option_text": "To avoid keys", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "PostgreSQL data definition documentation"
        },
        {
            "major": "Information System",
            "skill_name": "Database Management",
            "question_number": 3,
            "question_text": "Which control best protects sensitive business records in a database?",
            "options": [
                { "option_text": "Role-based access and least privilege", "score": 3, "is_correct": True },
                { "option_text": "Anonymous full access", "score": 1, "is_correct": False },
                { "option_text": "Disabling logs", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Oracle SQL Developer resources"
        },
        {
            "major": "Information System",
            "skill_name": "Business Process Analysis",
            "question_number": 1,
            "question_text": "What is a core objective of business process analysis?",
            "options": [
                { "option_text": "Understand and improve how work flows across the organization", "score": 3, "is_correct": True },
                { "option_text": "Replace all employees with scripts immediately", "score": 1, "is_correct": False },
                { "option_text": "Ignore stakeholders", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "IBM business analytics"
        },
        {
            "major": "Information System",
            "skill_name": "Business Process Analysis",
            "question_number": 2,
            "question_text": "When mapping an existing process, what should be identified first?",
            "options": [
                { "option_text": "Major steps, actors, inputs, and outputs", "score": 3, "is_correct": True },
                { "option_text": "Only colors for the diagram", "score": 1, "is_correct": False },
                { "option_text": "Printer model", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "IBM business intelligence"
        },
        {
            "major": "Information System",
            "skill_name": "Business Process Analysis",
            "question_number": 3,
            "question_text": "Which sign most strongly suggests a process needs redesign?",
            "options": [
                { "option_text": "Repeated handoffs, delays, and duplicate data entry", "score": 3, "is_correct": True },
                { "option_text": "A process having an owner", "score": 1, "is_correct": False },
                { "option_text": "A report using charts", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "IBM business analytics"
        },
        {
            "major": "Information System",
            "skill_name": "ERP Systems",
            "question_number": 1,
            "question_text": "What is the main purpose of an ERP system?",
            "options": [
                { "option_text": "Integrate core business processes using shared data", "score": 3, "is_correct": True },
                { "option_text": "Only host static web pages", "score": 1, "is_correct": False },
                { "option_text": "Serve only as email storage", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "SAP ERP overview"
        },
        {
            "major": "Information System",
            "skill_name": "ERP Systems",
            "question_number": 2,
            "question_text": "Why do organizations adopt ERP platforms?",
            "options": [
                { "option_text": "To gain a single source of truth across functions", "score": 3, "is_correct": True },
                { "option_text": "To remove all workflows", "score": 1, "is_correct": False },
                { "option_text": "To avoid reporting", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "SAP ERP guide"
        },
        {
            "major": "Information System",
            "skill_name": "ERP Systems",
            "question_number": 3,
            "question_text": "Which scenario best reflects successful ERP usage?",
            "options": [
                { "option_text": "Finance, procurement, and inventory sharing consistent enterprise data", "score": 3, "is_correct": True },
                { "option_text": "Every department keeping completely separate spreadsheets", "score": 1, "is_correct": False },
                { "option_text": "No transaction traceability", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "SAP ERP software overview"
        },
        {
            "major": "Information System",
            "skill_name": "IT Project Management",
            "question_number": 1,
            "question_text": "What is a core responsibility of IT project management?",
            "options": [
                { "option_text": "Balancing scope, schedule, cost, and risk to deliver value", "score": 3, "is_correct": True },
                { "option_text": "Only writing code personally", "score": 1, "is_correct": False },
                { "option_text": "Eliminating documentation", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "PMI PMBOK"
        },
        {
            "major": "Information System",
            "skill_name": "IT Project Management",
            "question_number": 2,
            "question_text": "Why is a project schedule important?",
            "options": [
                { "option_text": "It organizes activities and supports planning and tracking", "score": 3, "is_correct": True },
                { "option_text": "It only serves as decoration", "score": 1, "is_correct": False },
                { "option_text": "It is unnecessary if a team is skilled", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "PMI Practice Standard for Scheduling"
        },
        {
            "major": "Information System",
            "skill_name": "IT Project Management",
            "question_number": 3,
            "question_text": "Which situation is the clearest example of scope creep?",
            "options": [
                { "option_text": "New features are added without formal impact review", "score": 3, "is_correct": True },
                { "option_text": "A task is completed on time", "score": 1, "is_correct": False },
                { "option_text": "A status meeting is held", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "PMI lexicon"
        },
        {
            "major": "Information System",
            "skill_name": "Systems Analysis and Design",
            "question_number": 1,
            "question_text": "What is the purpose of systems analysis before design begins?",
            "options": [
                { "option_text": "Understand requirements, constraints, and current problems", "score": 3, "is_correct": True },
                { "option_text": "Write production code immediately", "score": 1, "is_correct": False },
                { "option_text": "Only choose colors and icons", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "IBM systems and analytics resources"
        },
        {
            "major": "Information System",
            "skill_name": "Systems Analysis and Design",
            "question_number": 2,
            "question_text": "Which output best belongs to the design phase?",
            "options": [
                { "option_text": "A proposed solution architecture and process/data models", "score": 3, "is_correct": True },
                { "option_text": "An unrelated marketing slogan", "score": 1, "is_correct": False },
                { "option_text": "A random spreadsheet", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "IBM business intelligence"
        },
        {
            "major": "Information System",
            "skill_name": "Systems Analysis and Design",
            "question_number": 3,
            "question_text": "Why are stakeholder requirements critical in systems design?",
            "options": [
                { "option_text": "They shape functionality and acceptance of the solution", "score": 3, "is_correct": True },
                { "option_text": "They only matter after deployment", "score": 1, "is_correct": False },
                { "option_text": "They are optional in business systems", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "IBM analytics/process resources"
        },
        {
            "major": "Information System",
            "skill_name": "Decision Support Systems",
            "question_number": 1,
            "question_text": "What is the purpose of a decision support system (DSS)?",
            "options": [
                { "option_text": "Support managers with data, models, and analysis for decisions", "score": 3, "is_correct": True },
                { "option_text": "Only store wallpapers", "score": 1, "is_correct": False },
                { "option_text": "Avoid dashboards", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "IBM business intelligence"
        },
        {
            "major": "Information System",
            "skill_name": "Decision Support Systems",
            "question_number": 2,
            "question_text": "Which feature most improves the usefulness of a DSS?",
            "options": [
                { "option_text": "Timely, accurate, and relevant information", "score": 3, "is_correct": True },
                { "option_text": "Random data without validation", "score": 1, "is_correct": False },
                { "option_text": "Unclear visualizations", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "IBM Cognos Analytics"
        },
        {
            "major": "Information System",
            "skill_name": "Decision Support Systems",
            "question_number": 3,
            "question_text": "A manager compares sales trends by region and product before adjusting inventory. This is an example of:",
            "options": [
                { "option_text": "Decision support using analytics", "score": 3, "is_correct": True },
                { "option_text": "Protocol routing", "score": 1, "is_correct": False },
                { "option_text": "Penetration testing", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "IBM BI and analytics resources"
        },
        # Major: Network Computing
        {
            "major": "Network Computing",
            "skill_name": "Networking Fundamentals (OSI, TCP/IP)",
            "question_number": 1,
            "question_text": "Why is the OSI model useful in networking education and troubleshooting?",
            "options": [
                { "option_text": "It separates communication functions into layers", "score": 3, "is_correct": True },
                { "option_text": "It replaces all real protocols", "score": 1, "is_correct": False },
                { "option_text": "It is only for wireless networks", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "IETF / Cisco networking basics"
        },
        {
            "major": "Network Computing",
            "skill_name": "Networking Fundamentals (OSI, TCP/IP)",
            "question_number": 2,
            "question_text": "At which conceptual layer would IP addressing and routing decisions primarily be discussed?",
            "options": [
                { "option_text": "Network layer", "score": 3, "is_correct": True },
                { "option_text": "Physical layer", "score": 2, "is_correct": False },
                { "option_text": "Presentation layer", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Cisco routing concepts"
        },
        {
            "major": "Network Computing",
            "skill_name": "Networking Fundamentals (OSI, TCP/IP)",
            "question_number": 3,
            "question_text": "Which statement best compares TCP and UDP?",
            "options": [
                { "option_text": "TCP is connection-oriented, while UDP is connectionless", "score": 3, "is_correct": True },
                { "option_text": "UDP guarantees delivery, TCP does not", "score": 1, "is_correct": False },
                { "option_text": "Neither supports ports", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "IETF TCP and UDP standards"
        },
        {
            "major": "Network Computing",
            "skill_name": "Routing and Switching",
            "question_number": 1,
            "question_text": "What is the main job of a router?",
            "options": [
                { "option_text": "Forward packets between networks", "score": 3, "is_correct": True },
                { "option_text": "Render web pages", "score": 1, "is_correct": False },
                { "option_text": "Create user interface mockups", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Cisco IP unicast routing"
        },
        {
            "major": "Network Computing",
            "skill_name": "Routing and Switching",
            "question_number": 2,
            "question_text": "What is the main role of a switch in a local network?",
            "options": [
                { "option_text": "Forward frames within the LAN based on MAC information", "score": 3, "is_correct": True },
                { "option_text": "Assign public cloud budgets", "score": 1, "is_correct": False },
                { "option_text": "Perform sentiment analysis", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Cisco switching concepts"
        },
        {
            "major": "Network Computing",
            "skill_name": "Routing and Switching",
            "question_number": 3,
            "question_text": "Which route type is manually configured by an administrator?",
            "options": [
                { "option_text": "Static route", "score": 3, "is_correct": True },
                { "option_text": "Dynamic route", "score": 2, "is_correct": False },
                { "option_text": "Wireless beacon", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Cisco routing types documentation"
        },
        {
            "major": "Network Computing",
            "skill_name": "Network Configuration",
            "question_number": 1,
            "question_text": "What is the purpose of assigning a subnet mask in IPv4 configuration?",
            "options": [
                { "option_text": "To distinguish network and host portions of an address", "score": 3, "is_correct": True },
                { "option_text": "To increase screen resolution", "score": 1, "is_correct": False },
                { "option_text": "To replace DHCP", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "IETF addressing standards"
        },
        {
            "major": "Network Computing",
            "skill_name": "Network Configuration",
            "question_number": 2,
            "question_text": "If a host has the wrong default gateway configured, which problem is most likely?",
            "options": [
                { "option_text": "It may reach local devices but not remote networks", "score": 3, "is_correct": True },
                { "option_text": "It cannot display text files", "score": 1, "is_correct": False },
                { "option_text": "It becomes a switch", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Cisco routing and gateway concepts"
        },
        {
            "major": "Network Computing",
            "skill_name": "Network Configuration",
            "question_number": 3,
            "question_text": "Why is DNS configuration important on client devices?",
            "options": [
                { "option_text": "It allows domain names to resolve to IP addresses", "score": 3, "is_correct": True },
                { "option_text": "It provides physical link speed", "score": 1, "is_correct": False },
                { "option_text": "It stores packet captures", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "IETF DNS standards"
        },
        {
            "major": "Network Computing",
            "skill_name": "Troubleshooting Networks",
            "question_number": 1,
            "question_text": "Which approach is best when troubleshooting a connectivity issue?",
            "options": [
                { "option_text": "Use a structured method and isolate the failure step by step", "score": 3, "is_correct": True },
                { "option_text": "Randomly reboot devices until it works", "score": 1, "is_correct": False },
                { "option_text": "Ignore symptoms unless many users complain", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Cisco troubleshooting guidance"
        },
        {
            "major": "Network Computing",
            "skill_name": "Troubleshooting Networks",
            "question_number": 2,
            "question_text": "A user can ping the local gateway but not an external IP. Which area should be checked next?",
            "options": [
                { "option_text": "Upstream routing or internet path", "score": 3, "is_correct": True },
                { "option_text": "Keyboard drivers", "score": 1, "is_correct": False },
                { "option_text": "Printer toner", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Cisco routing concepts"
        },
        {
            "major": "Network Computing",
            "skill_name": "Troubleshooting Networks",
            "question_number": 3,
            "question_text": "Why are packet captures valuable during troubleshooting?",
            "options": [
                { "option_text": "They reveal what traffic is actually happening on the wire", "score": 3, "is_correct": True },
                { "option_text": "They always fix the issue automatically", "score": 1, "is_correct": False },
                { "option_text": "They are only for malware authors", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Wireshark user's guide"
        },
        {
            "major": "Network Computing",
            "skill_name": "Network Security Basics",
            "question_number": 1,
            "question_text": "Which practice best reduces exposure of network services?",
            "options": [
                { "option_text": "Allow only necessary services and ports", "score": 3, "is_correct": True },
                { "option_text": "Open every port for convenience", "score": 1, "is_correct": False },
                { "option_text": "Use shared admin accounts", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "NIST firewall guidance"
        },
        {
            "major": "Network Computing",
            "skill_name": "Network Security Basics",
            "question_number": 2,
            "question_text": "What is the purpose of a firewall in basic network security?",
            "options": [
                { "option_text": "Filter traffic according to security rules", "score": 3, "is_correct": True },
                { "option_text": "Store video files", "score": 1, "is_correct": False },
                { "option_text": "Improve projector brightness", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "NIST SP 800-41"
        },
        {
            "major": "Network Computing",
            "skill_name": "Network Security Basics",
            "question_number": 3,
            "question_text": "Why should unused network services be disabled?",
            "options": [
                { "option_text": "To reduce the attack surface", "score": 3, "is_correct": True },
                { "option_text": "To increase packet loss intentionally", "score": 1, "is_correct": False },
                { "option_text": "To stop DNS forever", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "NIST Cybersecurity Framework"
        },
        {
            "major": "Network Computing",
            "skill_name": "Wireless Networks",
            "question_number": 1,
            "question_text": "Which factor most directly affects Wi-Fi coverage and performance?",
            "options": [
                { "option_text": "Signal strength, interference, and channel planning", "score": 3, "is_correct": True },
                { "option_text": "Spreadsheet color", "score": 1, "is_correct": False },
                { "option_text": "Document margins", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Cisco enterprise wireless design guide"
        },
        {
            "major": "Network Computing",
            "skill_name": "Wireless Networks",
            "question_number": 2,
            "question_text": "Why is WPA2/WPA3 preferred over open wireless access?",
            "options": [
                { "option_text": "It protects access and traffic with stronger security controls", "score": 3, "is_correct": True },
                { "option_text": "It removes the need for SSIDs", "score": 1, "is_correct": False },
                { "option_text": "It eliminates all interference", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "NIST wireless security resources"
        },
        {
            "major": "Network Computing",
            "skill_name": "Wireless Networks",
            "question_number": 3,
            "question_text": "What is a common cause of unstable wireless performance in crowded areas?",
            "options": [
                { "option_text": "Channel interference from nearby networks", "score": 3, "is_correct": True },
                { "option_text": "Too many folders on the desktop", "score": 1, "is_correct": False },
                { "option_text": "Low website font size", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Cisco wireless design guide"
        },
        {
            "major": "Network Computing",
            "skill_name": "Protocol Analysis",
            "question_number": 1,
            "question_text": "What is the purpose of protocol analysis tools like Wireshark?",
            "options": [
                { "option_text": "Inspect packet-level network behavior", "score": 3, "is_correct": True },
                { "option_text": "Generate 3D graphics", "score": 1, "is_correct": False },
                { "option_text": "Edit videos", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Wireshark user guide"
        },
        {
            "major": "Network Computing",
            "skill_name": "Protocol Analysis",
            "question_number": 2,
            "question_text": "Which feature in Wireshark is especially useful for isolating relevant traffic?",
            "options": [
                { "option_text": "Display filters", "score": 3, "is_correct": True },
                { "option_text": "Slide transitions", "score": 1, "is_correct": False },
                { "option_text": "Printer queues", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Wireshark display filter reference"
        },
        {
            "major": "Network Computing",
            "skill_name": "Protocol Analysis",
            "question_number": 3,
            "question_text": "If repeated TCP retransmissions appear in a capture, what might that suggest?",
            "options": [
                { "option_text": "Possible packet loss or path quality issues", "score": 3, "is_correct": True },
                { "option_text": "Perfect network health", "score": 1, "is_correct": False },
                { "option_text": "A successful database backup", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Wireshark TCP analysis"
        },
        # Major: Software Engineering
        {
            "major": "Software Engineering",
            "skill_name": "Programming (Java, Python, C++)",
            "question_number": 1,
            "question_text": "Which practice most improves code readability and maintainability?",
            "options": [
                { "option_text": "Clear naming and modular structure", "score": 3, "is_correct": True },
                { "option_text": "One-letter names everywhere", "score": 1, "is_correct": False },
                { "option_text": "Avoiding indentation", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Python tutorial / Oracle Java docs"
        },
        {
            "major": "Software Engineering",
            "skill_name": "Programming (Java, Python, C++)",
            "question_number": 2,
            "question_text": "What does it usually mean if code works for one input but fails for edge cases?",
            "options": [
                { "option_text": "The implementation lacks robust logic and testing", "score": 3, "is_correct": True },
                { "option_text": "The compiler is always wrong", "score": 1, "is_correct": False },
                { "option_text": "Comments are the only issue", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Python tutorial / Oracle Java docs"
        },
        {
            "major": "Software Engineering",
            "skill_name": "Programming (Java, Python, C++)",
            "question_number": 3,
            "question_text": "Why is understanding data types and control flow fundamental in programming?",
            "options": [
                { "option_text": "They shape how values are stored and how logic executes", "score": 3, "is_correct": True },
                { "option_text": "They are only cosmetic", "score": 1, "is_correct": False },
                { "option_text": "They replace algorithms", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Python tutorial basics"
        },
        {
            "major": "Software Engineering",
            "skill_name": "Data Structures and Algorithms",
            "question_number": 1,
            "question_text": "Why is choosing the right data structure important?",
            "options": [
                { "option_text": "It affects performance, memory use, and solution clarity", "score": 3, "is_correct": True },
                { "option_text": "It only affects variable names", "score": 1, "is_correct": False },
                { "option_text": "It matters only in web design", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Python standard types"
        },
        {
            "major": "Software Engineering",
            "skill_name": "Data Structures and Algorithms",
            "question_number": 2,
            "question_text": "Which structure is generally best suited for first-in, first-out processing?",
            "options": [
                { "option_text": "Queue", "score": 3, "is_correct": True },
                { "option_text": "Stack", "score": 2, "is_correct": False },
                { "option_text": "Tree only", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Core programming and DSA resources"
        },
        {
            "major": "Software Engineering",
            "skill_name": "Data Structures and Algorithms",
            "question_number": 3,
            "question_text": "Why is algorithmic complexity considered during design?",
            "options": [
                { "option_text": "It helps estimate how a solution scales with input size", "score": 3, "is_correct": True },
                { "option_text": "It only matters for fonts", "score": 1, "is_correct": False },
                { "option_text": "It guarantees security", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Algorithm analysis foundations"
        },
        {
            "major": "Software Engineering",
            "skill_name": "Software Design Patterns",
            "question_number": 1,
            "question_text": "What is the purpose of a software design pattern?",
            "options": [
                { "option_text": "A reusable solution template for recurring design problems", "score": 3, "is_correct": True },
                { "option_text": "A fixed code generator that fits every case", "score": 1, "is_correct": False },
                { "option_text": "A visual theme package", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Refactoring.Guru design patterns"
        },
        {
            "major": "Software Engineering",
            "skill_name": "Software Design Patterns",
            "question_number": 2,
            "question_text": "Which pattern is commonly used when an object should notify multiple dependents of state changes?",
            "options": [
                { "option_text": "Observer", "score": 3, "is_correct": True },
                { "option_text": "Singleton only", "score": 2, "is_correct": False },
                { "option_text": "Interpreter for UI layout", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Refactoring.Guru Observer pattern"
        },
        {
            "major": "Software Engineering",
            "skill_name": "Software Design Patterns",
            "question_number": 3,
            "question_text": "Why should patterns be applied carefully rather than mechanically?",
            "options": [
                { "option_text": "Because forcing patterns can add unnecessary complexity", "score": 3, "is_correct": True },
                { "option_text": "Because patterns are always wrong", "score": 1, "is_correct": False },
                { "option_text": "Because code should never evolve", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Refactoring.Guru"
        },
        {
            "major": "Software Engineering",
            "skill_name": "Object-Oriented Programming (OOP)",
            "question_number": 1,
            "question_text": "Which concept allows an object to hide internal state behind methods?",
            "options": [
                { "option_text": "Encapsulation", "score": 3, "is_correct": True },
                { "option_text": "Routing", "score": 1, "is_correct": False },
                { "option_text": "Virtualization", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Oracle Java OOP tutorial"
        },
        {
            "major": "Software Engineering",
            "skill_name": "Object-Oriented Programming (OOP)",
            "question_number": 2,
            "question_text": "What is inheritance used for in OOP?",
            "options": [
                { "option_text": "To derive a new class from an existing one and reuse behavior", "score": 3, "is_correct": True },
                { "option_text": "To encrypt class files", "score": 1, "is_correct": False },
                { "option_text": "To build SQL indexes", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Oracle Java inheritance tutorial"
        },
        {
            "major": "Software Engineering",
            "skill_name": "Object-Oriented Programming (OOP)",
            "question_number": 3,
            "question_text": "Which situation best demonstrates polymorphism?",
            "options": [
                { "option_text": "Different subclasses responding to the same method call in their own way", "score": 3, "is_correct": True },
                { "option_text": "A variable using only one constant forever", "score": 1, "is_correct": False },
                { "option_text": "A firewall blocking traffic", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Oracle Java OOP tutorials"
        },
        {
            "major": "Software Engineering",
            "skill_name": "Version Control (Git)",
            "question_number": 1,
            "question_text": "What is the main purpose of Git in software development?",
            "options": [
                { "option_text": "Track changes and support collaboration", "score": 3, "is_correct": True },
                { "option_text": "Compile every language", "score": 1, "is_correct": False },
                { "option_text": "Host production databases", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Git documentation"
        },
        {
            "major": "Software Engineering",
            "skill_name": "Version Control (Git)",
            "question_number": 2,
            "question_text": "Why are branches useful in Git workflows?",
            "options": [
                { "option_text": "They let developers isolate work before merging", "score": 3, "is_correct": True },
                { "option_text": "They encrypt source code automatically", "score": 1, "is_correct": False },
                { "option_text": "They are only for backups", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Git branching documentation"
        },
        {
            "major": "Software Engineering",
            "skill_name": "Version Control (Git)",
            "question_number": 3,
            "question_text": "What is the purpose of a pull request in team workflows?",
            "options": [
                { "option_text": "To review and integrate changes in a controlled way", "score": 3, "is_correct": True },
                { "option_text": "To delete all commit history", "score": 1, "is_correct": False },
                { "option_text": "To avoid collaboration", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Git collaboration concepts"
        },
        {
            "major": "Software Engineering",
            "skill_name": "Testing (Unit / Integration)",
            "question_number": 1,
            "question_text": "What is the goal of unit testing?",
            "options": [
                { "option_text": "Verify small units of code behave as expected", "score": 3, "is_correct": True },
                { "option_text": "Test the whole enterprise network only", "score": 1, "is_correct": False },
                { "option_text": "Design UI screens", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Python unittest docs"
        },
        {
            "major": "Software Engineering",
            "skill_name": "Testing (Unit / Integration)",
            "question_number": 2,
            "question_text": "What does integration testing focus on?",
            "options": [
                { "option_text": "How components work together", "score": 3, "is_correct": True },
                { "option_text": "Only variable naming", "score": 1, "is_correct": False },
                { "option_text": "Wireless channel overlap", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Martin Fowler testing guidance"
        },
        {
            "major": "Software Engineering",
            "skill_name": "Testing (Unit / Integration)",
            "question_number": 3,
            "question_text": "Why are automated tests valuable in CI pipelines?",
            "options": [
                { "option_text": "They catch regressions quickly after changes", "score": 3, "is_correct": True },
                { "option_text": "They guarantee no future bugs", "score": 2, "is_correct": False },
                { "option_text": "They replace requirements gathering", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Martin Fowler CI guidance"
        },
        {
            "major": "Software Engineering",
            "skill_name": "Software Architecture",
            "question_number": 1,
            "question_text": "What is software architecture mainly concerned with?",
            "options": [
                { "option_text": "The high-level structure and interaction of system components", "score": 3, "is_correct": True },
                { "option_text": "Only file naming", "score": 1, "is_correct": False },
                { "option_text": "Only CSS themes", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Martin Fowler architecture articles"
        },
        {
            "major": "Software Engineering",
            "skill_name": "Software Architecture",
            "question_number": 2,
            "question_text": "Why is architectural decomposition useful in large systems?",
            "options": [
                { "option_text": "It improves manageability, scalability, and separation of concerns", "score": 3, "is_correct": True },
                { "option_text": "It removes all testing needs", "score": 1, "is_correct": False },
                { "option_text": "It only helps interns", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Martin Fowler microservices"
        },
        {
            "major": "Software Engineering",
            "skill_name": "Software Architecture",
            "question_number": 3,
            "question_text": "Which tradeoff should architects evaluate when choosing between monolithic and distributed designs?",
            "options": [
                { "option_text": "Complexity versus deployment and scaling flexibility", "score": 3, "is_correct": True },
                { "option_text": "Only icon style", "score": 1, "is_correct": False },
                { "option_text": "No tradeoffs exist", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Martin Fowler microservices article"
        },
        {
            "major": "Software Engineering",
            "skill_name": "Debugging and Problem Solving",
            "question_number": 1,
            "question_text": "When debugging an intermittent failure, what is the best first step?",
            "options": [
                { "option_text": "Collect evidence such as logs, inputs, and failure conditions", "score": 3, "is_correct": True },
                { "option_text": "Rewrite the entire application immediately", "score": 1, "is_correct": False },
                { "option_text": "Delete warning messages", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Software debugging best practices"
        },
        {
            "major": "Software Engineering",
            "skill_name": "Debugging and Problem Solving",
            "question_number": 2,
            "question_text": "What makes debugging systematic rather than random?",
            "options": [
                { "option_text": "Forming hypotheses and testing them against evidence", "score": 3, "is_correct": True },
                { "option_text": "Changing many things at once", "score": 1, "is_correct": False },
                { "option_text": "Relying on luck", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Testing and problem-solving references"
        },
        {
            "major": "Software Engineering",
            "skill_name": "Debugging and Problem Solving",
            "question_number": 3,
            "question_text": "Why is reproducing a bug important?",
            "options": [
                { "option_text": "It helps isolate the real cause and confirm the fix", "score": 3, "is_correct": True },
                { "option_text": "It makes the bug worse intentionally", "score": 1, "is_correct": False },
                { "option_text": "It is only useful in networks", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Testing and debugging practice references"
        },
        # Major: Web and Mobile Technologies
        {
            "major": "Web and Mobile Technologies",
            "skill_name": "HTML",
            "question_number": 1,
            "question_text": "What is the primary role of HTML in web development?",
            "options": [
                { "option_text": "Define page structure and semantic content", "score": 3, "is_correct": True },
                { "option_text": "Apply visual styling only", "score": 1, "is_correct": False },
                { "option_text": "Train machine-learning models", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "MDN HTML overview"
        },
        {
            "major": "Web and Mobile Technologies",
            "skill_name": "HTML",
            "question_number": 2,
            "question_text": "Why are semantic HTML elements important?",
            "options": [
                { "option_text": "They improve structure, accessibility, and maintainability", "score": 3, "is_correct": True },
                { "option_text": "They replace CSS", "score": 1, "is_correct": False },
                { "option_text": "They prevent all browser bugs", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "MDN HTML basics"
        },
        {
            "major": "Web and Mobile Technologies",
            "skill_name": "HTML",
            "question_number": 3,
            "question_text": "Which element is most appropriate for a major page heading?",
            "options": [
                { "option_text": "h1", "score": 3, "is_correct": True },
                { "option_text": "div", "score": 2, "is_correct": False },
                { "option_text": "script", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "MDN HTML reference"
        },
        {
            "major": "Web and Mobile Technologies",
            "skill_name": "CSS",
            "question_number": 1,
            "question_text": "What is the main purpose of CSS?",
            "options": [
                { "option_text": "Control presentation and layout of web content", "score": 3, "is_correct": True },
                { "option_text": "Store relational data", "score": 1, "is_correct": False },
                { "option_text": "Capture packets", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "MDN CSS overview"
        },
        {
            "major": "Web and Mobile Technologies",
            "skill_name": "CSS",
            "question_number": 2,
            "question_text": "Which CSS approach is commonly used to create responsive layouts?",
            "options": [
                { "option_text": "Flexbox or Grid", "score": 3, "is_correct": True },
                { "option_text": "SQL joins", "score": 1, "is_correct": False },
                { "option_text": "AES encryption", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "MDN layout guides"
        },
        {
            "major": "Web and Mobile Technologies",
            "skill_name": "CSS",
            "question_number": 3,
            "question_text": "Why is separating HTML structure from CSS styling beneficial?",
            "options": [
                { "option_text": "It improves maintainability and reuse", "score": 3, "is_correct": True },
                { "option_text": "It prevents all accessibility issues", "score": 1, "is_correct": False },
                { "option_text": "It removes the need for testing", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "MDN CSS learning resources"
        },
        {
            "major": "Web and Mobile Technologies",
            "skill_name": "JavaScript",
            "question_number": 1,
            "question_text": "What is JavaScript primarily used for on the web?",
            "options": [
                { "option_text": "Adding behavior and interactivity", "score": 3, "is_correct": True },
                { "option_text": "Replacing HTML structure", "score": 1, "is_correct": False },
                { "option_text": "Configuring routers", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "MDN JavaScript overview"
        },
        {
            "major": "Web and Mobile Technologies",
            "skill_name": "JavaScript",
            "question_number": 2,
            "question_text": "Why are functions central in JavaScript programming?",
            "options": [
                { "option_text": "They organize reusable logic", "score": 3, "is_correct": True },
                { "option_text": "They only affect styling", "score": 1, "is_correct": False },
                { "option_text": "They are used only in Node.js", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "MDN JavaScript guide"
        },
        {
            "major": "Web and Mobile Technologies",
            "skill_name": "JavaScript",
            "question_number": 3,
            "question_text": "What is the practical benefit of understanding asynchronous JavaScript?",
            "options": [
                { "option_text": "It helps handle operations like fetching data without blocking the UI", "score": 3, "is_correct": True },
                { "option_text": "It removes all need for APIs", "score": 1, "is_correct": False },
                { "option_text": "It disables events", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "MDN asynchronous JavaScript"
        },
        {
            "major": "Web and Mobile Technologies",
            "skill_name": "Frontend Frameworks (React)",
            "question_number": 1,
            "question_text": "What is React mainly used for?",
            "options": [
                { "option_text": "Building component-based user interfaces", "score": 3, "is_correct": True },
                { "option_text": "Managing SQL replication", "score": 1, "is_correct": False },
                { "option_text": "Encrypting storage volumes", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "React official docs"
        },
        {
            "major": "Web and Mobile Technologies",
            "skill_name": "Frontend Frameworks (React)",
            "question_number": 2,
            "question_text": "Why is state important in React components?",
            "options": [
                { "option_text": "It allows the UI to update based on changing data", "score": 3, "is_correct": True },
                { "option_text": "It replaces HTML semantics", "score": 1, "is_correct": False },
                { "option_text": "It stores DNS records", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "React learn docs"
        },
        {
            "major": "Web and Mobile Technologies",
            "skill_name": "Frontend Frameworks (React)",
            "question_number": 3,
            "question_text": "What is a key advantage of reusable components in React?",
            "options": [
                { "option_text": "They reduce duplication and improve consistency", "score": 3, "is_correct": True },
                { "option_text": "They eliminate testing", "score": 1, "is_correct": False },
                { "option_text": "They work only on mobile", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "MDN React / React docs"
        },
        {
            "major": "Web and Mobile Technologies",
            "skill_name": "Backend (Node.js / APIs)",
            "question_number": 1,
            "question_text": "What is Node.js commonly used for in web applications?",
            "options": [
                { "option_text": "Running JavaScript on the server", "score": 3, "is_correct": True },
                { "option_text": "Styling pages with CSS", "score": 1, "is_correct": False },
                { "option_text": "Designing logos", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Node.js API docs"
        },
        {
            "major": "Web and Mobile Technologies",
            "skill_name": "Backend (Node.js / APIs)",
            "question_number": 2,
            "question_text": "Why are backend APIs important?",
            "options": [
                { "option_text": "They let clients exchange data and operations with servers in a defined way", "score": 3, "is_correct": True },
                { "option_text": "They replace databases completely", "score": 1, "is_correct": False },
                { "option_text": "They remove authentication automatically", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "MDN web APIs introduction"
        },
        {
            "major": "Web and Mobile Technologies",
            "skill_name": "Backend (Node.js / APIs)",
            "question_number": 3,
            "question_text": "Which statement best describes Express in the Node.js ecosystem?",
            "options": [
                { "option_text": "A widely used web framework for routing and middleware", "score": 3, "is_correct": True },
                { "option_text": "A database engine", "score": 1, "is_correct": False },
                { "option_text": "A cloud hypervisor", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "MDN Express/Node introduction"
        },
        {
            "major": "Web and Mobile Technologies",
            "skill_name": "Databases (SQL / NoSQL)",
            "question_number": 1,
            "question_text": "When is a relational SQL database especially suitable?",
            "options": [
                { "option_text": "When structured data and consistency constraints are important", "score": 3, "is_correct": True },
                { "option_text": "When no schema is needed at all", "score": 1, "is_correct": False },
                { "option_text": "When only images are stored", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "PostgreSQL documentation"
        },
        {
            "major": "Web and Mobile Technologies",
            "skill_name": "Databases (SQL / NoSQL)",
            "question_number": 2,
            "question_text": "What is one common reason to use a NoSQL database?",
            "options": [
                { "option_text": "Flexible data models for certain workloads", "score": 3, "is_correct": True },
                { "option_text": "To replace all application logic", "score": 1, "is_correct": False },
                { "option_text": "To avoid backups forever", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "MongoDB data model concepts"
        },
        {
            "major": "Web and Mobile Technologies",
            "skill_name": "Databases (SQL / NoSQL)",
            "question_number": 3,
            "question_text": "What should developers consider when choosing between SQL and NoSQL?",
            "options": [
                { "option_text": "Data structure, consistency needs, queries, and scaling patterns", "score": 3, "is_correct": True },
                { "option_text": "Only the logo of the product", "score": 1, "is_correct": False },
                { "option_text": "Only keyboard preference", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "PostgreSQL docs / MongoDB docs"
        },
        {
            "major": "Web and Mobile Technologies",
            "skill_name": "Mobile Development Basics",
            "question_number": 1,
            "question_text": "What is a key difference between mobile and desktop application development?",
            "options": [
                { "option_text": "Mobile apps must account for smaller screens and touch interaction", "score": 3, "is_correct": True },
                { "option_text": "Mobile apps never use networks", "score": 1, "is_correct": False },
                { "option_text": "There is no difference", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Android developer guide / Apple HIG"
        },
        {
            "major": "Web and Mobile Technologies",
            "skill_name": "Mobile Development Basics",
            "question_number": 2,
            "question_text": "Why is performance optimization important in mobile apps?",
            "options": [
                { "option_text": "Mobile devices have constraints such as battery, memory, and variable connectivity", "score": 3, "is_correct": True },
                { "option_text": "Performance never affects user experience", "score": 1, "is_correct": False },
                { "option_text": "It is only for games", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Android performance guidance"
        },
        {
            "major": "Web and Mobile Technologies",
            "skill_name": "Mobile Development Basics",
            "question_number": 3,
            "question_text": "Which practice most improves usability in mobile interfaces?",
            "options": [
                { "option_text": "Designing for touch-friendly controls and responsive layouts", "score": 3, "is_correct": True },
                { "option_text": "Using tiny buttons close together", "score": 1, "is_correct": False },
                { "option_text": "Ignoring orientation changes", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Apple HIG / Android design guidance"
        },
        {
            "major": "Web and Mobile Technologies",
            "skill_name": "REST APIs",
            "question_number": 1,
            "question_text": "What is a core idea behind RESTful API design?",
            "options": [
                { "option_text": "Resources are addressed and manipulated using standard HTTP methods", "score": 3, "is_correct": True },
                { "option_text": "All responses must be images", "score": 1, "is_correct": False },
                { "option_text": "REST replaces databases", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "MDN Web APIs and HTTP references"
        },
        {
            "major": "Web and Mobile Technologies",
            "skill_name": "REST APIs",
            "question_number": 2,
            "question_text": "Which HTTP method is commonly used to retrieve a resource without modifying it?",
            "options": [
                { "option_text": "GET", "score": 3, "is_correct": True },
                { "option_text": "POST", "score": 2, "is_correct": False },
                { "option_text": "DELETE", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "MDN HTTP methods reference"
        },
        {
            "major": "Web and Mobile Technologies",
            "skill_name": "REST APIs",
            "question_number": 3,
            "question_text": "Why are status codes important in API responses?",
            "options": [
                { "option_text": "They communicate the outcome of the request clearly", "score": 3, "is_correct": True },
                { "option_text": "They only affect CSS", "score": 1, "is_correct": False },
                { "option_text": "They replace documentation", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "MDN HTTP references"
        },
        {
            "major": "Web and Mobile Technologies",
            "skill_name": "UI/UX Basics",
            "question_number": 1,
            "question_text": "What is a core goal of good UI/UX design?",
            "options": [
                { "option_text": "Make systems understandable, efficient, and usable for users", "score": 3, "is_correct": True },
                { "option_text": "Add as many controls as possible", "score": 1, "is_correct": False },
                { "option_text": "Hide important actions", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Nielsen Norman Group usability heuristics"
        },
        {
            "major": "Web and Mobile Technologies",
            "skill_name": "UI/UX Basics",
            "question_number": 2,
            "question_text": "Which design principle helps users feel confident while interacting with a system?",
            "options": [
                { "option_text": "Consistency and adherence to standards", "score": 3, "is_correct": True },
                { "option_text": "Random layout changes on every page", "score": 1, "is_correct": False },
                { "option_text": "Invisible navigation", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "NN/g consistency heuristic"
        },
        {
            "major": "Web and Mobile Technologies",
            "skill_name": "UI/UX Basics",
            "question_number": 3,
            "question_text": "Why is heuristic evaluation useful in early product assessment?",
            "options": [
                { "option_text": "It can identify usability issues before full deployment", "score": 3, "is_correct": True },
                { "option_text": "It replaces all user testing forever", "score": 1, "is_correct": False },
                { "option_text": "It is useful only after launch", "score": 1, "is_correct": False }
            ],
            "correct_index": 0,
            "source": "Nielsen Norman Group heuristic evaluation method"
        }
    ]
    
    try:
        # Clear existing documents
        tech_qs_collection.delete_many({})
        logger.info("Cleared existing documents in technical_questions collection.")
        
        # Insert all questions
        result = tech_qs_collection.insert_many(questions_data)
        logger.info(f"Successfully inserted {len(result.inserted_ids)} documents.")
        
        # Count per major
        major_counts = {}
        for q in questions_data:
            major = q["major"]
            major_counts[major] = major_counts.get(major, 0) + 1
            
        logger.info("Count per major:")
        for major, count in major_counts.items():
            logger.info(f"  {major}: {count}")
            
        print("Seeding complete.")
        
    except Exception as e:
        logger.error(f"Failed to seed technical questions: {e}")
        raise

if __name__ == "__main__":
    seed_technical_questions()
