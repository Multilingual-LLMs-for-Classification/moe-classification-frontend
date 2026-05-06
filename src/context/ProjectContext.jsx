import { createContext, useContext, useState } from 'react';

const ProjectContext = createContext(null);

export function ProjectProvider({ project, children }) {
  const [currentProject, setCurrentProject] = useState(project);
  return (
    <ProjectContext.Provider value={{ currentProject, setCurrentProject }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject must be used within ProjectProvider');
  return ctx;
}
