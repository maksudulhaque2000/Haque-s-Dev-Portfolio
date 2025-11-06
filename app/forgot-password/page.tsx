'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSent(true);
        
        // Show reset link if email wasn't sent or in development
        if (data.development && data.resetUrl) {
          console.log('🔗 Reset URL:', data.resetUrl);
          
          if (!data.emailSent) {
            toast.warning(
              'Email service not configured. Check console/terminal for reset link.',
              { duration: 8000 }
            );
            // Also show in a more visible way
            setTimeout(() => {
              toast.info(
                <div>
                  <p className="font-semibold mb-2">Reset Link (Copy this):</p>
                  <p className="text-xs break-all bg-muted p-2 rounded">{data.resetUrl}</p>
                </div>,
                { duration: 30000 }
              );
            }, 1000);
          } else {
            toast.success('Password reset link sent to your email!');
            toast.info(
              <div>
                <p className="font-semibold mb-2">Reset Link (also check console):</p>
                <p className="text-xs break-all bg-muted p-2 rounded">{data.resetUrl}</p>
              </div>,
              { duration: 20000 }
            );
          }
        } else {
          toast.success('Password reset link sent to your email!');
        }
      } else {
        toast.error(data.error || 'Failed to send reset link');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Forgot Password</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a link to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!sent ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Check your email ({email}) for password reset instructions.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSent(false);
                    setEmail('');
                  }}
                  className="w-full"
                >
                  Send another email
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
