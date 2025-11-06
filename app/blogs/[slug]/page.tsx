import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import connectDB from '@/lib/mongodb';
import Blog from '@/lib/models/Blog';
import { FacebookShareButton, LinkedinShareButton } from 'react-share';
import BlogClient from './BlogClient';

async function getBlog(slug: string) {
  try {
    await connectDB();
    
    // Clean and normalize the slug
    const cleanSlug = slug.trim();
    
    // Try multiple variations of the slug
    const slugVariations = [
      cleanSlug,                                    // Original
      cleanSlug.toLowerCase(),                      // Lowercase
      cleanSlug.replace(/\s+/g, '-'),               // Spaces to hyphens
      cleanSlug.replace(/\s+/g, '-').toLowerCase(), // Spaces to hyphens + lowercase
      cleanSlug.replace(/%20/g, ' '),               // URL decoded spaces
      cleanSlug.replace(/%20/g, '-'),               // URL decoded to hyphens
    ];
    
    // Remove duplicates
    const uniqueVariations = [...new Set(slugVariations)];
    
    // Try to find blog with published check
    let blog = await Blog.findOne({ 
      $or: uniqueVariations.map(s => ({ slug: s, published: true }))
    });
    
    // If not found with published check, try without it (for debugging)
    if (!blog) {
      blog = await Blog.findOne({ 
        $or: uniqueVariations.map(s => ({ slug: s }))
      });
      if (blog) {
        console.log(`Blog found but not published. Slug: ${blog.slug}, Searched: ${cleanSlug}`);
      } else {
        // Last resort: find all published blogs and try to match
        const allBlogs = await Blog.find({ published: true });
        const matchingBlog = allBlogs.find(b => {
          const blogSlugLower = b.slug.toLowerCase();
          return uniqueVariations.some(v => 
            blogSlugLower === v.toLowerCase() ||
            blogSlugLower.includes(v.toLowerCase()) ||
            v.toLowerCase().includes(blogSlugLower)
          );
        });
        if (matchingBlog) {
          console.log(`Blog found with similar slug. Database: ${matchingBlog.slug}, Searched: ${cleanSlug}`);
          blog = matchingBlog;
        } else {
          console.log(`Blog not found. Searched variations:`, uniqueVariations);
          // List all available slugs for debugging
          const allSlugs = allBlogs.map(b => b.slug);
          console.log(`Available blog slugs:`, allSlugs);
        }
      }
      if (!blog) return null;
    }
    
    // Increment views
    await Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } });
    
    return JSON.parse(JSON.stringify(blog));
  } catch (error) {
    console.error('Error fetching blog:', error);
    return null;
  }
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Decode URL-encoded slug (handles %20 for spaces, etc.)
  const decodedSlug = decodeURIComponent(slug);
  const blog = await getBlog(decodedSlug);

  if (!blog) {
    notFound();
  }

  const shareUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/blogs/${blog.slug}`;

  return (
    <div className="min-h-screen bg-background">
      <article className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/#blogs"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Blogs
          </Link>

          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight text-foreground">
              {blog.title}
            </h1>
            
            {blog.excerpt && (
              <p className="text-lg md:text-xl text-muted-foreground mb-6 leading-relaxed font-medium">
                {blog.excerpt}
              </p>
            )}
            
            <div className="flex flex-wrap items-center gap-3 md:gap-4 text-sm text-muted-foreground mb-6 pb-6 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">By {blog.author}</span>
              </div>
              <span className="hidden sm:inline">•</span>
              <time dateTime={blog.createdAt} className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {format(new Date(blog.createdAt), 'MMMM dd, yyyy')}
              </time>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {blog.views} views
              </span>
            </div>

            {blog.image && (
              <div className="relative w-full h-64 md:h-[400px] lg:h-[500px] rounded-xl overflow-hidden mb-8 shadow-lg border border-border">
                <Image
                  src={blog.image}
                  alt={blog.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}
          </header>

          <div 
            className="prose prose-lg dark:prose-invert max-w-none mb-12 prose-headings:font-bold prose-headings:text-foreground prose-p:text-foreground/90 prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-blockquote:border-l-primary prose-blockquote:border-l-4 prose-blockquote:pl-4 prose-blockquote:italic prose-img:rounded-lg prose-img:shadow-md blog-content"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          <BlogClient blog={blog} shareUrl={shareUrl} />
        </div>
      </article>
    </div>
  );
}
