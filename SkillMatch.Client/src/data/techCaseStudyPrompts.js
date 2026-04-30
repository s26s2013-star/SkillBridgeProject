export const techCaseStudyPrompts = {
    "Backend Development (APIs)": "Scenario: Your Node.js backend handles thousands of concurrent requests, and the event loop is getting blocked, causing other requests to time out. Explain your architectural strategy to fix this using Node.js concepts (e.g., worker threads, message queues, async processing).",
    "Testing & Debugging": "Scenario: You have inherited a critical payment processing module with zero test coverage. Explain your testing strategy. How would you introduce Unit and Integration tests? Detail the specific tools you would use and how you would mock the external bank API.",
    "Data Analysis (Python)": "Scenario: You are analyzing a massive dataset of global climate data over the last century. Discuss which libraries (like Pandas or NumPy) you would use, how you would clean missing values, and how you highlight long-term trends versus regional anomalies.",
    "Machine Learning": "Scenario: You are tasked with creating a model to predict user churn for a SaaS product. Detail your end-to-end pipeline: how you clean data, handle class imbalance, select algorithms, and evaluate your model’s precision vs. recall.",
    "Routing & Switching": "Scenario: Your enterprise network is plagued by broadcast storms and slow internal traffic. Explain how you would redesign the topology using VLANs on switches and specific routing protocols (e.g., OSPF, EIGRP) to segment traffic and optimize routing.",
    "Network Security": "Scenario: A malicious actor has breached your perimeter. Describe your defense-in-depth strategy, including zero-trust architecture, network segmentation, monitoring, and exactly how you isolate the internal threats once detected."
};

export const getTechCaseStudyPrompt = (skillName) => {
    if (techCaseStudyPrompts[skillName]) {
        return techCaseStudyPrompts[skillName];
    }
    
    // Fuzzy matching
    if (!skillName) return "Explain a detailed, step-by-step real world application or solution where you applied your technical expertise. Include context, architectural choices, and your exact methodology.";
    
    const lowerName = skillName.toLowerCase();
    const matches = Object.keys(techCaseStudyPrompts).filter(k => lowerName.includes(k.toLowerCase()) || k.toLowerCase().includes(lowerName));
    if (matches.length > 0) return techCaseStudyPrompts[matches[0]];

    return `Explain a detailed, step-by-step real world application or solution where you applied ${skillName} effectively. Include context, architectural choices, and your exact methodology.`;
};
