import connectDB from '@/lib/mongodb';
import Skill from '@/lib/models/Skill';
import SkillsSectionClient from './SkillsSectionClient';

async function getSkills() {
  try {
    await connectDB();
    const skills = await Skill.find().sort({ name: 1 });
    return JSON.parse(JSON.stringify(skills));
  } catch (error) {
    console.error('Error fetching skills:', error);
    return [];
  }
}

export default async function SkillsSection() {
  const allSkills = await getSkills();
  return <SkillsSectionClient skills={allSkills} />;
}
