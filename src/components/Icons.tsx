"use client";

import { modalState, postIdState } from "@/atom/modalAtom";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  HiHeart,
  HiOutlineChat,
  HiOutlineHeart,
  HiOutlineTrash,
} from "react-icons/hi";
import { useRecoilState } from "recoil";

export default function Icons({ id, authorId }: { id: string; authorId: string }) {
  const { data: session } = useSession();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [open, setOpen] = useRecoilState(modalState);
  const [postId, setPostId] = useRecoilState(postIdState);
  const [commentsCount, setCommentsCount] = useState(0);

  const likePost = async () => {
    if (!session) {
      signIn();
      return;
    }

    try {
      const response = await fetch(`/api/posts/${id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setIsLiked(result.action === 'liked');
        // Update likes count
        const likesResponse = await fetch(`/api/posts/${id}/like`);
        if (likesResponse.ok) {
          const likesData = await likesResponse.json();
          setLikesCount(likesData.likes);
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const deletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post")) return;

    // For now, we'll allow deletion - in a real app, you'd check user permissions
    // if (!session?.user?.email) {
    //   alert("You are not authorized to delete this post");
    //   return;
    // }

    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        window.location.reload();
      } else {
        alert("Failed to delete post");
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  useEffect(() => {
    // Fetch initial likes count
    fetch(`/api/posts/${id}/like`)
      .then(res => res.json())
      .then(data => setLikesCount(data.likes))
      .catch(console.error);
  }, [id]);

  return (
    <div className="flex justify-start gap-5 p-2 text-gray-500">
      <div className="flex items-center">
        <HiOutlineChat
          onClick={() => {
            if (!session) {
              signIn();
            } else {
              setOpen(!open);
              setPostId(id);
            }
          }}
          className="w-8 h-8 cursor-pointer rounded-full transition duration-500 ease-in-out p-2 hover:text-sky-500 hover:bg-sky-100"
        />
        {commentsCount > 0 && (
          <span className="text-xs">{commentsCount}</span>
        )}
      </div>
      <div className="flex items-center">
        {isLiked ? (
          <HiHeart
            onClick={likePost}
            className="w-8 h-8 cursor-pointer rounded-full transition duration-500 ease-in-out p-2 text-red-600 hover:text-red-500 hover:bg-red-100"
          />
        ) : (
          <HiOutlineHeart
            onClick={likePost}
            className="w-8 h-8 cursor-pointer rounded-full transition duration-500 ease-in-out p-2 hover:text-red-500 hover:bg-red-100"
          />
        )}
        {likesCount > 0 && (
          <span className={`${isLiked && "text-red-600"} text-xs`}>
            {likesCount}
          </span>
        )}
      </div>
      {session?.user?.email && (
        <HiOutlineTrash
          onClick={deletePost}
          className="w-8 h-8 cursor-pointer rounded-full transition duration-500 ease-in-out p-2 hover:text-red-500 hover:bg-red-100"
        />
      )}
    </div>
  );
}
