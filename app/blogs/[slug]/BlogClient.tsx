'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, ThumbsUp, PartyPopper, Facebook, Linkedin } from 'lucide-react';
import { toast } from 'sonner';
import { FacebookShareButton, LinkedinShareButton } from 'react-share';
import { format } from 'date-fns';

interface BlogClientProps {
  blog: any;
  shareUrl: string;
}

export default function BlogClient({ blog, shareUrl }: BlogClientProps) {
  const [reactions, setReactions] = useState(blog.reactions || { like: { count: 0, users: [] }, love: { count: 0, users: [] }, celebrate: { count: 0, users: [] } });
  const [comments, setComments] = useState(blog.comments || []);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userIp, setUserIp] = useState('');

  useEffect(() => {
    // Get user IP for reaction tracking
    fetch('/api/user-ip')
      .then((res) => res.json())
      .then((data) => setUserIp(data.ip || ''))
      .catch(() => {});
  }, []);

  const handleReaction = async (type: 'like' | 'love' | 'celebrate') => {
    try {
      const res = await fetch(`/api/blogs/${blog.slug}/reaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, userIp }),
      });

      const data = await res.json();
      if (res.ok) {
        setReactions(data.reactions);
        toast.success('Reaction added!');
      } else {
        toast.error(data.error || 'Failed to add reaction');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !comment) {
      toast.error('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/blogs/${blog.slug}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, comment }),
      });

      const data = await res.json();
      if (res.ok) {
        setComments(data.comments);
        setName('');
        setEmail('');
        setComment('');
        toast.success('Comment added!');
      } else {
        toast.error(data.error || 'Failed to add comment');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Reactions */}
      <Card>
        <CardHeader>
          <CardTitle>Reactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => handleReaction('like')}
              className="flex items-center gap-2"
            >
              <ThumbsUp className="h-4 w-4" />
              {reactions.like?.count || 0}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleReaction('love')}
              className="flex items-center gap-2"
            >
              <Heart className="h-4 w-4" />
              {reactions.love?.count || 0}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleReaction('celebrate')}
              className="flex items-center gap-2"
            >
              <PartyPopper className="h-4 w-4" />
              {reactions.celebrate?.count || 0}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Social Share */}
      <Card>
        <CardHeader>
          <CardTitle>Share this post</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <FacebookShareButton url={shareUrl} title={blog.title}>
              <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer">
                <Facebook className="h-4 w-4" />
                Facebook
              </div>
            </FacebookShareButton>
            <LinkedinShareButton url={shareUrl} title={blog.title}>
              <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer">
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </div>
            </LinkedinShareButton>
          </div>
        </CardContent>
      </Card>

      {/* Comments */}
      <Card>
        <CardHeader>
          <CardTitle>Comments ({comments.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Comment Form */}
          <form onSubmit={handleComment} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Comment</label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your comment..."
                rows={4}
                required
              />
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </form>

          {/* Comments List */}
          <div className="space-y-4 mt-8">
            {comments.map((comment: any) => (
              <div key={comment.id} className="border-b border-border pb-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold">{comment.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(comment.createdAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                </div>
                <p className="text-foreground/80">{comment.comment}</p>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-muted-foreground text-center py-8">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
