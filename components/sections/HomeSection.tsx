import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { DownloadResumeButton } from '@/components/DownloadResumeButton';
import connectDB from '@/lib/mongodb';
import Home from '@/lib/models/Home';

async function getHomeData() {
  try {
    await connectDB();
    const homeData = await Home.findOne();
    return homeData || {
      profileImage: '/placeholder-profile.svg',
      name: 'Maksudul Haque / মাকসুদুল হক',
      title: 'Student | Web Developer | Competitive Programmer | Problem Solver',
      description:
        'I am a passionate student and web developer with expertise in modern web technologies. I love solving complex problems and building innovative solutions.',
      resumeLink: '#resume',
    };
  } catch (error) {
    console.error('Error fetching home data:', error);
    return {
      profileImage: '/placeholder-profile.svg',
      name: 'Maksudul Haque / মাকসুদুল হক',
      title: 'Student | Web Developer | Competitive Programmer | Problem Solver',
      description:
        'I am a passionate student and web developer with expertise in modern web technologies. I love solving complex problems and building innovative solutions.',
      resumeLink: '#resume',
    };
  }
}

export default async function HomeSection() {
  const homeData = await getHomeData();

  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center pt-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/20"
    >
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left Side - Text Content */}
          <div className="flex-1 text-center lg:text-left space-y-6 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {homeData.name}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-medium">
              {homeData.title}
            </p>
            <p className="text-lg text-foreground/80 max-w-2xl mx-auto lg:mx-0">
              {homeData.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Link href="#contact">
                <Button size="lg" className="w-full sm:w-auto group">
                  Get in Touch
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <DownloadResumeButton 
                size="lg" 
                variant="outline" 
                className="w-full sm:w-auto" 
              />
            </div>
          </div>

          {/* Right Side - Profile Image */}
          <div className="flex-1 flex justify-center lg:justify-end">
            <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 animate-slide-up">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 rounded-full blur-3xl"></div>
              <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-primary/20 shadow-2xl">
                <Image
                  src={homeData.profileImage || '/placeholder-profile.svg'}
                  alt={homeData.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
