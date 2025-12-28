import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const replies = await prisma.post.findMany({
      where: { parentId: id },
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

    const formattedReplies = replies.map(reply => ({
      id: reply.id,
      text: reply.content,
      name: reply.author.username,
      timestamp: {
        seconds: Math.floor(reply.createdAt.getTime() / 1000),
        nanoseconds: (reply.createdAt.getTime() % 1000) * 1000000,
      },
      userImg: `https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.author.username}`,
      username: reply.author.username,
      likes: reply.likes.length,
    }));

    return NextResponse.json({ replies: formattedReplies });
  } catch (error) {
    console.error('Error fetching replies:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content } = await request.json();

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
          username: session.user.email.split('@')[0],
        }
      });
    }

    // Create reply
    const reply = await prisma.post.create({
      data: {
        content: content.trim(),
        authorId: user.id,
        parentId: id,
      },
      include: {
        author: true,
      }
    });

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Error creating reply:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
