"use client";

import { HiDotsHorizontal, HiHeart, HiOutlineHeart } from "react-icons/hi";
import { CommentProps } from "./Comments";
import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";

export default function Comment({
  comment,
  postId,
}: {
  comment: CommentProps;
  postId: string;
}) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(comment.likes || 0);
  const { data: session } = useSession();

  const likeComment = async () => {
    if (!session) {
      signIn();
      return;
    }

    try {
      const response = await fetch(`/api/posts/${comment.id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setIsLiked(result.action === 'liked');
        // Update likes count
        const likesResponse = await fetch(`/api/posts/${comment.id}/like`);
        if (likesResponse.ok) {
          const likesData = await likesResponse.json();
          setLikesCount(likesData.likes);
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  return (
    <div className="flex p-3 border-b border-gray-200 hover:bg-gray-50 pl-10">
      <img
        src={comment.userImg}
        alt={`${comment.username} image`}
        className="h-9 w-9 rounded-full mr-4"
      />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 whitespace-nowrap">
            <h4 className="font-bold text-sm truncate">{comment.name}</h4>
            <span className="text-xs truncate text-gray-500">
              @{comment.username}
            </span>
          </div>
          <HiDotsHorizontal className="text-sm" />
        </div>

        <p className="text-xs text-gray-800 my-3 truncate">{comment.text}</p>
        <div className="flex items-center">
          {isLiked ? (
            <HiHeart
              onClick={likeComment}
              className="w-8 h-8 cursor-pointer rounded-full transition duration-500 ease-in-out p-2 text-red-600 hover:text-red-500 hover:bg-red-100"
            />
          ) : (
            <HiOutlineHeart
              onClick={likeComment}
              className="w-8 h-8 cursor-pointer rounded-full transition duration-500 ease-in-out p-2 hover:text-red-500 hover:bg-red-100"
            />
          )}
          {likesCount > 0 && (
            <span className={`${isLiked && "text-red-600"} text-xs`}>
              {likesCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
