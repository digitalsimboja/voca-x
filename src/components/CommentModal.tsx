"use client";

import { modalState, postIdState } from "@/atom/modalAtom";
import { useRecoilState } from "recoil";
import Modal from "react-modal";
import { HiX } from "react-icons/hi";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { PostProps } from "./Post";
import { usePathname, useRouter } from "next/navigation";

const CommentModal: React.FC = () => {
  const [open, setOpen] = useRecoilState(modalState);
  const [postId, setPostId] = useRecoilState(postIdState);
  const { data: session } = useSession();
  const [post, setPost] = useState<PostProps | null>(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (postId !== "") {
      const fetchPost = async () => {
        try {
          const response = await fetch(`/api/posts/${postId}`);
          if (response.ok) {
            const data = await response.json();
            setPost({
              id: data.post.id,
              content: data.post.content,
              author: {
                id: data.post.author.id,
                username: data.post.author.username,
                email: data.post.author.email,
              },
              timestamp: data.post.createdAt,
              likes: data.post.likes?.length || 0,
              replies: data.post.replies?.length || 0,
            });
          }
        } catch (error) {
          console.error("Error fetching post:", error);
        }
      };
      fetchPost();
    }
  }, [postId]);

  const handleComment = async () => {
    if (!replyText.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/posts/${postId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: replyText,
        }),
      });

      if (response.ok) {
        setReplyText("");
        setOpen(false);

        // Check if the current route is already the post route
        if (pathname !== `/posts/${postId}`) {
          router.push(`/posts/${postId}`);
        }
      } else {
        console.error("Failed to create reply");
      }
    } catch (error) {
      console.error("Error adding a comment", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {open && (
        <Modal
          isOpen={open}
          onRequestClose={() => setOpen(false)}
          ariaHideApp={false}
          className="max-w-lg w-[90%] absolute top-24 left-[50%] translate-x-[-50%] bg-white border-2 border-gray-200 rounded-xl shadow-md"
        >
          <div className="p-4 ">
            <div className="border-b border-gray-200 py-2 px-1.5">
              <HiX
                onClick={() => setOpen(false)}
                className="text-2xl text-gray-700 p-1 hover:bg-gray-200 rounded-full cursor-pointer"
              />
            </div>
            <div className="p-2 flex items-center space-x-1 relative">
              <span className="w-0.5 h-full z-[-1] absolute left-8 top-11 bg-gray-300"></span>
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post?.author.username}`}
                className="h-11 w-11 rounded-full mr-4"
                alt="user-img"
              />
              <h4 className="font-bold sm:text-[16px] text-[15px] truncate hover:underline">
                {post?.author.username}
              </h4>
              <span className="text-sm sm:text-[15px] truncate">
                @{post?.author.username}
              </span>
            </div>
            <p className="text-gray-500 text-[15px] sm:text-[16px] ml-16 mb-2]">
              {post?.content}
            </p>

            <div className="flex p-3 space-x-3">
              <img
                src={session?.user.image as string}
                alt="user-img"
                className="h-11 w-11 rounded-full cursor-pointer hover:brightness-95"
              />
              <div className="w-full divide-y divide-gray-200">
                <div>
                  <textarea
                    className="w-full border-none outline-none tracking-wide min-h-[50px] text-gray-700 placeholder:text-gray-500"
                    placeholder="Whats happening?"
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  ></textarea>
                </div>
                <div className="flex items-center justify-end pt-2.5">
                  <button
                    onClick={handleComment}
                    disabled={replyText.trim() === "" || loading}
                    className="bg-blue-400 text-white px-4 py-1.5 rounded-full font-bold shadow-md hover:brightness-95 disabled:opacity-50"
                  >
                    {loading ? "Replying..." : "Reply"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
export default CommentModal;
