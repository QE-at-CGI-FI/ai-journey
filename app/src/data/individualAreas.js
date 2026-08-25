// Default growth areas for the Individual tab: an individual's experience
// growing into an AI-native way of working, building on top of the
// organizational foundational enablers.

export const individualAreaGroups = [
  {
    id: 'foundational-skills',
    title: 'Foundational skills',
    items: [
      { id: 'prompting-specs', label: 'Writes effective prompts and specifications' },
      { id: 'critical-review', label: 'Reads and reviews AI output critically' },
      { id: 'tool-literacy', label: 'Comfortable with approved tools & extensions' },
    ],
  },
  {
    id: 'trust-autonomy',
    title: 'Trust & autonomy',
    items: [
      { id: 'sandbox-comfort', label: 'Comfortable working in a sandboxed environment' },
      { id: 'yolo-confidence', label: 'Confident operating in sandboxed YOLO-mode' },
      { id: 'classification-awareness', label: 'Understands data classification boundaries' },
    ],
  },
  {
    id: 'practice-habits',
    title: 'Practice & habits',
    items: [
      { id: 'daily-use', label: 'Uses AI daily as part of normal workflow' },
      { id: 'documents-learnings', label: 'Documents learnings and reusable prompts' },
      { id: 'experiments', label: 'Experiments with new tools and models' },
    ],
  },
  {
    id: 'contribution-growth',
    title: 'Contribution & growth',
    items: [
      { id: 'mentors-others', label: 'Mentors others / shares knowledge' },
      { id: 'feeds-back-org', label: 'Feeds back into organizational enablers' },
      { id: 'agentic-workflows', label: 'Explores agentic, multi-step workflows' },
    ],
  },
]
