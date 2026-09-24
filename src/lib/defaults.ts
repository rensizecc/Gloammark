import { createId } from './id'
import type { DocumentState, ReadmeBlock } from '../types/blocks'

export const createBlock = (type: ReadmeBlock['type']): ReadmeBlock => {
  if (type === 'hero') {
    return {
      id: createId(),
      type,
      visible: true,
      title: 'Gloammark',
      subtitle: 'A visual README builder for developers.',
      description: 'Compose clean, polished GitHub READMEs without writing Markdown by hand.',
      animatedSubtitle: false,
      alignment: 'center',
      imageUrl: '',
      imageAlt: 'Project logo',
      badges: [
        { id: createId(), kind: 'stars', label: 'stars', value: 'owner/repo', style: 'flat', color: '', labelColor: '', logoColor: '', link: '' },
        { id: createId(), kind: 'license', label: 'license', value: 'owner/repo', style: 'flat', color: '18181b', labelColor: '27272a', logoColor: 'ffffff', link: '' }
      ],
      badgeSpacing: 'normal'
    }
  }

  if (type === 'toc') return { id: createId(), type, visible: true, heading: 'Table of Contents', style: 'bullets' }

  if (type === 'text') return { id: createId(), type, visible: true, heading: 'About', body: 'Write a clear introduction to your project. You can use **bold**, *italic*, `code`, links, and lists from the visual toolbar.' }

  if (type === 'techStack') {
    return {
      id: createId(),
      type,
      visible: true,
      heading: 'Tech Stack',
      technologies: ['TypeScript', 'React', 'Vite', 'Tailwind CSS'],
      customTechnologies: [],
      mode: 'skillicons',
      skillTheme: 'dark',
      iconsPerLine: 12,
      badgeStyle: 'flat-square',
      badgeColor: '18181b',
      badgeLogoColor: 'ffffff'
    }
  }

  if (type === 'features') {
    return {
      id: createId(),
      type,
      visible: true,
      heading: 'Features',
      format: 'list',
      items: [
        { id: createId(), emoji: '✨', title: 'Visual composition', detail: 'Build polished README files without memorizing Markdown syntax.' },
        { id: createId(), emoji: '⚡', title: 'Live output', detail: 'Preview GitHub rendering and inspect the generated GFM instantly.' }
      ]
    }
  }

  if (type === 'gallery') {
    return {
      id: createId(),
      type,
      visible: true,
      heading: 'Screenshots',
      columns: 2,
      items: [
        { id: createId(), url: '', alt: 'Screenshot 1', caption: 'Main interface', link: '' },
        { id: createId(), url: '', alt: 'Screenshot 2', caption: 'Live preview', link: '' }
      ]
    }
  }

  if (type === 'quickStart') {
    return {
      id: createId(),
      type,
      visible: true,
      heading: 'Quick Start',
      packageManager: 'npm',
      steps: [
        { id: createId(), description: 'Install dependencies', command: 'npm install' },
        { id: createId(), description: 'Start the development server', command: 'npm run dev' }
      ]
    }
  }

  if (type === 'config') {
    return {
      id: createId(),
      type,
      visible: true,
      heading: 'Configuration',
      rows: [{ id: createId(), name: 'API_URL', valueType: 'string', defaultValue: '—', description: 'Base URL for API requests.', required: true }]
    }
  }

  if (type === 'requirements') {
    return {
      id: createId(),
      type,
      visible: true,
      heading: 'Requirements',
      items: [
        { id: createId(), name: 'Node.js', version: '22+', note: 'Required for local development.' },
        { id: createId(), name: 'npm', version: '10+', note: 'Used to install dependencies and run scripts.' }
      ]
    }
  }

  if (type === 'alert') return { id: createId(), type, visible: true, kind: 'NOTE', body: 'Add an important note, tip, warning, or caveat for readers.' }

  if (type === 'code') return { id: createId(), type, visible: true, heading: 'Example', description: 'A focused example users can copy and run.', language: 'ts', code: "console.log('Hello from Gloammark')" }

  if (type === 'resources') {
    return {
      id: createId(),
      type,
      visible: true,
      heading: 'Resources',
      items: [
        { id: createId(), label: 'Documentation', url: 'https://example.com/docs', description: 'Guides and reference.' },
        { id: createId(), label: 'Issues', url: 'https://github.com/owner/repo/issues', description: 'Report bugs or request features.' }
      ]
    }
  }

  if (type === 'contributing') {
    return {
      id: createId(),
      type,
      visible: true,
      heading: 'Contributing',
      intro: 'Contributions are welcome. Please keep changes focused and open an issue for larger proposals.',
      steps: [
        { id: createId(), description: 'Fork and clone the repository', command: 'git clone https://github.com/your-name/repository.git' },
        { id: createId(), description: 'Create a feature branch', command: 'git checkout -b feat/my-change' },
        { id: createId(), description: 'Install dependencies and validate the project', command: 'npm install\nnpm run build' }
      ],
      issueUrl: '',
      guidelinesUrl: ''
    }
  }

  if (type === 'roadmap') {
    return {
      id: createId(),
      type,
      visible: true,
      heading: 'Roadmap',
      items: [
        { id: createId(), label: 'Ship the first stable release', completed: true },
        { id: createId(), label: 'Add community presets', completed: false }
      ]
    }
  }

  if (type === 'details') {
    return {
      id: createId(),
      type,
      visible: true,
      heading: 'FAQ',
      items: [{ id: createId(), summary: 'How does it work?', body: 'Build your README visually, preview it in real time, then export clean GFM.', open: false }]
    }
  }

  if (type === 'markdown') return { id: createId(), type, visible: true, heading: 'Custom', markdown: '', showHeading: false }

  return {
    id: createId(),
    type: 'license',
    visible: true,
    heading: 'License',
    license: 'MIT',
    authorName: 'Your Name',
    links: { github: '', discord: '', telegram: '', website: '', x: '' }
  }
}

export const createDefaultState = (): DocumentState => ({
  title: 'README.md',
  blocks: [createBlock('hero'), createBlock('toc'), createBlock('text'), createBlock('techStack'), createBlock('features'), createBlock('gallery'), createBlock('quickStart'), createBlock('roadmap'), createBlock('license')]
})

export const presets = {
  Minimal: (): DocumentState => ({ title: 'README.md', blocks: [createBlock('hero'), createBlock('text'), createBlock('quickStart'), createBlock('license')] }),
  Product: () => createDefaultState(),
  OpenSource: (): DocumentState => ({ title: 'README.md', blocks: [createBlock('hero'), createBlock('toc'), createBlock('gallery'), createBlock('text'), createBlock('features'), createBlock('techStack'), createBlock('requirements'), createBlock('quickStart'), createBlock('contributing'), createBlock('roadmap'), createBlock('details'), createBlock('license')] }),
  WebApp: (): DocumentState => ({ title: 'README.md', blocks: [createBlock('hero'), createBlock('toc'), createBlock('gallery'), createBlock('features'), createBlock('techStack'), createBlock('requirements'), createBlock('quickStart'), createBlock('config'), createBlock('contributing'), createBlock('roadmap'), createBlock('license')] }),
  Library: (): DocumentState => ({ title: 'README.md', blocks: [createBlock('hero'), createBlock('toc'), createBlock('text'), createBlock('requirements'), createBlock('quickStart'), createBlock('code'), createBlock('config'), createBlock('contributing'), createBlock('roadmap'), createBlock('license')] }),
  CLI: (): DocumentState => ({ title: 'README.md', blocks: [createBlock('hero'), createBlock('toc'), createBlock('text'), createBlock('requirements'), createBlock('quickStart'), createBlock('code'), createBlock('features'), createBlock('contributing'), createBlock('roadmap'), createBlock('license')] }),
  API: (): DocumentState => ({ title: 'README.md', blocks: [createBlock('hero'), createBlock('toc'), createBlock('text'), createBlock('requirements'), createBlock('quickStart'), createBlock('config'), createBlock('code'), createBlock('alert'), createBlock('details'), createBlock('contributing'), createBlock('license')] }),
  Desktop: (): DocumentState => ({ title: 'README.md', blocks: [createBlock('hero'), createBlock('toc'), createBlock('gallery'), createBlock('features'), createBlock('techStack'), createBlock('requirements'), createBlock('quickStart'), createBlock('resources'), createBlock('roadmap'), createBlock('license')] }),
  Mobile: (): DocumentState => ({ title: 'README.md', blocks: [createBlock('hero'), createBlock('toc'), createBlock('gallery'), createBlock('features'), createBlock('techStack'), createBlock('requirements'), createBlock('quickStart'), createBlock('details'), createBlock('roadmap'), createBlock('license')] }),
  Game: (): DocumentState => ({ title: 'README.md', blocks: [createBlock('hero'), createBlock('gallery'), createBlock('text'), createBlock('features'), createBlock('techStack'), createBlock('requirements'), createBlock('quickStart'), createBlock('roadmap'), createBlock('license')] }),
  Documentation: (): DocumentState => ({ title: 'README.md', blocks: [createBlock('hero'), createBlock('toc'), createBlock('text'), createBlock('requirements'), createBlock('quickStart'), createBlock('code'), createBlock('resources'), createBlock('details'), createBlock('license')] })
}
