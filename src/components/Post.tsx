import Link from "next/link";
import { HiDotsHorizontal } from "react-icons/hi";
import Icons from "./Icons";
import Image from "next/image";

export interface PostProps {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    email: string;
  };
  timestamp: string;
  likes?: number;
  replies?: number;
}
export default function Post({ post }: { post: PostProps }) {
  return (
    <div className="flex p-3 border-b border-gray-200 hover:bg-gray-50">
      <img
        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.username}`}
        alt={`${post.author.username} avatar`}
        className="h-11 w-11 rounded-full mr-4"
      />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 whitespace-nowrap">
            <h4 className="font-bold text-sm truncate">{post.author.username}</h4>
            <span className="text-xs truncate text-gray-500">
              @{post.author.username}
            </span>
          </div>
          <HiDotsHorizontal className="text-sm" />
        </div>
        <Link href={`/posts/${post.id}`}>
          <p className="text-sm text-gray-800 my-3">{post.content}</p>
        </Link>
        <Icons id={post.id} authorId={post.author.id} />
      </div>
    </div>
  );
}
