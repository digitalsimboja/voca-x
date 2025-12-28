import { prisma } from "@/lib/prisma";
import Post, { PostProps } from "./Post";

export default async function Feed() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: true,
        likes: true,
        replies: {
          include: {
            author: true,
            likes: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const data: PostProps[] = posts.map((post) => ({
      id: post.id,
      content: post.content,
      author: {
        id: post.author.id,
        username: post.author.username,
        email: post.author.email,
      },
      timestamp: post.createdAt.toISOString(),
      likes: post.likes.length,
      replies: post.replies.length,
    }));

    if (data.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No posts yet. Be the first to share something!</p>
        </div>
      );
    }

    return (
      <div>
        {data.map((post: any) => (
          <Post key={post.id} post={post} />
        ))}
      </div>
    );
  } catch (error) {
    console.error('Error fetching posts:', error);
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Unable to load posts. Please try again later.</p>
      </div>
    );
  }
}
