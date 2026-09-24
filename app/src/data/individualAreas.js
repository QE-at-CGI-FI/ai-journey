// Default growth areas for the Individual tab: an individual's experience
// growing into an AI-native way of working, building on top of the
// organizational foundational enablers.
// Sourced from /ind-experiences.md, grouped by role; explanation text
// sourced from /explanations.json and shown as each item's textarea
// placeholder until the person fills in their own details.

export const individualAreaGroups = [
  {
    id: 'knowledge-worker',
    title: 'Knowledge worker role',
    items: [
      {
        id: 'external-imagination',
        label: 'External imagination',
        explanation: '...when AI answers your questions and provides you perspectives. Your input could be prompt, file or website, control could be on you or the tool on where to source information.',
      },
      {
        id: 'local-summarizing',
        label: 'Local summarizing',
        explanation: '...when you have more files than just the instructions and one input file to work through, and for AI to be valuable, you are moving stuff around or defining connectors that find files where you put them.',
      },
      {
        id: 'online-summarizing',
        label: 'Online summarizing',
        explanation: '...when you use AI systematically going through research activities, with your control over the sources.',
      },
      {
        id: 'integrated-ai-domain-tools',
        label: 'Integrated AI features in domain tools (e.g. Rovo for Confluence & Jira)',
        explanation: "...when AI is useful in a tool you were already using, but it is now AI powered and allows you to do things where you don't have to leave the tool of trade to get to answers and processed information.",
      },
      {
        id: 'ai-enabled-practices',
        label: 'AI-enabled practices (e.g. AI notetaking)',
        explanation: "...when you can tell a story of changing how you do a thing so that bringing in AI isn't glued on top but the work is down designed so that AI benefits you.",
      },
      {
        id: 'task-expansion',
        label: 'Task expansion',
        explanation: "...when AI makes it possible for you to do things you used to think as someone else's work.",
      },
      {
        id: 'personal-applications',
        label: 'Personal applications',
        explanation: '...when you build a thing you would not have built even if you theoretically had capability. Maybe this application makes your work simpler, even if it is a one user system.',
      },
      {
        id: '2nd-brain',
        label: '2nd brain',
        explanation: '...when you build a LLM wiki, ingesting raw materials from sources to come up with insights you would not see without this kind of proccessing.',
      },
      {
        id: 'token-awareness',
        label: 'Token awareness',
        explanation: '...when you follow a dashboard of consumption, or even a local secondary dashboard and even the bill to know what seems to become expensive use of AI.',
      },
      {
        id: 'generating-artifacts',
        label: 'Generating artifacts',
        explanation: "...when you are able to give enough instructions so that something more complicated gets generated so that you are happy with the result and trust you can share it along without being immediately told that they'd rather see the prompt than your chapter/page of respose.",
      },
      {
        id: 'pitch-to-project',
        label: 'Pitch to project for AI usecase',
        explanation: '...when you tell someone about a thing they can do to AI so that they want to at least seriously consider doing that with you and your crew.',
      },
      {
        id: 'mentioned-in-cv',
        label: 'Mentioned in CV',
        explanation: '...when you have a natural way of expressing your use of AI in your CV, without it being minimal and forced.',
      },
    ],
  },
  {
    id: 'developer',
    title: 'Developer role',
    items: [
      {
        id: 'code-autocomplete',
        label: 'Code autocomplete',
        explanation: "...when you let AI be completing your sentences, and don't regularly turn it off for it being more noise than benefit.",
      },
      {
        id: 'reactive-agentic',
        label: 'Reactive agentic (you start it)',
        explanation: '...when you discover the coding chat, and move to ask and you shall receive code and documentation.',
      },
      {
        id: 'selecting-3rd-party-mcps',
        label: 'Selecting and configuring 3rd party MCPs',
        explanation: '...when you configure necessary AI access to other systems because not everything lives where your AI lives, and your world (including risks) expands.',
      },
      {
        id: 'integrating-3rd-party-components',
        label: 'Integrating 3rd party AI system components (memory, context compression)',
        explanation: "...when your harness gets side pieces of agentware - other people's software that improves some aspects of use of AI, optimizing and automating. The 3rd party ecosystem is endless, but you start from finding some you seriously think you could benefit from.",
      },
      {
        id: 'skills-git-first-templates',
        label: 'Skills and AI-friendly git-first templates',
        explanation: '...when you have .md files, names for them as agents and skills, and routinely start referring to things to do with names you come up with connecting to these instructions.',
      },
      {
        id: 'using-local-models',
        label: 'Using local models',
        explanation: '...when you configure your harness to use local models so that everything does not costs tokens, and start discovering how to separate reasoning/planning and code generation, distributing flows to different models.',
      },
      {
        id: 'proactive-agentic',
        label: 'Proactive agentic (it starts automatically)',
        explanation: '...when your agents start work without you asking for it in the moment. You find your agentic pipelines, and move some development work towards automation.',
      },
      {
        id: 'dark-factory',
        label: 'Dark factory (unattended)',
        explanation: '...when your agents can work over night with guardrails of your choosing to do useful things while you are not around. An hour of away from keyboard is enough.',
      },
      {
        id: 'spec-driven-development',
        label: 'Spec-driven development',
        explanation: "...when you install a 3rd party framework that tells you what agents and files should be set up, with its own opinionated instructions. Wouldn't hurt if you had an idea of when it's more development oriented spec, and when more team-of-agents oriented spec, and had ideas that there are different ideas of \"templates\".",
      },
      {
        id: 'team-product-context',
        label: 'Team/Product context (e.g. .md files)',
        explanation: "...when yous .md files are not yours, but your whole team's, and their .md files are yours too.",
      },
      {
        id: 'team-product-context-basic',
        label: 'Team/Product context advanced (e.g. MCPs, memory, skills, orchestration)',
        explanation: '...when your setup grows from .md files to a more complete set of tools and practices that enhance your AI development.',
      },
      {
        id: 'building-own-mcps',
        label: 'Building own MCPs',
        explanation: '...when you need to find ways of allowing AI to talk to your own things, and build something to allow for that.',
      },
      {
        id: 'delivering-ai-native-project',
        label: 'Delivering AI native project',
        explanation: '...when you work in a team that gets to primarily work with AI tools in development work. An indicator of this tends to be that the first level of credits (1900cr) of Github Copilot is insufficient and you join a second tier or have client specific setup.',
      },
      {
        id: 'product-ai-feature-poc',
        label: 'Product AI feature delivery for proof of concept',
        explanation: '...when you build software system where a feature uses AI, either through a harness piling on top existing layers, or through API to an LLM. It did not go to production, but you showed AI in a system you build, not as way of building the system.',
      },
      {
        id: 'business-value-domain-ai-poc',
        label: 'Added business value in domain AI proof of concept',
        explanation: '...when your AI feature is considered valuable, not just done for learning purposes. Client praise on doing something they consider new is an indicator.',
      },
      {
        id: 'product-ai-feature-production',
        label: 'Product AI feature delivery to run in production',
        explanation: '...when your AI feature runs in production.',
      },
      {
        id: 'product-feature-ai-feedback',
        label: 'Product feature AI feedback',
        explanation: '...when you use AI to test systems, not just unit tests, but also something where the system is operated with AI while it is tested.',
      },
    ],
  },
]
