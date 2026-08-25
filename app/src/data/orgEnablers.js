// Default foundational enablers for the Organization tab.
// Sourced from /org-capabilities.md ("Foundational enablers"), grouped for readability.
// Each item gets a stable id so toggle/detail state can be persisted safely
// even if labels are edited later.

export const orgEnablerGroups = [
  {
    id: 'data-classification',
    title: 'Data classification',
    items: [
      {
        id: 'data-classification-practical',
        label:
          'Data classification with practical meaning (Public + Internal, Confidential already on cloud, Confidential, Highly Confidential)',
      },
    ],
  },
  {
    id: 'sandbox-trust',
    title: 'Sandbox trust',
    items: [
      { id: 'sandbox-trust-skill', label: 'Sandbox trust through skill' },
      { id: 'sandbox-trust-control', label: 'Sandbox trust through control' },
      { id: 'sandbox-yolo', label: 'Sandboxed YOLO-mode' },
    ],
  },
  {
    id: 'licensing-governance',
    title: 'Licensing & governance',
    items: [
      { id: 'licenses-contractual', label: 'Licenses with contractual limitations' },
      { id: 'license-bound-governance', label: 'License-bound governance' },
    ],
  },
  {
    id: 'tokens',
    title: 'Tokens',
    items: [
      { id: 'starter-tokens', label: 'Starter tokens' },
      { id: 'sufficient-tokens', label: 'Sufficient tokens' },
    ],
  },
  {
    id: 'data-content-boundaries',
    title: 'Data & content boundaries',
    items: [
      { id: 'work-questions', label: 'Work questions (public, internal)' },
      {
        id: 'specifications',
        label: 'Specifications (public, internal, confidential already on cloud)',
      },
      { id: 'code', label: 'Code (confidential already on cloud)' },
      { id: 'test-code', label: 'Test Code (confidential already on cloud)' },
      {
        id: 'data-engineering-envs',
        label: 'Data in engineering environments (confidential already on cloud)',
      },
      {
        id: '3rd-party-components',
        label: '3rd party components with contractual limitations on AI',
      },
      { id: 'secrets-pii', label: 'Secrets and PII (highly confidential)' },
    ],
  },
  {
    id: 'approved-ecosystem',
    title: 'Approved ecosystem',
    items: [
      { id: 'approved-extensions', label: 'Approved extensions' },
      { id: 'approved-tools', label: 'Approved tools' },
      { id: 'sar-defaults', label: 'SAR defaults' },
    ],
  },
]
