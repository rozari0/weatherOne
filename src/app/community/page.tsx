"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/retroui/Button";

interface CommunityPost {
  _id: string;
  name: string;
  content: string;
  createdAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch posts
  const fetchPosts = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/community?page=${page}&limit=10`);
      const data = await response.json();
      
      if (response.ok) {
        setPosts(data.posts);
        setPagination(data.pagination);
      } else {
        setError(data.error || 'Failed to fetch posts');
      }
    } catch (err) {
      setError('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  // Submit new post
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch('/api/community', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || undefined,
          content: content.trim()
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Post submitted successfully!');
        setName('');
        setEmail('');
        setContent('');
        // Refresh posts
        fetchPosts(1);
      } else {
        setError(data.error || 'Failed to submit post');
      }
    } catch (err) {
      setError('Failed to submit post');
    } finally {
      setSubmitting(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Load posts on component mount
  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center gap-8 p-6">
      <div className="w-full max-w-2xl flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold font-sans tracking-tight">
            Community Posts
          </h1>
          <p className="text-sm text-muted-foreground max-w-prose">
            Share your thoughts, experiences, and connect with the weather community. 
            All posts are automatically moderated using AI to ensure a safe and friendly environment.
          </p>
        </header>

        {/* Post Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-lg border-2 border-black p-4 shadow-md bg-card"
        >
          <h2 className="text-lg font-semibold">Create a New Post</h2>
          
          <div className="flex flex-col gap-1">
            <label className="text-xs font-mono uppercase tracking-wide">
              Name *
            </label>
            <input
              className="rounded-md border-2 border-black px-3 py-2 font-mono text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-mono uppercase tracking-wide">
              Email (optional)
            </label>
            <input
              type="email"
              className="rounded-md border-2 border-black px-3 py-2 font-mono text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <span className="text-[10px] text-muted-foreground font-mono">
              Email is optional and will not be displayed publicly
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-mono uppercase tracking-wide">
              Your Post *
            </label>
            <textarea
              className="rounded-md border-2 border-black px-3 py-2 font-mono text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-y min-h-32"
              placeholder="Share your thoughts about weather, climate, or anything related to our community..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              maxLength={2000}
            />
            <span className="text-[10px] text-muted-foreground font-mono self-end">
              {content.length}/2000
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Post Message"}
            </Button>
          </div>

          {error && (
            <p className="text-destructive text-sm font-mono border-2 border-destructive bg-destructive/10 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          {success && (
            <p className="text-primary-foreground text-sm font-mono border-2 border-primary bg-primary rounded-md px-3 py-2">
              {success}
            </p>
          )}

          <div className="text-xs text-muted-foreground font-mono bg-muted/20 border border-muted rounded-md px-3 py-2">
            <strong>🤖 AI Moderation:</strong> Your post will be automatically reviewed for spam, inappropriate content, and community guidelines compliance using Google Gemini AI before being published.
          </div>
        </form>

        {/* Posts List */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Community Posts</h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground font-mono">Loading posts...</div>
            </div>
          ) : posts.length === 0 ? (
            <div className="flex items-center justify-center py-8 border-2 border-black rounded-lg bg-muted/10">
              <div className="text-muted-foreground font-mono">No posts yet. Be the first to share!</div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {posts.map((post) => (
                <div
                  key={post._id}
                  className="rounded-lg border-2 border-black p-4 shadow bg-card"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="font-semibold text-sm">{post.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {formatDate(post.createdAt)}
                    </div>
                  </div>
                  <div className="text-sm whitespace-pre-wrap leading-relaxed">
                    {post.content}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchPosts(pagination.page - 1)}
                disabled={pagination.page <= 1 || loading}
              >
                Previous
              </Button>
              
              <span className="text-sm font-mono px-3">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchPosts(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || loading}
              >
                Next
              </Button>
            </div>
          )}

          {pagination.total > 0 && (
            <div className="text-center text-xs text-muted-foreground font-mono mt-2">
              {pagination.total} total posts
            </div>
          )}
        </div>
      </div>
    </div>
  );
}