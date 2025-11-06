import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session.user?.name || session.user?.email}!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Home Section</CardTitle>
            <CardDescription>Manage your profile image, name, title, and description</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/home">
              <Button className="w-full">
                Manage Home <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About Section</CardTitle>
            <CardDescription>Edit about section, languages, interests, and location</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/about">
              <Button className="w-full">
                Manage About <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
            <CardDescription>Add, edit, or delete skills</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/skills">
              <Button className="w-full">
                Manage Skills <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
            <CardDescription>Manage GitHub projects and approve/reject them</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/projects">
              <Button className="w-full">
                Manage Projects <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Experience</CardTitle>
            <CardDescription>Add, edit, or delete work experience entries</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/experience">
              <Button className="w-full">
                Manage Experience <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Education</CardTitle>
            <CardDescription>Manage education entries and upload certificates</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/education">
              <Button className="w-full">
                Manage Education <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Blogs</CardTitle>
            <CardDescription>Create, edit, or delete blog posts</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/blogs">
              <Button className="w-full">
                Manage Blogs <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
