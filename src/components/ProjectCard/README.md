# ProjectCard Component

A reusable, feature-rich project card component for showcasing projects with detailed information modals. Built with TypeScript and follows the website's design system using Tailwind CSS and theme variables.

## Features

- 🎨 **Multiple Variants**: Default, compact, and featured layouts
- 🌓 **Theme Support**: Full light/dark mode compatibility
- 📱 **Responsive**: Mobile-first responsive design
- ♿ **Accessible**: Keyboard navigation and screen reader support
- 🔗 **Interactive**: Clickable cards with smooth hover effects
- 📋 **Detailed Modals**: Expandable views with tabbed content
- 🎯 **TypeScript**: Fully typed with comprehensive interfaces
- 🎪 **Flexible**: Supports various project types and data structures

## Quick Start

```tsx
import { ProjectCard, ProjectModal, type Project } from '@/components/ProjectCard'

const MyProjects = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  const project: Project = {
    id: 1,
    title: "My Awesome Project",
    description: "A detailed description of what this project does...",
    techStack: ["React", "TypeScript", "Tailwind CSS"],
    github: {
      url: "https://github.com/username/project",
      stars: 100,
      forks: 25
    },
    status: "active"
  }

  return (
    <>
      <ProjectCard 
        project={project} 
        onExpand={setSelectedProject}
      />
      
      {selectedProject && (
        <ProjectModal 
          project={selectedProject} 
          onClose={() => setSelectedProject(null)} 
        />
      )}
    </>
  )
}
```

## Project Interface

```typescript
interface Project {
  id: string | number
  title: string
  shortDescription?: string
  description: string
  coverImage?: any // Payload media type
  techStack?: (string | ProjectTechStack)[]
  github?: ProjectGithubStats
  linesOfCode?: number
  readme?: string
  architecture?: string
  problemSolving?: string
  usageGuide?: string
  futureWork?: string
  publication?: ProjectPublication
  plots?: ProjectMedia[]
  images?: ProjectMedia[]
  posters?: ProjectPoster[]
  demoUrl?: string
  status?: 'active' | 'completed' | 'archived'
  category?: string
}
```

## Component Props

### ProjectCard Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `project` | `Project` | - | **Required.** Project data object |
| `onExpand` | `(project: Project) => void` | - | Callback when card is clicked for expansion |
| `className` | `string` | `''` | Additional CSS classes |
| `variant` | `'default' \| 'compact' \| 'featured'` | `'default'` | Card layout variant |

### ProjectModal Props

| Prop | Type | Description |
|------|------|-------------|
| `project` | `Project` | **Required.** Project data to display |
| `onClose` | `() => void` | **Required.** Callback to close modal |

## Card Variants

### Default
Standard card layout with full project information display.

```tsx
<ProjectCard project={project} variant="default" />
```

### Compact
Smaller card suitable for sidebars or dense layouts.

```tsx
<ProjectCard project={project} variant="compact" />
```

### Featured
Larger card that spans multiple columns, perfect for highlighting important projects.

```tsx
<ProjectCard project={project} variant="featured" />
```

## Modal Tabs

The modal automatically displays relevant tabs based on available data:

- **Overview**: Always shown - description, tech stack, usage guide
- **Code & Architecture**: Shown if `github` or `architecture` data exists
- **Research**: Shown if `problemSolving` or `publication` data exists  
- **Media**: Shown if `plots`, `images`, or `posters` arrays have content
- **Future Work**: Shown if `futureWork` content exists

## Tech Stack Support

Tech stack can be defined as simple strings or objects with icons:

```typescript
// Simple strings
techStack: ["React", "TypeScript", "Node.js"]

// With icons (for future enhancement)
techStack: [
  { name: "React", icon: ReactIcon },
  { name: "TypeScript", icon: TypeScriptIcon }
]
```

## GitHub Integration

Include GitHub stats to display repository information:

```typescript
github: {
  url: "https://github.com/username/repo",
  stars: 1420,
  forks: 234
}
```

## Media Support

Support for various media types in the modal:

```typescript
// Plots and visualizations
plots: [
  {
    url: "/path/to/chart.png",
    caption: "Performance metrics over time",
    alt: "Line chart showing performance improvements"
  }
]

// Project screenshots
images: [
  {
    url: "/path/to/screenshot.png", 
    caption: "Main dashboard interface",
    alt: "Screenshot of the application dashboard"
  }
]

// Conference posters
posters: [
  {
    title: "Advanced Algorithms for Data Processing",
    conference: "Tech Conference 2024",
    year: 2024,
    url: "/path/to/poster.pdf"
  }
]
```

## Styling & Theming

The component uses CSS variables from your design system:

- `bg-card` - Card background
- `border-border` - Border colors
- `text-foreground` - Primary text
- `text-muted-foreground` - Secondary text
- `bg-primary` - Primary accent color
- `bg-secondary` - Secondary accent color

## Accessibility

- Full keyboard navigation support
- Screen reader compatible
- Focus management in modals
- Proper ARIA labels and roles
- High contrast support

## Examples

Check `example.tsx` for a complete implementation showing:
- Basic usage
- Different variants
- Modal integration
- Sample data structures

## Integration with Payload CMS

The component is designed to work seamlessly with Payload CMS:

```typescript
// Use Payload media types
coverImage?: any // Payload media relation

// In your component
<ProjectCard 
  project={{
    ...project,
    coverImage: project.coverImage // Payload media object
  }}
/>
```

The `Media` component from `@/components/Media` is used internally for optimal image handling.