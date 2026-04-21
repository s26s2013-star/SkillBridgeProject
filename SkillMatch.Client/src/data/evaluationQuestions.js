export const evaluationQuestions = {
  // Background & General Authenticity
  "Incident Management": {
    question: "Tell me about the most difficult bug, outage, or critical failure you were responsible for fixing. What was the root cause, and how did you trace it? If it happened again tomorrow, what guardrails would prevent it?",
    keywords: ["logs", "datadog", "trace", "circuit breaker", "infrastructure", "unit test", "revert", "hotfix", "metric", "alert"]
  },
  "Legacy Code Onboarding": {
    question: "Describe a time when you had to inherit a legacy codebase or take over a project with zero documentation. What were your first three steps to ensure your first feature didn't break existing logic?",
    keywords: ["debugger", "integration test", "logging", "schema", "pipeline", "ci/cd", "trace", "refactor", "coverage"]
  },
  "System Design Retrospective": {
    question: "What is a technical decision or architectural pattern you confidently championed in the past, but now realize was a mistake? What specific metrics or pain points revealed the flaw?",
    keywords: ["over-engineering", "microservice", "latency", "scaling", "friction", "tech debt", "refactor", "bottleneck", "monolith"]
  },
  
  // Specific Technical Subjects
  "Database Management": {
    question: "You need to store financial transactions securely. Which data type do you use for currency, and why never use floating-point numbers? How do you prevent partial deductions if an order fails midway?",
    keywords: ["decimal", "integer", "cents", "ieee 754", "precision", "acid", "transaction", "rollback", "atomic", "commit"]
  },
  "Software Architecture": {
    question: "Your API usually responds in 50ms, but spikes to 5 seconds under heavy load. The database is the bottleneck, but you cannot change the hardware. Explain two software/architectural strategies to fix this.",
    keywords: ["index", "cache", "redis", "read-replica", "connection pool", "explain plan", "query optimization", "memcached"]
  },
  "Back-End Development": {
    question: "Imagine you are designing a user-registration flow. The user clicks 'Submit', but their network drops exactly as the request is sent. How do you ensure their account isn't created twice when they reconnect and try again?",
    keywords: ["idempotency", "unique", "cache", "ttl", "transaction", "constraint", "token", "deduplication", "payload"]
  },
  "Data Visualization": {
    question: "We need to process 10 million records from a nightly CSV into our database, but it’s crashing the server with Out-Of-Memory (OOM) errors. Provide a detailed strategy to refactor the script without upgrading the server RAM.",
    keywords: ["stream", "generator", "chunk", "batch", "bulk upsert", "dead-letter", "pagination", "memory leak", "iterator"]
  },
  "Cyber Security": {
    question: "A junior developer accidentally hardcoded an AWS API key in a public GitHub repository. Detail your immediate, step-by-step incident response checklist to neutralize the threat.",
    keywords: ["revoke", "rotate", "console", "cloudtrail", "audit", "git filter-branch", "git-hooks", "detect-secrets", "blast radius"]
  },

  // Soft Skills
  "Team Collaboration": {
    question: "Tell me about a time you strongly disagreed with a senior engineer’s code review feedback. How did you resolve the deadlock, and what was the outcome after deployment?",
    keywords: ["data", "benchmark", "objective", "compromise", "post-mortem", "blameless", "metric", "negotiate"]
  },
  "Project Management": {
    question: "You are 3 days away from a massive release and discover a major security flaw that takes 5 days to fix. Detail your immediate crisis communication plan and mitigation strategy for the next 30 minutes.",
    keywords: ["escalate", "quantify", "risk", "mitigation", "delay", "feature toggle", "hotfix", "stakeholder", "impact"]
  },
  "Analytical Problem Solving": {
    question: "A non-technical client asks you why a 'simple button' they requested is taking two weeks to build. Explain your reasoning to them professionally, translating technical constraints into business value.",
    keywords: ["analogy", "security", "value", "scale", "infrastructure", "plumbing", "foundation", "quality", "testing"]
  }
};

export const getEvaluationForSkill = (skillName, category) => {
    // Exact match
    if (evaluationQuestions[skillName]) {
        return evaluationQuestions[skillName];
    }
    
    // Fuzzy matching
    const lowerName = skillName.toLowerCase();
    const matches = Object.keys(evaluationQuestions).filter(k => lowerName.includes(k.toLowerCase()) || k.toLowerCase().includes(lowerName));
    if (matches.length > 0) return evaluationQuestions[matches[0]];

    // Fallbacks based on category
    if (category === 'Soft') {
        return evaluationQuestions["Team Collaboration"];
    } else if (category === 'Technical') {
        if (lowerName.includes('data') || lowerName.includes('sql')) return evaluationQuestions["Database Management"];
        if (lowerName.includes('sec') || lowerName.includes('cyber')) return evaluationQuestions["Cyber Security"];
        if (lowerName.includes('arch') || lowerName.includes('cloud')) return evaluationQuestions["Software Architecture"];
        return evaluationQuestions["Back-End Development"];
    }
    
    // Ultimate fallback
    return evaluationQuestions["Incident Management"];
};

export const shortAssessmentQuestions = {
  // ── Soft Skills ──────────────────────────────────────────────────────────

  "Communication": {
    question: `Scenario: You are a developer on a team delivering a client project. 
Three days before the deadline your team discovers a critical backend bug that will delay the release by at least five days. 
The client has already announced the launch publicly. 
What do you do FIRST?`,
    options: [
      {
        text: "Wait until you are certain of the exact delay length before telling anyone, to avoid unnecessary panic.",
        points: 30,
        level: "Beginner"
      },
      {
        text: "Email the project manager with the technical details of the bug and ask them to inform the client on your behalf.",
        points: 60,
        level: "Intermediate"
      },
      {
        text: "Immediately escalate to the project manager with a clear summary: what broke, the estimated impact, a proposed revised timeline, and what the team is doing right now to fix it.",
        points: 90,
        level: "Advanced"
      }
    ]
  },

  "Teamwork": {
    question: `Scenario: You are working in a team of five. One teammate, who is normally reliable, has missed two sprint deadlines in a row. 
The rest of the team is now covering their tasks in silence to avoid conflict. 
The sprint review is in two days. 
What do you do?`,
    options: [
      {
        text: "Continue covering for them. Missing the deadline would look bad for the whole team.",
        points: 30,
        level: "Beginner"
      },
      {
        text: "Tell the Scrum Master privately so they can deal with it, and focus on finishing your own tasks.",
        points: 60,
        level: "Intermediate"
      },
      {
        text: "Have a private, non-judgmental check-in with the teammate to understand if they need help, then align with the team and PM on realistic adjusted deliverables before the review.",
        points: 90,
        level: "Advanced"
      }
    ]
  },

  "Problem Solving": {
    question: `Scenario: Your company's e-commerce website goes down at 11 PM on a Friday night during a flash sale. 
Orders are failing. The on-call engineer is unreachable. 
You have read access to the production logs but no deployment privileges. 
What is your immediate course of action?`,
    options: [
      {
        text: "Post in the team Slack channel that the site is down and wait for someone with deployment access to respond.",
        points: 30,
        level: "Beginner"
      },
      {
        text: "Check the logs to identify the error, then call the on-call engineer repeatedly and escalate to your direct manager.",
        points: 60,
        level: "Intermediate"
      },
      {
        text: "Simultaneously: check logs to isolate the root cause, escalate through the emergency contact chain, prepare a clear incident summary with logs attached, and check if a quick config change (e.g. feature flag off) can restore service without a deployment.",
        points: 90,
        level: "Advanced"
      }
    ]
  },

  "Adaptability": {
    question: `Scenario: You are two weeks into building a feature according to approved specifications. 
Your manager calls a meeting and informs you the business has pivoted — the feature needs to be rebuilt using a completely different approach, and the deadline stays the same. 
How do you respond?`,
    options: [
      {
        text: "Express frustration to the team, then restart the work from scratch as instructed.",
        points: 30,
        level: "Beginner"
      },
      {
        text: "Accept the change, document what was built so far, and begin planning the new approach with your manager.",
        points: 60,
        level: "Intermediate"
      },
      {
        text: "Quickly audit the existing code to identify reusable components, propose a realistic revised plan to your manager that meets the deadline by leveraging what can be salvaged, and flag specific risks and trade-offs for their decision.",
        points: 90,
        level: "Advanced"
      }
    ]
  },

  // ── Generic Technical Fallback ───────────────────────────────────────────
  "Technical Generic": {
    question: "When approaching a new technical, architectural, or framework-related challenge in your specialization, what is your standard methodology?",
    options: [
      { text: "I follow step-by-step tutorials closely until the feature works.", points: 30, level: "Beginner" },
      { text: "I read the official documentation, look for community patterns, and integrate them into our codebase.", points: 60, level: "Intermediate" },
      { text: "I analyze the trade-offs, prototype a proof-of-concept, and evaluate performance and scalability before broader implementation.", points: 90, level: "Advanced" }
    ]
  }
};


export const getShortEvaluationForSkill = (skillName, category) => {
    if (shortAssessmentQuestions[skillName]) {
        return shortAssessmentQuestions[skillName];
    }
    
    // Fuzzy matching
    const lowerName = skillName.toLowerCase();
    const matches = Object.keys(shortAssessmentQuestions).filter(k => lowerName.includes(k.toLowerCase()) || k.toLowerCase().includes(lowerName));
    if (matches.length > 0 && matches[0] !== "Technical Generic") return shortAssessmentQuestions[matches[0]];

    return shortAssessmentQuestions["Technical Generic"];
};
