import connectDB from './mongodb';
import Home from './models/Home';
import About from './models/About';
import Experience from './models/Experience';
import Education from './models/Education';
import Skill from './models/Skill';

export async function generateResumePDF() {
  try {
    await connectDB();

    // Fetch all data
    const [home, about, experiences, educations, skills] = await Promise.all([
      Home.findOne(),
      About.findOne(),
      Experience.find().sort({ createdAt: -1 }),
      Education.find().sort({ createdAt: -1 }),
      Skill.find(),
    ]);

    // Generate LaTeX content
    const latexContent = generateLaTeXContent({
      home: home || {
        name: 'Maksudul Haque / মাকসুদুল হক',
        title: 'Student | Web Developer | Competitive Programmer | Problem Solver',
      },
      about: about || {
        location: 'Dhaka, Bangladesh',
        description: '',
        languages: [],
      },
      experiences: experiences || [],
      educations: educations || [],
      skills: skills || [],
    });

    return latexContent;
  } catch (error) {
    console.error('Error generating resume:', error);
    throw error;
  }
}

// Escape LaTeX special characters
function escapeLaTeX(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/{/g, '\\{')
    .replace(/}/g, '\\}')
    .replace(/#/g, '\\#')
    .replace(/\$/g, '\\$')
    .replace(/%/g, '\\%')
    .replace(/&/g, '\\&')
    .replace(/\^/g, '\\textasciicircum{}')
    .replace(/_/g, '\\_')
    .replace(/~/g, '\\textasciitilde{}');
}

function generateLaTeXContent(data: any) {
  const { home, about, experiences, educations, skills } = data;

  // Categorize skills
  const frontendSkills = skills.filter((s: any) => s.category === 'frontend').map((s: any) => escapeLaTeX(s.name));
  const backendSkills = skills.filter((s: any) => s.category === 'backend').map((s: any) => escapeLaTeX(s.name));
  const otherSkills = skills.filter((s: any) => s.category === 'other').map((s: any) => escapeLaTeX(s.name));

  const nameParts = home.name.split('/');
  const firstName = escapeLaTeX(nameParts[0]?.trim() || 'Maksudul Haque');
  const lastName = escapeLaTeX(nameParts[1]?.trim() || '');

  const latex = `\\documentclass[11pt,a4paper]{moderncv}
\\moderncvstyle{classic}
\\moderncvcolor{blue}

% Personal Data
\\name{${firstName}}{${lastName}}
\\title{${escapeLaTeX(home.title)}}
\\address{${escapeLaTeX(about.location)}}
\\email{smmaksudulhaque2000@gmail.com}
\\social[linkedin]{maksudulhaque2000}
\\social[github]{maksudulhaque2000}

\\begin{document}
\\makecvtitle

\\section{Professional Summary}
${escapeLaTeX(about.description || 'Experienced web developer with expertise in modern web technologies.')}

\\section{Experience}
${experiences.length > 0
  ? experiences
      .map((exp: any) => {
        const period = escapeLaTeX(exp.period || '');
        const title = escapeLaTeX(exp.title || '');
        const company = escapeLaTeX(exp.company || '');
        const location = escapeLaTeX(exp.location || '');
        const descriptions = (exp.description || []).map((desc: string) => escapeLaTeX(desc));
        const technologies = (exp.technologies || []).map((tech: string) => escapeLaTeX(tech));
        
        return `\\cventry{${period}}{${title}}{${company}}{${location}}{}{
  \\begin{itemize}
${descriptions.map((desc: string) => `    \\item ${desc}`).join('\n')}
  \\end{itemize}
  \\textit{Technologies: ${technologies.join(', ')}}}`;
      })
      .join('\n\n')
  : 'No experience entries.'}

\\section{Education}
${educations.length > 0
  ? educations
      .map((edu: any) => {
        const duration = escapeLaTeX(edu.duration || '');
        const degree = escapeLaTeX(edu.degree || '');
        const institution = escapeLaTeX(edu.institution || '');
        const description = escapeLaTeX(edu.description || '');
        
        return `\\cventry{${duration}}{${degree}}{${institution}}{}{}{${description}}`;
      })
      .join('\n\n')
  : 'No education entries.'}

\\section{Skills}
${frontendSkills.length > 0 ? `\\cvitem{Frontend}{${frontendSkills.join(', ')}}` : ''}
${backendSkills.length > 0 ? `\\cvitem{Backend}{${backendSkills.join(', ')}}` : ''}
${otherSkills.length > 0 ? `\\cvitem{Others}{${otherSkills.join(', ')}}` : ''}

\\section{Languages}
${about.languages && about.languages.length > 0
  ? about.languages
      .map((lang: any) => {
        const langName = escapeLaTeX(lang.name || '');
        let proficiency = 'Intermediate';
        if (lang.proficiency >= 95) proficiency = 'Native';
        else if (lang.proficiency >= 70) proficiency = 'Fluent';
        return `\\cvitem{${langName}}{${proficiency}}`;
      })
      .join('\n')
  : 'No languages listed.'}

\\end{document}`;

  return latex;
}
