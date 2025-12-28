import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, imageUrl } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          username: session.user.email.split('@')[0], // Simple username generation
        }
      });
    }

    // Create post
    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        authorId: user.id,
        // imageUrl can be added later if needed
      },
      include: {
        author: true,
      }
    });

    console.log('Post created:', post);

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: true,
        likes: true,
        replies: {
          include: {
            author: true,
          }
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
