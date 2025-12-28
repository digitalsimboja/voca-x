import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    const postId = id;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if like already exists
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: postId,
        }
      }
    });

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: {
          userId_postId: {
            userId: user.id,
            postId: postId,
          }
        }
      });
      return NextResponse.json({ action: 'unliked' });
    } else {
      // Like
      await prisma.like.create({
        data: {
          userId: user.id,
          postId: postId,
        }
      });
      return NextResponse.json({ action: 'liked' });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const likes = await prisma.like.count({
      where: { postId: id }
    });

    return NextResponse.json({ likes });
  } catch (error) {
    console.error('Error fetching likes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
