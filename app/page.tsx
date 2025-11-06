import HomeSection from '@/components/sections/HomeSection';
import AboutSection from '@/components/sections/AboutSection';
import SkillsSection from '@/components/sections/SkillsSection';
import ProjectsSection from '@/components/sections/ProjectsSection';
import ResumeSection from '@/components/sections/ResumeSection';
import BlogsSection from '@/components/sections/BlogsSection';
import ContactSection from '@/components/sections/ContactSection';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

export default async function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HomeSection />
      <AboutSection />
      <SkillsSection />
      <ProjectsSection />
      <ResumeSection />
      <BlogsSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
