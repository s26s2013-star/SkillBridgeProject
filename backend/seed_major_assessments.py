import logging
from sentence_transformers import SentenceTransformer
from database import get_db

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def seed_major_assessments():
    db = get_db()
    collection = db["major_assessments"]
    
    logger.info("Loading SentenceTransformer model 'all-MiniLM-L6-v2'...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    
    majors_data = [
        {
            "major": "Software Engineering",
            "task_description": "Scenario: You are tasked with designing the architecture for a global E-commerce platform that expects million of concurrent users during peak sales events. \n\nTask: Explain your approach to ensuring scalability, reliability, and maintainability. Describe the architectural patterns (e.g., Microservices, Event-driven), database choices (SQL vs NoSQL), and how you would handle distributed transactions or consistency. Your response should be a technical essay or a detailed architectural outline.",
            "ideal_answer_text": """To build a truly scalable and reliable global e-commerce platform, a Microservices architecture is the fundamental choice. This approach allows for independent scaling of critical services such as 'Checkout', 'Inventory', and 'User Profile', ensuring that a bottleneck in one doesn't bring down the entire system. I would implement an Event-Driven architecture using a high-throughput message broker like Apache Kafka. This facilitates asynchronous communication, which is vital for performance during peak loads like Black Friday sales. For instance, when an order is placed, an event is emitted, and downstream services like 'Shipping' and 'Email' consume it at their own pace without delaying the customer's checkout experience.

Regarding data management, a 'Polyglot Persistence' strategy is necessary. I would use PostgreSQL for transactional data (Orders, Payments) because its ACID compliance is non-negotiable for financial records. For the 'Product Catalog', which requires high availability and a flexible schema to handle diverse product attributes, a NoSQL database like MongoDB is more appropriate. For real-time inventory counts and session management, an in-memory store like Redis is essential to minimize latency. 

Handling distributed transactions without traditional two-phase commits is a significant challenge. I would implement the Saga Pattern, specifically the 'Orchestration' approach, where a central controller manages the compensating transactions if a step in the order process fails. This maintains eventual consistency without the performance penalties of distributed locking.

To ensure reliability, I would deploy the application across multiple geographic regions with a sophisticated Load Balancing setup. A Content Delivery Network (CDN) like CloudFront would cache static assets closer to users, reducing latency globally. I would also implement 'Circuit Breaker' patterns using tools like Resilience4j to prevent cascading failures.

For maintainability and rapid deployment, a robust CI/CD pipeline is mandatory. I would containerize all services using Docker and manage them via Kubernetes (K8s) for automated scaling, self-healing, and rolling updates. Observability would be achieved through the ELK Stack (Elasticsearch, Logstash, Kibana) for logs and Prometheus/Grafana for real-time performance metrics and alerting. This comprehensive approach ensures that the platform is not only performant and resilient but also easy to evolve as business requirements change over time.""",
            "required_keywords": ["Microservices", "Kafka", "PostgreSQL", "NoSQL", "Event-Driven", "Saga Pattern", "Kubernetes", "Redis", "CDN", "Load Balancing", "Consistency", "Scalability"],
            "skills_covered": [
                {"name": "System Design", "keywords": ["architecture", "loose coupling", "distributed", "components"]},
                {"name": "Microservices", "keywords": ["services", "API", "independent scaling", "Saga"]},
                {"name": "Scalability", "keywords": ["horizontal scaling", "load balancer", "CDN", "auto-scaling"]},
                {"name": "Database Management", "keywords": ["PostgreSQL", "MongoDB", "NoSQL", "ACID", "Persistence"]},
                {"name": "DevOps", "keywords": ["CI/CD", "Kubernetes", "monitoring", "Prometheus"]}
            ]
        },
        {
            "major": "Data Science & AI",
            "task_description": "Scenario: You are given a large dataset of customer behavior and asked to develop a churn prediction model. \n\nTask: Outline your end-to-end data science workflow. Describe how you would handle data cleaning, feature engineering, model selection, and evaluation. Specifically, discuss how you would deal with imbalanced classes and what metrics you would prioritize (Precision, Recall, F1-score). Also, explain how you would deploy this model into a production environment.",
            "ideal_answer_text": """An effective end-to-end data science workflow for churn prediction begins with rigorous Exploratory Data Analysis (EDA). This phase involves visualizing distributions, identifying outliers, and understanding the correlations between user actions—like login frequency or support ticket count—and the outcome of churn. Data cleaning is the next critical step, where I would address missing values through median imputation for numerical data and mode imputation for categorical data. I would also perform one-hot encoding for nominal features and label encoding for ordinal ones.

Feature engineering is where domain expertise meets data. I would derive new features such as 'Days since last purchase', 'Customer Lifetime Value (CLV)', and 'Trend in usage frequency' over the last 30 days compared to the previous 60. These temporal features often carry more predictive power than raw data points.

A major challenge in churn prediction is class imbalance, as most customers typically don't churn. I would address this by using SMOTE (Synthetic Minority Over-sampling Technique) to balance the training set or by adjusting the 'class_weight' parameter in models like Random Forest or XGBoost. For model selection, I would evaluate multiple algorithms including Logistic Regression (as a baseline), Random Forest, and Gradient Boosting Machines (XGBoost/LightGBM).

Evaluation metrics must be chosen carefully. Since missing a potential churner (False Negative) is usually more expensive than misidentifying a loyal customer as a churner (False Positive), I would prioritize 'Recall'. However, to ensure we aren't wasting marketing resources on everyone, I would use the F1-score to maintain a balance between Precision and Recall. I would also analyze the Area Under the Precision-Recall Curve (AUPRC), as it is more informative than AUC-ROC for imbalanced datasets.

Finally, for production deployment, I would wrap the trained model in a RESTful API using FastAPI. The entire environment would be containerized with Docker to ensure consistency across development and production. I would implement a model monitoring solution using MLflow to track performance drift and data drift. If the model's performance drops below a predefined threshold, an automated CI/CD pipeline would trigger a retraining job using the most recent data, ensuring the churn predictions remain accurate in a changing market.""",
            "required_keywords": ["EDA", "Feature Engineering", "SMOTE", "XGBoost", "Random Forest", "Recall", "F1-score", "Precision", "AUPRC", "FastAPI", "Docker", "MLflow", "Imbalanced"],
            "skills_covered": [
                {"name": "Machine Learning", "keywords": ["XGBoost", "Random Forest", "Supervised Learning", "churn", "model"]},
                {"name": "Data Preprocessing", "keywords": ["EDA", "feature engineering", "cleaning", "SMOTE", "imputation"]},
                {"name": "Statistical Analysis", "keywords": ["Correlation", "distributions", "Recall", "Precision", "AUPRC"]},
                {"name": "Model Deployment", "keywords": ["API", "Docker", "MLflow", "production", "containerization"]},
                {"name": "Python/R", "keywords": ["pandas", "scikit-learn", "numpy", "programming"]}
            ]
        },
        {
            "major": "Cyber Security",
            "task_description": "Scenario: A corporate network has been breached via a phishing attack, and ransomware is spreading. \n\nTask: Propose an Incident Response Plan. Detail the steps for identification, containment, eradication, and recovery. Explain the technical measures you would take (e.g., VLAN isolation, log analysis) and what preventive strategies (e.g., Zero Trust, MFA) you would recommend to avoid future occurrences.",
            "ideal_answer_text": """In the event of a ransomware breach, a structured Incident Response Plan following the NIST or SANS framework is vital. The first phase is 'Preparation', which should have already involved regular air-gapped backups and an incident response team. Once the threat is live, we move to 'Identification'. I would use a SIEM (Security Information and Event Management) tool like Splunk to aggregate logs from firewalls, servers, and endpoints. By searching for indicators of compromise (IoCs) such as suspicious outgoing traffic to known malicious IPs or unusual file encryption patterns, we can determine the patient zero and the extent of the lateral movement.

The 'Containment' phase is urgent. I would immediately isolate the affected network segments using VLANs and shut down the 'Command and Control' (C2) communication by blocking specific ports and protocols at the edge firewall. Disabling compromised user accounts in Active Directory is also a priority to stop further credential-based movement.

For 'Eradication', we must ensure the threat is completely removed. This involves wiping the storage on all infected machines and performing a clean install of the operating system. We should not simply 'clean' the files, as modern ransomware can hide persistent backdoors. 'Recovery' involves restoring data from the most recent known-good backups. This must be done carefully, verifying that the backups themselves are not infected.

To prevent future occurrences, I recommend a 'Zero Trust' architecture. This philosophy assumes that the network is already breached and requires continuous verification for every access request. Implementing Multi-Factor Authentication (MFA) across all corporate resources is the single most effective way to neutralize the phishing-based credential theft that started this incident.

Furthermore, I would implement an Endpoint Detection and Response (EDR) solution like CrowdStrike to provide real-time visibility and automated blocking of suspicious behavior. Regular 'Vulnerability Assessments' and penetration testing should be conducted to identify and patch security gaps. Finally, employee awareness training is essential to transform the staff from a vulnerability into a first line of defense against social engineering and phishing attacks.""",
            "required_keywords": ["SIEM", "VLAN", "Containment", "Eradication", "IoC", "Zero Trust", "MFA", "EDR", "Active Directory", "NIST", "Encryption", "Backups"],
            "skills_covered": [
                {"name": "Network Security", "keywords": ["VLAN", "Firewall", "Zero Trust", "Isolation"]},
                {"name": "Incident Response", "keywords": ["SIEM", "containment", "eradication", "logs", "IoC"]},
                {"name": "Cryptography", "keywords": ["encryption", "at rest", "in transit", "MFA"]},
                {"name": "Vulnerability Assessment", "keywords": ["scanning", "penetration testing", "EDR"]},
                {"name": "Cloud Security", "keywords": ["Identity Management", "IAM", "least privilege"]}
            ]
        },
        {
            "major": "Web & Mobile Technologies",
            "task_description": "Scenario: Design a mobile-first Progressive Web App (PWA) for a restaurant delivery service. \n\nTask: Explain how you would implement offline functionality, push notifications, and high performance on mobile devices. Discuss your choice of frontend framework (React, Vue, etc.), state management, and how you would optimize image loading and overall bundle size.",
            "ideal_answer_text": """Building a high-performance restaurant delivery PWA requires a deep focus on speed and reliability. I would select React as the frontend framework due to its rich ecosystem and excellent support for component-based architecture. To ensure a fast 'Time to Interactive', I would use Vite as the build tool because of its superior development velocity and optimized production builds.

To achieve 'offline-first' functionality, I would implement a Service Worker using Workbox. I would adopt a 'Cache-First' strategy for static assets (icons, fonts, CSS) and a 'Stale-While-Revalidate' strategy for dynamic content like the restaurant menu. This ensures that the user sees the menu instantly, even on poor connections, while the app updates the data in the background. For the checkout process, I would use IndexedDB to store the user's cart locally, allowing them to continue their order even if they temporarily lose signal.

Push Notifications are essential for a delivery service. I would utilize the Web Push API combined with Firebase Cloud Messaging (FCM). This allows the backend to send real-time updates—such as 'Your food is out for delivery'—directly to the user's device, even when the browser is closed, significantly increasing engagement.

Performance optimization would prioritize mobile users. I would implement 'Image Lazy Loading' using the native 'loading=lazy' attribute and serve all images in the WebP format to minimize data usage without sacrificing quality. For the JavaScript bundle, I would use 'Dynamic Imports' for code-splitting, ensuring that users only download the code needed for the current page.

State management would be handled by 'React Query' (TanStack Query), which excels at managing server state, automatic caching, and background data synchronization. For UI, I would use 'Tailwind CSS' to keep the CSS bundle extremely small and ensure a fully responsive, mobile-first design. Finally, I would ensure the app meets all PWA criteria (Manifest.json, HTTPS, Service Worker) to provide a true 'app-like' experience, including a custom splash screen and the ability to be 'Added to Home Screen' on both iOS and Android platforms.""",
            "required_keywords": ["PWA", "Service Worker", "Workbox", "IndexedDB", "Web Push API", "Firebase", "Lazy Loading", "WebP", "Code-splitting", "React Query", "Tailwind CSS", "Vite"],
            "skills_covered": [
                {"name": "Frontend Development", "keywords": ["React", "JavaScript", "Vite", "PWA", "Service Workers"]},
                {"name": "Mobile App Development", "keywords": ["mobile-first", "Notifications", "responsive"]},
                {"name": "UI/UX Design", "keywords": ["animations", "Accessibility", "Splash screen"]},
                {"name": "API Integration", "keywords": ["React Query", "JSON", "REST", "Firebase"]},
                {"name": "Web Performance", "keywords": ["Lazy loading", "WebP", "Code splitting", "Lighthouse"]}
            ]
        },
        {
            "major": "Information Systems",
            "task_description": "Scenario: An organization wants to centralize its customer data by implementing a CRM system integrated with its existing ERP. \n\nTask: Outline the project lifecycle for this implementation. Discuss how you would handle requirements gathering, data migration from legacy systems, and user training. Explain the importance of data governance and how you would measure the success of the project (KPIs).",
            "ideal_answer_text": """The implementation of an integrated CRM (Customer Relationship Management) and ERP (Enterprise Resource Planning) system is a transformational project that requires a meticulous 'System Development Life Cycle' (SDLC). The process begins with 'Requirements Gathering', where I would facilitate workshops with key stakeholders from Sales, Finance, and Operations. The goal is to identify common data nodes—such as customer records and inventory levels—that must stay synchronized between the two systems to eliminate data silos.

'Data Migration' is often the most complex phase. I would follow an ETL (Extract, Transform, Load) process. First, I would extract data from fragmented legacy databases. The 'Transform' phase is critical for data cleansing; we must deduplicate customer records and standardize formats (e.g., date formats, currency codes). Only after the data is 'clean' would I load it into the new centralized environment. I would use 'Middleware' like MuleSoft or specialized API connectors to ensure a bidirectional, real-time sync between the CRM and ERP.

'Data Governance' is the foundation of long-term success. I would establish a governance council to define data ownership, quality standards, and security protocols. This ensures that as the system grows, the data remains a reliable asset for decision-making rather than a liability of conflicting information.

'User Training' must be diversified to ensure adoption. I would implement a 'Train-the-Trainer' model, supplemented by interactive sandboxes and detailed documentation. This addresses organizational change management, helping employees understand how the new system makes their jobs easier.

Finally, we measure success through predefined 'Key Performance Indicators (KPIs)'. These would include the 'Data Accuracy Rate', 'User Adoption Percentage', and business-level metrics like 'Lead-to-Order Conversion Time' and 'Customer Acquisition Cost'. By monitoring these KPIs in a post-implementation phase, we can identify areas for continuous improvement, ensuring that the technology investment delivers the expected strategic value to the organization.""",
            "required_keywords": ["SDLC", "CRM", "ERP", "ETL", "Data Migration", "Middleware", "Data Governance", "KPI", "Silos", "Stakeholders", "Deduplication", "API"],
            "skills_covered": [
                {"name": "Business Analysis", "keywords": ["requirements gathering", "stakeholders", "functional"]},
                {"name": "Project Management", "keywords": ["SDLC", "lifecycle", "KPI", "ETL"]},
                {"name": "ERP/CRM Systems", "keywords": ["Integration", "Middleware", "Data migration"]},
                {"name": "Data Governance", "keywords": ["Cleansing", "standardization", "integrity", "access controls"]},
                {"name": "Enterprise Architecture", "keywords": ["scalability", "centralized", "infrastructure"]}
            ]
        },
        {
            "major": "Network Computing",
            "task_description": "Scenario: Design a scalable and secure network for a company with a headquarters and three remote branch offices. \n\nTask: Describe your choice of network topology, hardware (routers, switches, firewalls), and connectivity methods (e.g., SD-WAN, Site-to-Site VPN). Explain how you would implement network security (VLANs, ACLs, IDS/IPS) and ensure high availability through redundancy and failover mechanisms.",
            "ideal_answer_text": """Designing a resilient multi-site network requires a shift toward modern, software-defined technologies. For the connectivity between the Headquarters (HQ) and the three branch offices, I would implement an 'SD-WAN' (Software-Defined Wide Area Network) solution. Unlike traditional MPLS, SD-WAN allows for dynamic path selection across multiple links (LTE, Broadband, Fiber), ensuring high availability and cost-effectiveness. For additional security, all traffic would be protected by 'Site-to-Site VPN' tunnels using IPsec encryption.

Within the HQ, I would adopt a 'Three-Tier Hierarchical Model' (Core, Distribution, and Access layers) to ensure performance and logical management. 'Network Security' would be baked into the design through micro-segmentation using 'VLANs'. For example, Guest Wi-Fi, IoT devices, and Executive workstations would all reside on isolated segments. I would implement 'Access Control Lists (ACLs)' at the VLAN gateways to enforce the principle of least privilege.

At the perimeter, I would deploy 'Next-Generation Firewalls (NGFW)' with integrated 'Intrusion Detection and Prevention Systems (IDS/IPS)'. These systems would perform 'Deep Packet Inspection' to identify and block threats like SQL injection or malware downloads before they enter the internal network.

A key requirement is 'High Availability'. I would implement hardware redundancy for all core components. For routers, I would use First-Hop Redundancy Protocols like 'VRRP' or 'HSRP' to provide a virtual gateway that remains reachable even if a physical router fails. For the switches, I would use 'Link Aggregation (LACP)' to bond multiple physical cables into a single high-bandwidth logical link with built-in failover.

Finally, for 'Network Administration' and monitoring, I would implement an SNMP-based monitoring suite. Centralized authentication via 'RADIUS' or 'TACACS+' would be used for all administrative tasks on networking equipment, ensuring a clear audit trail. This design provides a secure, high-performance foundation that can easily scale as the company adds more branch offices in the future.""",
            "required_keywords": ["SD-WAN", "VPN", "IPsec", "VLAN", "ACL", "NGFW", "IDS/IPS", "VRRP", "HSRP", "LACP", "SNMP", "RADIUS", "Segmentaton"],
            "skills_covered": [
                {"name": "Network Administration", "keywords": ["SD-WAN", "Management", "SNMP", "RADIUS"]},
                {"name": "Infrastructure", "keywords": ["topologies", "hardware", "redundancy", "BGP"]},
                {"name": "Cloud Networking", "keywords": ["VPN", "hybrid", "connectivity"]},
                {"name": "Routing & Switching", "keywords": ["VLAN", "LACP", "HSRP", "VRRP", "Backbone"]},
                {"name": "Network Security", "keywords": ["IDS/IPS", "Firewall", "ACL", "SSH"]}
            ]
        },
        {
            "major": "Cloud Computing",
            "task_description": "Scenario: A company wants to migrate its on-premise monolithic application to a cloud-native microservices architecture on a platform like AWS. \n\nTask: Explain the '6 Rs' of migration strategy. Describe how you would utilize containers (Docker), orchestration (Kubernetes), and serverless (Lambda) in your new architecture. Discuss the implementation of CI/CD, auto-scaling, and managed database services.",
            "ideal_answer_text": """A successful migration from a monolith to the cloud begins with the '6 Rs' framework: Rehost (Lift-and-Shift), Replatform (Lift-and-Reshape), Refactor (Decouple and Rewrite), Repurchase (SaaS), Retire, and Retain. To truly leverage the elasticity of the cloud, I would choose the 'Refactor' strategy, decomposing the monolith into a 'Microservices' architecture.

In the target state on AWS, I would package each service into a 'Docker' container to ensure 'environment parity' between local development and the cloud. These containers would be managed by 'Amazon EKS' (Elastic Kubernetes Service), which handles health checks, auto-scaling, and rolling updates. For utility tasks that don't require a persistent server—such as thumbnail generation or monthly billing reports—I would use 'AWS Lambda' (Serverless). This 'Serverless Computing' approach reduces operational burden and follows a 'pay-per-use' cost model.

To handle data, I would move away from self-managed servers toward 'Managed Database Services'. I would use 'Amazon RDS' for relational needs and 'Amazon DynamoDB' for high-throughput NoSQL requirements. These services provide automated backups, patching, and multi-AZ redundancy out of the box.

'Auto-scaling' is a cornerstone of this design. I would configure Horaceontal Pod Autoscalers within Kubernetes and combine them with AWS Auto Scaling Groups to ensure the underlying EC2 instances expand and contract based on CPU and memory demand.

Finally, the entire infrastructure would be managed via 'Infrastructure as Code (IaC)' using Terraform or AWS CDK. A 'CI/CD' pipeline implemented through GitHub Actions or AWS CodePipeline would automate the testing and deployment process. Every time a developer pushes code, it is automatically built, scanned for vulnerabilities, and deployed to a staging environment for validation. This modern, cloud-native approach ensures that the application is resilient, cost-optimized, and highly responsive to market demands.""",
            "required_keywords": ["6 Rs", "Refactoring", "Microservices", "Docker", "Kubernetes", "EKS", "Lambda", "Serverless", "RDS", "DynamoDB", "Auto-scaling", "CI/CD", "IaC", "Terraform"],
            "skills_covered": [
                {"name": "Cloud Architecture", "keywords": ["Cloud-native", "Microservices", "migration", "refactoring"]},
                {"name": "AWS/Azure/GCP", "keywords": ["RDS", "EKS", "DynamoDB", "EKS", "IAM"]},
                {"name": "Containerization", "keywords": ["Docker", "Kubernetes", "orchestration", "images"]},
                {"name": "DevOps", "keywords": ["CI/CD", "GitHub Actions", "Auto-scaling", "Automation"]},
                {"name": "Serverless Computing", "keywords": ["Lambda", "Event-driven", "cost-effective"]}
            ]
        }
    ]
    
    # Pre-embed ideal answers
    for item in majors_data:
        logger.info(f"Computing embedding for major: {item['major']}")
        # Ensure the model is loaded as confirmed earlier
        embedding = model.encode(item["ideal_answer_text"]).tolist()
        item["ideal_answer_embedding"] = embedding
    
    try:
        # Use bulk update/upsert to refresh the collection
        for item in majors_data:
            collection.update_one(
                {"major": item["major"]},
                {"$set": item},
                upsert=True
            )
        logger.info(f"Successfully seeded {len(majors_data)} major assessments with high-quality content and embeddings.")
    except Exception as e:
        logger.error(f"Failed to seed major assessments: {e}")
        raise

if __name__ == "__main__":
    seed_major_assessments()
