// Default growth areas for the Individual tab: an individual's experience
// growing into an AI-native way of working, building on top of the
// organizational foundational enablers.
// Sourced from /ind-experiences.md, grouped by role.

export const individualAreaGroups = [
  {
    id: 'knowledge-worker',
    title: 'Knowledge worker role',
    items: [
      { id: 'external-imagination', label: 'External imagination' },
      { id: 'local-summarizing', label: 'Local summarizing' },
      { id: 'online-summarizing', label: 'Online summarizing' },
      {
        id: 'integrated-ai-domain-tools',
        label: 'Integrated AI features in domain tools (e.g. Rovo for Confluence & Jira)',
      },
      { id: 'ai-enabled-practices', label: 'AI-enabled practices (e.g. AI notetaking)' },
      { id: 'task-expansion', label: 'Task expansion' },
      { id: 'personal-applications', label: 'Personal applications' },
      { id: '2nd-brain', label: '2nd brain' },
      { id: 'token-awareness', label: 'Token awareness' },
      { id: 'generating-artifacts', label: 'Generating artifacts' },
      { id: 'pitch-to-project', label: 'Pitch to project for AI usecase' },
    ],
  },
  {
    id: 'developer',
    title: 'Developer role',
    items: [
      { id: 'code-autocomplete', label: 'Code autocomplete' },
      { id: 'reactive-agentic', label: 'Reactive agentic (you start it)' },
      { id: 'selecting-3rd-party-mcps', label: 'Selecting and configuring 3rd party MCPs' },
      {
        id: 'integrating-3rd-party-components',
        label: 'Integrating 3rd party AI system components (memory, context compression)',
      },
      { id: 'skills-git-first-templates', label: 'Skills and AI-friendly git-first templates' },
      { id: 'proactive-agentic', label: 'Proactive agentic (it starts automatically)' },
      { id: 'dark-factory', label: 'Dark factory (unattended)' },
      { id: 'spec-driven-development', label: 'Spec-driven development' },
      { id: 'team-product-context', label: 'Team/Product context (e.g. .md files)' },
      {
        id: 'team-product-context-basic',
        label: 'Team/Product context basic (e.g. MCPs, memory, skills, orchestration)',
      },
      { id: 'building-own-mcps', label: 'Building own MCPs' },
      {
        id: 'product-ai-feature-poc',
        label: 'Product AI feature delivery for proof of concept',
      },
      {
        id: 'product-ai-feature-production',
        label: 'Product AI feature delivery to run in production',
      },
      { id: 'product-feature-ai-feedback', label: 'Product feature AI feedback' },
    ],
  },
]
