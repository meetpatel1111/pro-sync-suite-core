
# ProSync Suite Development Guide

This guide provides comprehensive information for developers working on the ProSync Suite platform, including setup instructions, architecture overview, and contribution guidelines.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Git for version control
- Code editor (VS Code recommended)
- Supabase CLI (for database management)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd prosync-suite

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🏗️ Architecture Overview

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Tailwind CSS + Shadcn/UI
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **State Management**: React Query + Context API
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Build Tool**: Vite

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (shadcn/ui)
│   ├── taskmaster/     # TaskMaster-specific components
│   ├── timetrackpro/   # TimeTrackPro-specific components
│   └── ...             # Other app-specific components
├── pages/              # Page components
├── context/            # React Context providers
├── hooks/              # Custom React hooks
├── services/           # API and business logic
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── integrations/       # External service integrations
```

## 🎨 UI Development

### Design System
ProSync Suite uses a consistent design system based on:
- **Colors**: Primary palette with semantic color usage
- **Typography**: Hierarchical text scales
- **Spacing**: Consistent spacing units
- **Components**: Reusable component library

### Component Guidelines
```typescript
// Component structure example
interface ComponentProps {
  // Props interface
}

const Component: React.FC<ComponentProps> = ({ ...props }) => {
  // Component logic
  
  return (
    <div className="component-styles">
      {/* Component JSX */}
    </div>
  );
};

export default Component;
```

### Styling Conventions
- Use Tailwind CSS classes for styling
- Follow mobile-first responsive design
- Use semantic class names
- Leverage Shadcn/UI components

## 🔧 Development Workflow

### File Naming Conventions
- **Components**: PascalCase (`TaskCard.tsx`)
- **Pages**: PascalCase (`TaskMaster.tsx`)
- **Services**: camelCase (`taskService.ts`)
- **Types**: camelCase (`taskTypes.ts`)
- **Hooks**: camelCase with 'use' prefix (`useTaskData.ts`)

### Code Style Guidelines
- Use TypeScript for type safety
- Follow ESLint and Prettier configurations
- Write descriptive variable and function names
- Add JSDoc comments for complex functions
- Use meaningful commit messages

### Component Development
```typescript
// Example component with proper typing
interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onEdit, 
  onDelete 
}) => {
  const handleEdit = () => {
    onEdit(task);
  };

  return (
    <Card className="task-card">
      <CardHeader>
        <CardTitle>{task.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{task.description}</p>
      </CardContent>
      <CardFooter>
        <Button onClick={handleEdit}>Edit</Button>
        <Button 
          variant="destructive" 
          onClick={() => onDelete(task.id)}
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};
```

## 🗄️ Database Development

### Supabase Setup
- Database schema migrations
- Row Level Security (RLS) policies
- Database functions and triggers
- Real-time subscriptions

### Schema Conventions
- Use UUID for primary keys
- Include `created_at` and `updated_at` timestamps
- Follow naming conventions: `snake_case`
- Add appropriate indexes for performance

### Example Table Creation
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  description TEXT,
  status VARCHAR NOT NULL DEFAULT 'todo',
  priority VARCHAR NOT NULL DEFAULT 'medium',
  project_id UUID REFERENCES projects(id),
  assigned_to UUID[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can view their tasks" ON tasks
  FOR SELECT USING (
    created_by = auth.uid() OR 
    auth.uid() = ANY(assigned_to)
  );
```

## 🔌 Service Development

### Service Layer Pattern
Create service files for API interactions and business logic:

```typescript
// taskService.ts
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types/taskmaster';

export const taskService = {
  async getTasks(projectId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId);
    
    if (error) throw error;
    return data || [];
  },

  async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};
```

### Integration Services
Use integration services for cross-app functionality:

```typescript
// integrationService.ts
export const integrationService = {
  async createTaskFromNote(
    title: string,
    description: string,
    projectId?: string
  ): Promise<Task | null> {
    // Implementation
  },

  async logTimeForTask(
    taskId: string,
    minutes: number,
    description?: string
  ): Promise<TimeEntry | null> {
    // Implementation
  }
};
```

## 🔄 State Management

### React Query Usage
Use React Query for server state management:

```typescript
// useTaskData.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '@/services/taskService';

export const useTaskData = (projectId: string) => {
  return useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => taskService.getTasks(projectId),
    enabled: !!projectId
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: taskService.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });
};
```

### Context Usage
Use React Context for global application state:

```typescript
// AuthContext.tsx
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};
```

## 🧪 Testing

### Testing Strategy
- Unit tests for utility functions
- Component tests for UI components
- Integration tests for services
- E2E tests for critical user flows

### Testing Tools
- Jest for unit testing
- React Testing Library for component testing
- Playwright for E2E testing

### Example Test
```typescript
// TaskCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCard } from './TaskCard';

describe('TaskCard', () => {
  const mockTask = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    status: 'todo',
    priority: 'medium'
  };

  it('renders task information', () => {
    render(<TaskCard task={mockTask} onEdit={() => {}} onDelete={() => {}} />);
    
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = jest.fn();
    render(<TaskCard task={mockTask} onEdit={onEdit} onDelete={() => {}} />);
    
    fireEvent.click(screen.getByText('Edit'));
    expect(onEdit).toHaveBeenCalledWith(mockTask);
  });
});
```

## 📱 Performance Optimization

### Best Practices
- Use React.memo for expensive components
- Implement virtual scrolling for large lists
- Optimize images and assets
- Use code splitting for large bundles
- Implement proper caching strategies

### Bundle Optimization
```typescript
// Dynamic imports for code splitting
const TaskMaster = lazy(() => import('./pages/TaskMaster'));
const TimeTrackPro = lazy(() => import('./pages/TimeTrackPro'));

// In your router
<Route 
  path="/taskmaster" 
  element={
    <Suspense fallback={<LoadingSpinner />}>
      <TaskMaster />
    </Suspense>
  } 
/>
```

## 🔐 Security Guidelines

### Authentication
- Use Supabase Auth for user management
- Implement proper session handling
- Use secure password policies
- Enable two-factor authentication

### Authorization
- Implement Row Level Security (RLS)
- Use role-based access control
- Validate permissions on both client and server
- Regular security audits

### Data Protection
- Sanitize user inputs
- Use HTTPS for all communications
- Encrypt sensitive data
- Regular security updates

## 🚀 Deployment

### Build Process
```bash
# Production build
npm run build

# Preview build locally
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

### Environment Setup
- Development: Local development with hot reload
- Staging: Testing environment with production-like setup
- Production: Live application deployment

## 📖 API Documentation

### Supabase API Usage
```typescript
// Example API call with error handling
const fetchUserData = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    throw error;
  }
};
```

## 🤝 Contributing

### Pull Request Process
1. Create feature branch from main
2. Implement changes with tests
3. Update documentation
4. Submit pull request
5. Code review and approval
6. Merge to main

### Code Review Guidelines
- Check for code quality and consistency
- Verify test coverage
- Review security implications
- Ensure documentation updates
- Performance impact assessment

### Commit Convention
```
type(scope): description

feat(taskmaster): add task filtering functionality
fix(auth): resolve login redirect issue
docs(readme): update installation instructions
style(ui): improve button component styling
refactor(services): optimize API call structure
test(taskcard): add unit tests for task operations
```

## 📚 Resources

### Documentation Links
- [React Documentation](https://reactjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [React Query](https://tanstack.com/query/latest)

### Helpful Tools
- [Shadcn/UI Components](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [React Router](https://reactrouter.com/)

For questions or support, contact the development team or refer to the project's issue tracker.
