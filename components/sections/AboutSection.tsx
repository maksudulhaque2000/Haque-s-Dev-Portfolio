import Image from 'next/image';
import { MapPin } from 'lucide-react';
import connectDB from '@/lib/mongodb';
import About from '@/lib/models/About';
import { DownloadResumeButton } from '@/components/DownloadResumeButton';

async function getAboutData() {
  try {
    await connectDB();
    const aboutData = await About.findOne();
    return aboutData || {
      image: '/placeholder-about.svg',
      description:
        'I am a passionate student and web developer with expertise in modern web technologies. I love solving complex problems and building innovative solutions.',
      location: 'Dhaka, Bangladesh',
      languages: [],
      interests: [],
    };
  } catch (error) {
    console.error('Error fetching about data:', error);
    return {
      image: '/placeholder-about.svg',
      description:
        'I am a passionate student and web developer with expertise in modern web technologies. I love solving complex problems and building innovative solutions.',
      location: 'Dhaka, Bangladesh',
      languages: [],
      interests: [],
    };
  }
}

export default async function AboutSection() {
  const aboutData = await getAboutData();

  return (
    <section id="about" className="py-16 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">About Me</h2>
          <div className="w-24 h-1 bg-primary mx-auto"></div>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-start">
          {/* Image */}
          <div className="lg:col-span-2 flex justify-center lg:justify-start">
            <div className="relative w-full max-w-md h-[400px] lg:h-[500px] rounded-lg overflow-hidden shadow-2xl">
              <Image
                src={aboutData.image || '/placeholder-about.svg'}
                alt="About Me"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 space-y-6">
            <p className="text-base md:text-lg text-foreground/80 leading-relaxed">
              {aboutData.description}
            </p>

            {/* Location */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-5 w-5" />
              <span>{aboutData.location}</span>
            </div>

            {/* Languages */}
            {aboutData.languages && aboutData.languages.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Languages</h3>
                <div className="space-y-3">
                  {aboutData.languages.map((lang: any, index: number) => {
                    // Convert proficiency percentage to label
                    let proficiencyLabel = 'Intermediate';
                    if (lang.proficiency >= 95) {
                      proficiencyLabel = 'Native';
                    } else if (lang.proficiency >= 70) {
                      proficiencyLabel = 'Fluent';
                    }
                    
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{lang.name}</span>
                        <span className="text-sm px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">
                          {proficiencyLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Interests & Hobbies */}
            {aboutData.interests && aboutData.interests.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Interests & Hobbies</h3>
                <div className="flex flex-wrap gap-2">
                  {aboutData.interests.map((interest: any, index: number) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-muted rounded-full text-sm font-medium"
                    >
                      {interest.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Download Resume Button */}
            <DownloadResumeButton />
          </div>
        </div>
      </div>
    </section>
  );
}
