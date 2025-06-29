import { FaGithub, FaExternalLinkAlt } from 'react-icons/fa';
import { FiUser } from 'react-icons/fi';

export default function ProjectCard({ project }) {
  return (
    <div className="project-card">
      <div className="project-image-container">
        <img 
          src={project.image} 
          alt={project.title} 
          className="project-image"
          loading="lazy"
        />
      </div>
      <div className="project-content">
        <div className="project-tags">
          {project.tags.map(tag => (
            <span key={tag} className="project-tag">{tag}</span>
          ))}
        </div>
        <h3 className="project-title">{project.title}</h3>
        <p className="project-description">{project.description}</p>
        
        <div className="project-technologies">
          {project.technologies.map(tech => (
            <span key={tech} className="project-tech">{tech}</span>
          ))}
        </div>
        
        <div className="project-meta">
          <div className="project-student">
            <FiUser size={14} />
            <span>{project.student}</span>
            <span className="project-cohort">{project.cohort}</span>
          </div>
          <div className="project-links">
            {project.githubUrl && (
              <a 
                href={project.githubUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="GitHub repository"
                className="project-link"
              >
                <FaGithub />
              </a>
            )}
            {project.liveUrl && (
              <a 
                href={project.liveUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Live demo"
                className="project-link"
              >
                <FaExternalLinkAlt />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
