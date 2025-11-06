/**
 * Seed script to populate initial data
 * Run with: npx ts-node scripts/seed-data.ts
 * Or create a Next.js API route to run it
 */

import connectDB from '../lib/mongodb';
import bcrypt from 'bcryptjs';
import User from '../lib/models/User';
import Home from '../lib/models/Home';
import About from '../lib/models/About';
import Skill from '../lib/models/Skill';
import Experience from '../lib/models/Experience';
import Education from '../lib/models/Education';

async function seed() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Create Admin User
    const hashedPassword = await bcrypt.hash('474975moon@', 10);
    const user = await User.findOneAndUpdate(
      { email: 'smmaksudulhaque2000@gmail.com' },
      {
        email: 'smmaksudulhaque2000@gmail.com',
        password: hashedPassword,
        name: 'Maksudul Haque',
        provider: 'credentials',
      },
      { upsert: true, new: true }
    );
    console.log('Admin user created/updated:', user.email);

    // Seed Home Data
    const home = await Home.findOneAndUpdate(
      {},
      {
        profileImage: '/placeholder-profile.jpg',
        name: 'Maksudul Haque / মাকসুদুল হক',
        title: 'Student | Web Developer | Competitive Programmer | Problem Solver',
        description:
          'I am a passionate student and web developer with expertise in modern web technologies. I love solving complex problems and building innovative solutions.',
      },
      { upsert: true, new: true }
    );
    console.log('Home data seeded');

    // Seed About Data
    const about = await About.findOneAndUpdate(
      {},
      {
        image: '/placeholder-about.jpg',
        description:
          'I am a passionate student and web developer with expertise in modern web technologies. I love solving complex problems and building innovative solutions.',
        location: 'Dhaka, Bangladesh',
        languages: [
          { name: 'Bengali', proficiency: 100 },
          { name: 'English', proficiency: 85 },
        ],
        interests: [
          { name: 'Programming', icon: '💻' },
          { name: 'Problem Solving', icon: '🧩' },
          { name: 'Reading', icon: '📚' },
        ],
      },
      { upsert: true, new: true }
    );
    console.log('About data seeded');

    // Seed Skills
    const skills = [
      { name: 'React', category: 'frontend' },
      { name: 'Next.js', category: 'frontend' },
      { name: 'TypeScript', category: 'frontend' },
      { name: 'JavaScript', category: 'frontend' },
      { name: 'HTML/CSS', category: 'frontend' },
      { name: 'Tailwind CSS', category: 'frontend' },
      { name: 'Redux', category: 'frontend' },
      { name: 'Node.js', category: 'backend' },
      { name: 'Express', category: 'backend' },
      { name: 'MongoDB', category: 'backend' },
      { name: 'PostgreSQL', category: 'backend' },
      { name: 'REST APIs', category: 'backend' },
      { name: 'Git', category: 'other' },
      { name: 'Docker', category: 'other' },
      { name: 'Postman', category: 'other' },
      { name: 'AWS', category: 'other' },
      { name: 'CI/CD', category: 'other' },
      { name: 'Testing', category: 'other' },
    ];

    for (const skill of skills) {
      await Skill.findOneAndUpdate({ name: skill.name }, skill, { upsert: true });
    }
    console.log('Skills seeded');

    // Seed Experience
    const experiences = [
      {
        title: 'Project Intern (Data Archiving Lead)',
        company: 'Tappware Solution LTD',
        location: 'Dhaka, Bangladesh',
        period: 'May 2021 - July 2021',
        description: [
          'Led a critical data archiving project as a team lead under a government contract with the National Revenue Board (NRB).',
          'Managed the end-to-end data migration and archiving process, ensuring high standards of data integrity and quality control.',
          "Successfully delivered the complete project, which significantly streamlined the government's audit procedures and data retrieval systems.",
          'Developed valuable skills in project management, team collaboration, and handling large-scale datasets in a professional environment.',
        ],
        technologies: [
          'Data Management',
          'Data Integrity',
          'Microsoft Excel',
          'SQL (for data verification)',
          'Project Management',
          'Team Leadership',
        ],
      },
      {
        title: 'Junior Web Developer',
        company: 'Creative Hub Digital',
        location: 'Remote',
        period: 'August 2022 - April 2023',
        description: [
          'Developed responsive and user-friendly websites for various clients using fundamental web technologies.',
          'Translated UI/UX design mockups from Figma into clean, functional, and pixel-perfect code.',
          'Collaborated with senior developers to fix bugs, optimize website performance, and implement new features.',
          'Gained hands-on experience with version control systems like Git for team-based projects.',
        ],
        technologies: ['HTML5', 'CSS3', 'JavaScript (ES6+)', 'Bootstrap', 'jQuery', 'Git & GitHub', 'Figma'],
      },
    ];

    for (const exp of experiences) {
      await Experience.findOneAndUpdate({ title: exp.title, company: exp.company }, exp, {
        upsert: true,
      });
    }
    console.log('Experience seeded');

    // Seed Education
    const educations = [
      {
        degree: 'Honours 3rd Year (Accounting)',
        institution: 'Demra University College - DUC',
        duration: '2021-Present',
        description:
          'Currently pursuing a Bachelor of Honours degree in Accounting. Core coursework includes financial accounting, taxation, and auditing standards.',
        achievements: [
          'Consistently maintained a strong academic record.',
          'Actively participated in departmental seminars and workshops.',
        ],
      },
      {
        degree: 'Higher Secondary Certificate (HSC)',
        institution: 'Dania University College',
        duration: '2018 - 2020',
        description:
          'Completed Higher Secondary Certificate with a major in Business Studies, gaining a solid foundation in accounting, finance, and management.',
        achievements: ['GPA: 3.92/5.00'],
        certificate: 'HSC Certificate.pdf',
      },
      {
        degree: 'Secondary School Certificate (SSC)',
        institution: 'Barnomala Adarsha High School And College',
        duration: '2016 - 2018',
        description:
          'Completed Secondary School Certificate with a major in Business Studies, focusing on accounting, finance, and business entrepreneurship.',
        achievements: ['GPA: 3.67/5.00'],
        certificate: 'SSC Certificate.pdf',
      },
    ];

    for (const edu of educations) {
      await Education.findOneAndUpdate({ degree: edu.degree, institution: edu.institution }, edu, {
        upsert: true,
      });
    }
    console.log('Education seeded');

    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seed();
