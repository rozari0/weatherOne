import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { moderateContentWithGemini, moderateEmail, moderateName } from '@/lib/gemini-moderation';

export interface CommunityPost {
  _id?: ObjectId;
  name: string;
  email?: string;
  content: string;
  createdAt: Date;
  approved: boolean;
  moderationResult?: {
    contentMod: {
      isAllowed: boolean;
      reason?: string;
      confidence: number;
    };
    emailMod: {
      isAllowed: boolean;
      reason?: string;
      confidence: number;
    };
    nameMod: {
      isAllowed: boolean;
      reason?: string;
      confidence: number;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, content } = body;

    // Validate required fields
    if (!name || !content) {
      return NextResponse.json(
        { error: 'Name and content are required' },
        { status: 400 }
      );
    }

    // Moderate content
    const nameMod = moderateName(name);
    const emailMod = moderateEmail(email || '');
    const contentMod = await moderateContentWithGemini(content);

    // Check if any moderation failed
    if (!nameMod.isAllowed) {
      return NextResponse.json(
        { error: `Name validation failed: ${nameMod.reason}` },
        { status: 400 }
      );
    }

    if (!emailMod.isAllowed) {
      return NextResponse.json(
        { error: `Email validation failed: ${emailMod.reason}` },
        { status: 400 }
      );
    }

    if (!contentMod.isAllowed) {
      return NextResponse.json(
        { error: `Content validation failed: ${contentMod.reason}` },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('weatherone');
    const collection = db.collection('community_posts');

    // Create the post
    const post: CommunityPost = {
      name: name.trim(),
      email: email?.trim() || undefined,
      content: content.trim(),
      createdAt: new Date(),
      approved: true, // Since it passed moderation
      moderationResult: {
        contentMod,
        emailMod,
        nameMod
      }
    };

    // Insert the post
    const result = await collection.insertOne(post);

    return NextResponse.json(
      { 
        success: true, 
        postId: result.insertedId,
        message: 'Post created successfully'
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const client = await clientPromise;
    const db = client.db("weatherone");
    const collection = db.collection('community_posts');

    // Get posts (only approved ones)
    const posts = await collection
      .find({ approved: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Get total count for pagination
    const total = await collection.countDocuments({ approved: true });

    // Remove email from response for privacy
    const sanitizedPosts = posts.map(post => ({
      _id: post._id,
      name: post.name,
      content: post.content,
      createdAt: post.createdAt
    }));

    return NextResponse.json({
      posts: sanitizedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}