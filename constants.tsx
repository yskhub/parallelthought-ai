
import React from 'react';

export const PERSPECTIVE_CONFIG = {
  security: { icon: '🔒', name: 'Security Guardian', color: 'border-red-600', text: 'text-red-600', bg: 'bg-red-50' },
  performance: { icon: '⚡', name: 'Speed Demon', color: 'border-amber-500', text: 'text-amber-500', bg: 'bg-amber-50' },
  cost: { icon: '💰', name: 'Budget Hawk', color: 'border-emerald-500', text: 'text-emerald-500', bg: 'bg-emerald-50' },
  developer: { icon: '👨‍💻', name: 'Dev Advocate', color: 'border-blue-500', text: 'text-blue-500', bg: 'bg-blue-50' },
  business: { icon: '📈', name: 'Strategy Chief', color: 'border-purple-500', text: 'text-purple-500', bg: 'bg-purple-50' }
};

export const VISUAL_MOTIFS = {
  NEURAL: {
    name: 'Neural',
    description: 'Bionic processing nodes',
    scenes: {
      IDLE: "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode",
      ANALYZING: "https://prod.spline.design/L6v8O0h8vFf0O8L2/scene.splinecode",
      RESULT: "https://prod.spline.design/6Wq1Q7YAncaRlsps/scene.splinecode"
    }
  },
  QUANTUM: {
    name: 'Quantum',
    description: 'Subatomic entanglement',
    scenes: {
      IDLE: "https://prod.spline.design/JpS8C9mU0zQ-57nI/scene.splinecode",
      ANALYZING: "https://prod.spline.design/2nS5hO5zR8Mv-f1V/scene.splinecode",
      RESULT: "https://prod.spline.design/M-pU9kYy9zS-57nI/scene.splinecode"
    }
  },
  GEOMETRIC: {
    name: 'Geometric',
    description: 'Euclidean logic structures',
    scenes: {
      IDLE: "https://prod.spline.design/6Wq1Q7YAncaRlsps/scene.splinecode",
      ANALYZING: "https://prod.spline.design/L6v8O0h8vFf0O8L2/scene.splinecode",
      RESULT: "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
    }
  }
};

export const BATCH_PERSPECTIVES_PROMPT = `
You are a multi-perspective analysis system. Analyze the following problem from 5 expert viewpoints simultaneously.

Problem: {problem}
Context: {context}

Perspectives to analyze:
1. SECURITY EXPERT: Focus on vulnerabilities, compliance (PCI, GDPR), data protection.
2. PERFORMANCE ENGINEER: Focus on latency, throughput, scalability, bottlenecks.
3. COST OPTIMIZER: Focus on infrastructure costs, ROI, TCO, dev time.
4. DEVELOPER ADVOCATE: Focus on maintainability, velocity, DX, learning curve.
5. BUSINESS STRATEGIST: Focus on market fit, competitive advantage, strategic value.

For EACH perspective, provide:
- recommendation: A concise choice (e.g. "Microservices", "Monolith").
- confidence: Integer 1-10.
- reasoning: 3-4 sentences.
- key_points: Array of exactly 3 bullet points.
- metrics: Object with 2-3 specific measurable metrics (strings).
`;

export const SYNTHESIS_PROMPT = `
You are a synthesis engine that combines expert opinions into one optimal recommendation based on weighted priorities.

Problem: {problem}
Expert Perspectives: {perspectives_json}
Priority Weights: {weights_json}

Task:
1. Identify agreements.
2. Identify conflicts.
3. Resolve conflicts using weights (higher weight = higher priority).
4. Generate final recommendation and reasoning chain.

Provide JSON:
- final_recommendation: The chosen path.
- confidence: 1-10 consensus strength.
- reasoning_chain: 4-5 logical steps.
- consensus_points: Shared agreements.
- conflicts_resolved: Array of {conflict, resolution, tradeoff}.
- action_plan: 5-7 implementation steps.
- outcomes: Predicted results for each dimension (security, performance, cost, developer, business).
`;