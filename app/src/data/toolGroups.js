// AI tools people can be marked as using, on the Individual tab.
// Chat / Office / Dev groups mirror the vendor tool matrix in
// tools-infographic.svg; Other covers tools outside that matrix.

export const toolGroups = [
  {
    label: 'Chat',
    tools: ['Claude', 'ChatGPT', 'Amazon Q', 'Gemini', 'Edge Copilot'],
  },
  {
    label: 'Office',
    tools: ['Claude Cowork', 'Gemini Workspace', 'M365 Copilot'],
  },
  {
    label: 'Dev',
    tools: ['Claude Code', 'Codex', 'Kiro', 'Gemini Code Assist', 'GitHub Copilot'],
  },
  {
    label: 'Other',
    tools: ['Rovo', 'UiPath'],
  },
]
