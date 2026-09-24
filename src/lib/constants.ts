export const APP_VERSION = '1.4.0'

import type { BadgeKind, BadgeStyle, LicenseKind, PackageManager } from '../types/blocks'
import { technologyGroups, technologyIndex } from './techCatalog'

export const blockLabels = {
  hero: 'Hero / Header',
  toc: 'Table of Contents',
  text: 'Text Section',
  techStack: 'Tech Stack & Tooling',
  features: 'Key Features',
  gallery: 'Screenshots / Gallery',
  quickStart: 'Installation & Quick Start',
  config: 'Configuration',
  requirements: 'Requirements / Prerequisites',
  alert: 'GitHub Alert / Callout',
  code: 'Code Snippet',
  resources: 'Links / Resources',
  contributing: 'Contributing',
  roadmap: 'Roadmap / Milestones',
  details: 'FAQ / Details',
  markdown: 'Custom Markdown',
  license: 'License & Author Links'
} as const

export const badgeKinds: BadgeKind[] = ['stars', 'forks', 'issues', 'license', 'version', 'build', 'custom']
export const badgeStyles: BadgeStyle[] = ['flat', 'for-the-badge', 'flat-square']
export const packageManagers: PackageManager[] = ['npm', 'pnpm', 'yarn', 'bun', 'pip', 'cargo', 'go', 'docker', 'git', 'composer', 'gradle', 'maven', 'dotnet']
export const licenses: LicenseKind[] = ['MIT', 'Apache-2.0', 'GPL-3.0', 'LGPL-3.0', 'AGPL-3.0', 'BSD-2-Clause', 'BSD-3-Clause', 'MPL-2.0', 'ISC', 'Unlicense']

export const technologies = Object.fromEntries(Object.entries(technologyGroups).map(([group, items]) => [group, items.map((item) => item.name)])) as Record<string, string[]>
export const techSlugs = Object.fromEntries(Object.entries(technologyIndex).filter(([, item]) => item.skill).map(([name, item]) => [name, item.skill as string])) as Record<string, string>
export const techLogoLabels = Object.fromEntries(Object.entries(technologyIndex).map(([name]) => [name, name])) as Record<string, string>
export const techLogos = Object.fromEntries(Object.entries(technologyIndex).filter(([, item]) => item.logo).map(([name, item]) => [name, item.logo as string])) as Record<string, string>
export const techColors = Object.fromEntries(Object.entries(technologyIndex).filter(([, item]) => item.color).map(([name, item]) => [name, item.color as string])) as Record<string, string>

export const emojiOptions = ['✨', '⚡', '🧩', '🔒', '🛠️', '🎯', '📦', '🪶', '🧠', '🌙', '🚀', '✅', '💡', '🧪', '🖥️', '📱', '🔌', '📚', '🧱', '🌐']
