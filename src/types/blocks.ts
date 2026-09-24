export type BlockType = 'hero' | 'toc' | 'text' | 'techStack' | 'features' | 'gallery' | 'quickStart' | 'config' | 'requirements' | 'alert' | 'code' | 'resources' | 'contributing' | 'roadmap' | 'details' | 'markdown' | 'license'

export type BadgeKind = 'stars' | 'forks' | 'issues' | 'license' | 'version' | 'build' | 'custom'
export type BadgeStyle = 'flat' | 'for-the-badge' | 'flat-square'
export type BadgeSpacing = 'compact' | 'normal' | 'wide'
export type TechRenderMode = 'skillicons' | 'shields' | 'list'
export type SkillIconTheme = 'dark' | 'light'
export type FeatureFormat = 'list' | 'table'
export type Alignment = 'left' | 'center'
export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun' | 'pip' | 'cargo' | 'go' | 'docker' | 'git' | 'composer' | 'gradle' | 'maven' | 'dotnet'
export type LicenseKind = 'MIT' | 'Apache-2.0' | 'GPL-3.0' | 'LGPL-3.0' | 'AGPL-3.0' | 'BSD-2-Clause' | 'BSD-3-Clause' | 'MPL-2.0' | 'ISC' | 'Unlicense'
export type TocStyle = 'bullets' | 'numbers'
export type GalleryColumns = 1 | 2 | 3
export type AlertKind = 'NOTE' | 'TIP' | 'IMPORTANT' | 'WARNING' | 'CAUTION'

export interface BaseBlock {
  id: string
  type: BlockType
  visible: boolean
}

export interface HeroBadge {
  id: string
  kind: BadgeKind
  label: string
  value: string
  style: BadgeStyle
  color: string
  labelColor: string
  logoColor: string
  link: string
}

export interface HeroBlock extends BaseBlock {
  type: 'hero'
  title: string
  subtitle: string
  description: string
  animatedSubtitle: boolean
  alignment: Alignment
  imageUrl: string
  imageAlt: string
  badges: HeroBadge[]
  badgeSpacing: BadgeSpacing
}

export interface TocBlock extends BaseBlock {
  type: 'toc'
  heading: string
  style: TocStyle
}

export interface TextBlock extends BaseBlock {
  type: 'text'
  heading: string
  body: string
}

export interface CustomTechnology {
  id: string
  name: string
  skillIcon: string
  shieldLogo: string
  color: string
}

export interface TechStackBlock extends BaseBlock {
  type: 'techStack'
  heading: string
  technologies: string[]
  customTechnologies: CustomTechnology[]
  mode: TechRenderMode
  skillTheme: SkillIconTheme
  iconsPerLine: number
  badgeStyle: BadgeStyle
  badgeColor: string
  badgeLogoColor: string
}

export interface FeatureItem {
  id: string
  emoji: string
  title: string
  detail: string
}

export interface FeatureListBlock extends BaseBlock {
  type: 'features'
  heading: string
  format: FeatureFormat
  items: FeatureItem[]
}

export interface GalleryItem {
  id: string
  url: string
  alt: string
  caption: string
  link: string
}

export interface GalleryBlock extends BaseBlock {
  type: 'gallery'
  heading: string
  columns: GalleryColumns
  items: GalleryItem[]
}

export interface QuickStartStep {
  id: string
  description: string
  command: string
}

export interface QuickStartBlock extends BaseBlock {
  type: 'quickStart'
  heading: string
  packageManager: PackageManager
  steps: QuickStartStep[]
}

export interface ConfigRow {
  id: string
  name: string
  valueType: string
  defaultValue: string
  description: string
  required: boolean
}

export interface ConfigTableBlock extends BaseBlock {
  type: 'config'
  heading: string
  rows: ConfigRow[]
}

export interface RequirementItem {
  id: string
  name: string
  version: string
  note: string
}

export interface RequirementsBlock extends BaseBlock {
  type: 'requirements'
  heading: string
  items: RequirementItem[]
}

export interface AlertBlock extends BaseBlock {
  type: 'alert'
  kind: AlertKind
  body: string
}

export interface CodeBlock extends BaseBlock {
  type: 'code'
  heading: string
  description: string
  language: string
  code: string
}

export interface ResourceItem {
  id: string
  label: string
  url: string
  description: string
}

export interface ResourcesBlock extends BaseBlock {
  type: 'resources'
  heading: string
  items: ResourceItem[]
}

export interface ContributingBlock extends BaseBlock {
  type: 'contributing'
  heading: string
  intro: string
  steps: QuickStartStep[]
  issueUrl: string
  guidelinesUrl: string
}

export interface RoadmapItem {
  id: string
  label: string
  completed: boolean
}

export interface RoadmapBlock extends BaseBlock {
  type: 'roadmap'
  heading: string
  items: RoadmapItem[]
}

export interface DetailsItem {
  id: string
  summary: string
  body: string
  open: boolean
}

export interface DetailsBlock extends BaseBlock {
  type: 'details'
  heading: string
  items: DetailsItem[]
}

export interface MarkdownBlock extends BaseBlock {
  type: 'markdown'
  heading: string
  markdown: string
  showHeading: boolean
}

export interface AuthorLinks {
  github: string
  discord: string
  telegram: string
  website: string
  x: string
}

export interface LicenseBlock extends BaseBlock {
  type: 'license'
  heading: string
  license: LicenseKind
  authorName: string
  links: AuthorLinks
}

export type ReadmeBlock = HeroBlock | TocBlock | TextBlock | TechStackBlock | FeatureListBlock | GalleryBlock | QuickStartBlock | ConfigTableBlock | RequirementsBlock | AlertBlock | CodeBlock | ResourcesBlock | ContributingBlock | RoadmapBlock | DetailsBlock | MarkdownBlock | LicenseBlock

export interface DocumentState {
  title: string
  blocks: ReadmeBlock[]
}
