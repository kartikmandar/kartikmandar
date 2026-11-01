/** The full project list under "Selected work" on the home page. */
export interface IndexedProject {
  name: string
  description: string
  href?: string
}

export const PROJECT_INDEX: IndexedProject[] = [
  { name: 'Enrolia', description: 'React Native app for AI-powered graduate admissions consulting with Expo Dev Builds, Supabase backend, and LLM integration.', href: 'https://enrolia.app' },
  { name: 'Merakinist Labs', description: 'A forward-deployed AI engineering lab.', href: 'https://merakinist.com' },
  { name: 'Colloquia', description: 'Local-first AI research assistant with Zotero integration, RAG via ChromaDB, and real-time voice/text LLM interaction.' },
  { name: 'Workflow Orchestrator', description: 'OpenEnv environment for training and evaluating LLM agent orchestration across DAG-based workflows.' },
  { name: 'NVIDIA Cosmos-Reason1-7B Fine-Tuning', description: 'QLoRA fine-tuning of a 7B vision-language model on RTX 3090 for soccer event detection with temporal localization.' },
  { name: 'LLM Financial AI System', description: 'Self-hosted open-source LLM deployment on Vast.ai for financial statement analysis with structured JSON output pipelines.' },
  { name: 'Molecular Dynamics Simulation', description: 'GROMACS/LAMMPS pipeline modeling thermal motion of DNA/RNA molecules within CAD-defined nanoscale boundaries.' },
  { name: 'HPC Cluster & Homelab', description: 'Earlier 5-node Slurm and Proxmox HA clusters with GPU scheduling, Kubernetes, TrueNAS, and Grafana/Prometheus monitoring.' },
  { name: 'AzuFlow', description: 'Privacy-first productivity app (React Native mobile + Electron desktop) with background alerts and cross-platform sync.' },
  { name: 'Sensor Data App', description: 'Cross-platform mobile app for high-frequency sensor logging (100Hz) for a mental health research study at IISER Bhopal.' },
  { name: 'Spillover', description: 'Real-time party game app (Next.js + Supabase) with anonymous hot takes, Two Truths and a Lie, and live leaderboard.' },
  { name: 'Catering Business Website', description: 'Catering business website with Payload CMS, multi-step quote wizard, menu management, and inquiry tracking.' },
  { name: 'KeratiNoMore (iGEM 2023)', description: 'iGEM Gold Medal team wiki and GROMACS molecular dynamics simulations for gene insertion validation.' },
  { name: 'PromptPrep', description: 'CLI tool to prepare codebase context for LLM prompts by aggregating file contents with token counting.' },
  { name: 'Science Rendezvous & Event Websites', description: 'Websites for Science Rendezvous 2023 (UofT), AIIM 2023, Enthuzia 2023, and IISM 2022.' },
  { name: 'IISERB Mastodon Instance', description: 'Self-hosted Mastodon instance on Digital Ocean with PostgreSQL, S3 storage, SSL, and Crowdsec security.' },
]
