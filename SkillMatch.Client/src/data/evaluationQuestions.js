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
  // ── Soft Skills (Multi-Scenario) ──────────────────────────────────────────
  "Communication": {
    type: "Soft",
    scenarios: [
      {
        question: "How do you explain a complex idea to someone who has no technical background?",
        keywords: ["simple language", "clarity", "example", "understanding", "audience"]
      },
      {
        question: "How do you ensure your message is understood correctly in a team discussion?",
        keywords: ["feedback", "confirmation", "listening", "clarity", "repetition"]
      },
      {
        question: "Describe how you handle misunderstandings in communication.",
        keywords: ["clarification", "calm", "resolve", "misunderstanding", "discussion"]
      },
      {
        question: "How do you adjust your communication style when speaking to different audiences, such as managers, teammates, or clients?",
        keywords: ["audience", "adapt", "clarity", "tone", "message"]
      }
    ]
  },
  "Teamwork": {
    type: "Soft",
    scenarios: [
      {
        question: "Describe a situation where you worked successfully in a team.",
        keywords: ["collaboration", "contribution", "support", "teamwork", "goal"]
      },
      {
        question: "How do you handle disagreements in a group project?",
        keywords: ["compromise", "discussion", "respect", "solution", "conflict"]
      },
      {
        question: "What role do you usually take in a team and why?",
        keywords: ["leader", "support", "responsibility", "coordination", "role"]
      },
      {
        question: "How do you support team members who are struggling to complete their part of a project?",
        keywords: ["support", "collaboration", "assistance", "responsibility", "cooperation"]
      }
    ]
  },
  "Problem Solving": {
    type: "Soft",
    scenarios: [
      {
        question: "How do you approach a new problem you have never seen before?",
        keywords: ["analysis", "understand", "steps", "breakdown", "research"]
      },
      {
        question: "Give an example of a problem you solved successfully.",
        keywords: ["solution", "action", "result", "improvement", "decision"]
      },
      {
        question: "What do you do if your first solution does not work?",
        keywords: ["retry", "alternative", "adjust", "evaluate", "improve"]
      },
      {
        question: "How do you identify the root cause of a problem before deciding on a solution?",
        keywords: ["analysis", "root cause", "investigation", "reasoning", "evaluation"]
      }
    ]
  },
  "Time Management": {
    type: "Soft",
    scenarios: [
      {
        question: "How do you prioritize tasks with multiple deadlines?",
        keywords: ["priority", "deadline", "planning", "urgent", "important"]
      },
      {
        question: "What tools or methods do you use to manage your time?",
        keywords: ["planner", "schedule", "calendar", "task list", "organization"]
      },
      {
        question: "What do you do when you cannot complete a task on time?",
        keywords: ["reschedule", "notify", "adjust", "delay", "manage"]
      },
      {
        question: "How do you stay productive when handling several urgent tasks at the same time?",
        keywords: ["prioritization", "focus", "organization", "efficiency", "planning"]
      }
    ]
  },
  "Adaptability": {
    type: "Soft",
    scenarios: [
      {
        question: "How do you react when project requirements suddenly change?",
        keywords: ["adjust", "flexible", "change", "adapt", "update"]
      },
      {
        question: "Describe a time you had to learn something new quickly.",
        keywords: ["learn", "fast", "new skill", "adapt", "improve"]
      },
      {
        question: "How do you handle unexpected challenges?",
        keywords: ["solution", "calm", "adjust", "think", "respond"]
      },
      {
        question: "How do you respond when you receive feedback that requires you to change your usual way of working?",
        keywords: ["flexibility", "feedback", "improvement", "adjustment", "openness"]
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
    let result = null;

    // Exact match for the new structure
    if (evaluationQuestions[skillName] && evaluationQuestions[skillName].type === "Soft") {
        result = { ...evaluationQuestions[skillName] };
    } else if (shortAssessmentQuestions[skillName]) {
        result = { ...shortAssessmentQuestions[skillName] };
    } else {
        // Fuzzy matching
        const lowerName = skillName.toLowerCase();
        const matches = Object.keys(evaluationQuestions).filter(k => lowerName.includes(k.toLowerCase()) || k.toLowerCase().includes(lowerName));
        if (matches.length > 0 && evaluationQuestions[matches[0]].type === "Soft") {
            result = { ...evaluationQuestions[matches[0]] };
        } else {
            const shortMatches = Object.keys(shortAssessmentQuestions).filter(k => lowerName.includes(k.toLowerCase()) || k.toLowerCase().includes(lowerName));
            if (shortMatches.length > 0 && shortMatches[0] !== "Technical Generic") {
                result = { ...shortAssessmentQuestions[shortMatches[0]] };
            } else {
                result = { ...shortAssessmentQuestions["Technical Generic"] };
            }
        }
    }

    // If it's a Soft skill with scenarios, pick 2 random ones
    if (result && result.type === "Soft" && result.scenarios) {
        // Create a copy of the scenarios to avoid mutating the original data bank
        const shuffled = [...result.scenarios].sort(() => 0.5 - Math.random());
        return {
            ...result,
            scenarios: shuffled.slice(0, 2)
        };
    }

    return result;
};
