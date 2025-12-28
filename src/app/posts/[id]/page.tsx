import Comments from "@/components/Comments";
import Post, { PostProps } from "@/components/Post";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { HiArrowLeft } from "react-icons/hi";

export default async function PostPage({
  params,
}: {
  params: { id: string };
}) {
  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: {
      author: true,
      likes: true,
      replies: {
        include: {
          author: true,
          likes: true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      },
    },
  });

  if (!post) {
    return (
      <div className="max-w-xl mx-auto border-r border-l min-h-screen">
        <div className="flex items-center space-x-2 py-2 px-3 sticky top-0 z-50 bg-white border-b border-gray-200">
          <Link href={"/"} className="hover:bg-gray-100 rounded-full p-2">
            <HiArrowLeft className="h-5 w-5 " />
          </Link>
          <h2 className="sm:text-lg">Back</h2>
        </div>
        <div className="p-4">
          <p>Post not found</p>
        </div>
      </div>
    );
  }

  const data: PostProps = {
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
  };

  return (
    <div className="max-w-xl mx-auto border-r border-l min-h-screen">
      <div className="flex items-center space-x-2 py-2 px-3 sticky top-0 z-50 bg-white border-b border-gray-200">
        <Link href={"/"} className="hover:bg-gray-100 rounded-full p-2">
          <HiArrowLeft className="h-5 w-5 " />
        </Link>
        <h2 className="sm:text-lg">Back</h2>
      </div>
      <Post post={data} />
      <Comments id={params.id} />
    </div>
  );
}
