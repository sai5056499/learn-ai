


export interface Theme {
  name: string;
  properties: Record<string, string>;
}

export const starlightTheme: Theme = {
  name: 'Starlight',
  properties: {
    '--color-background': '#0f172a', // slate-900
    '--color-foreground': '#f8fafc', // slate-50
    '--color-muted-foreground': '#94a3b8', // slate-400
    '--color-primary': '#8b5cf6', // violet-500
    '--color-primary-hover': '#7c3aed', // violet-600
    '--color-primary-foreground': '#ffffff',
    '--color-secondary': '#1e293b', // slate-800
    '--color-secondary-hover': '#334155', // slate-700
    '--color-secondary-foreground': '#f1f5f9', // slate-100
    '--color-accent': '#22d3ee', // cyan-400
    '--color-border': '#334155', // slate-700
    '--color-border-hover': '#475569', // slate-600
    '--color-card': '#1e293b',
    '--color-card-foreground': '#f8fafc',
    '--color-destructive': '#f43f5e', // rose-500
    '--color-destructive-foreground': '#ffffff',
    '--color-info': '#38bdf8', // lightBlue-400
    '--color-warning': '#facc15', // yellow-400
    '--color-topic-progress': '#8b5cf6',
    '--color-resource-tag': 'rgba(139, 92, 246, 0.15)',
    '--color-resource-tag-text': '#a78bfa', // violet-400
    '--color-completed-check': '#22d3ee',
    '--bg-pattern': 'none',
    '--color-primary-glow': 'rgba(139, 92, 246, 0.5)',
    '--font-sans': "'Poppins', sans-serif",
    '--font-serif': "'Poppins', sans-serif",
    '--project-card-border-glow': 'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(139, 92, 246, 0.5), rgba(15, 23, 42, 0))',
    '--gradient-primary-accent': 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
  }
};

export const modernTheme: Theme = {
  name: 'Modern',
  properties: {
    '--color-background': '#F9FAFB',
    '--color-foreground': '#1F2937', // dark grey
    '--color-muted-foreground': '#6B7280', // medium grey
    '--color-primary': '#4F46E5', // indigo-600
    '--color-primary-hover': '#4338CA', // indigo-700
    '--color-primary-foreground': '#FFFFFF',
    '--color-secondary': '#F3F4F6', // light grey
    '--color-secondary-hover': '#E5E7EB',
    '--color-secondary-foreground': '#111827',
    '--color-accent': '#7C3AED', // violet-600
    '--color-border': '#E5E7EB',
    '--color-border-hover': '#D1D5DB',
    '--color-card': '#FFFFFF',
    '--color-card-foreground': '#111827',
    '--color-destructive': '#DC2626', // red-600
    '--color-destructive-foreground': '#FFFFFF',
    '--color-info': '#3B82F6', // blue-500
    '--color-warning': '#F59E0B', // amber-500
    '--color-topic-progress': '#EF4444', // red-500 from screenshot
    '--color-resource-tag': '#EDE9FE', // violet-100 from screenshot
    '--color-resource-tag-text': '#6D28D9', // violet-700 from screenshot
    '--color-completed-check': '#A78BFA', // violet-400 from screenshot
    '--bg-pattern': 'none',
    '--color-primary-glow': 'rgba(79, 70, 229, 0.4)',
    '--font-sans': "'Poppins', sans-serif",
    '--font-serif': "'Poppins', sans-serif",
    '--project-card-border-glow': 'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(121, 114, 238, 0.5),rgba(255, 255, 255, 0))',
    '--gradient-primary-accent': 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
  }
};

export const cyberDarkTheme: Theme = {
    name: 'Cyber Dark',
    properties: {
        '--color-background': '#0D1117', // Very dark blue, almost black
        '--color-foreground': '#C9D1D9', // Light grey for text
        '--color-muted-foreground': '#8B949E', // Medium grey for less important text
        '--color-primary': '#F778BA', // Neon Pink
        '--color-primary-hover': '#F54EA0', // Brighter Pink
        '--color-primary-foreground': '#0D1117', // Dark text on pink buttons
        '--color-secondary': '#161B22', // Slightly lighter dark blue for secondary backgrounds
        '--color-secondary-hover': '#21262D',
        '--color-secondary-foreground': '#C9D1D9',
        '--color-accent': '#39C5E7', // Neon Cyan
        '--color-border': '#30363D', // Dark grey border
        '--color-border-hover': '#8B949E',
        '--color-card': '#161B22', // Same as secondary
        '--color-card-foreground': '#C9D1D9',
        '--color-destructive': '#F85149', // Neon Red
        '--color-destructive-foreground': '#FFFFFF',
        '--color-info': '#58A6FF', // Bright Blue
        '--color-warning': '#FDB827', // Bright Yellow
        '--color-topic-progress': '#F778BA', // Use primary pink for progress
        '--color-resource-tag': 'rgba(247, 120, 186, 0.1)', // Pink with alpha
        '--color-resource-tag-text': '#F778BA',
        '--color-completed-check': '#39C5E7', // Use accent cyan for checks
        '--bg-pattern': 'none',
        '--color-primary-glow': 'rgba(247, 120, 186, 0.5)', // Pink glow
        '--font-sans': "'Poppins', sans-serif",
        '--font-serif': "'Poppins', sans-serif",
        '--project-card-border-glow': 'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(247, 120, 186, 0.5),rgba(255, 255, 255, 0))',
        '--gradient-primary-accent': 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
    }
};

export const gfgTheme: Theme = {
  name: 'GeeksForGeeks',
  properties: {
    '--color-background': '#FFFFFF',
    '--color-foreground': '#333333',
    '--color-muted-foreground': '#555555',
    '--color-primary': '#047857', // emerald-700
    '--color-primary-hover': '#059669', // emerald-600
    '--color-primary-foreground': '#FFFFFF',
    '--color-secondary': '#F3F4F6', // gray-100
    '--color-secondary-hover': '#E5E7EB', // gray-200
    '--color-secondary-foreground': '#1F2937',
    '--color-accent': '#f59e0b', // amber-500
    '--color-border': '#E5E7EB', // gray-200
    '--color-border-hover': '#D1D5DB', // gray-300
    '--color-card': '#FFFFFF',
    '--color-card-foreground': '#333333',
    '--color-destructive': '#DC2626', // red-600
    '--color-destructive-foreground': '#FFFFFF',
    '--color-info': '#3B82F6', // blue-500
    '--color-warning': '#F59E0B', // amber-500
    '--color-topic-progress': '#EF4444', 
    '--color-resource-tag': '#D1FAE5', // green-100
    '--color-resource-tag-text': '#065F46', // green-800
    '--color-completed-check': '#047857', // primary green
    '--bg-pattern': 'none',
    '--color-primary-glow': 'rgba(4, 120, 87, 0.3)',
    '--font-sans': "'Poppins', sans-serif",
    '--font-serif': "'Poppins', sans-serif",
    '--project-card-border-glow': 'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(4, 120, 87, 0.4),rgba(255, 255, 255, 0))',
    '--gradient-primary-accent': 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
  }
};

export const themes: Theme[] = [starlightTheme, modernTheme, cyberDarkTheme, gfgTheme];
export const defaultTheme: Theme = starlightTheme;