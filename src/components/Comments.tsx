"use client";

import { useEffect, useState } from "react";
import Comment from "./Comment";

export interface CommentProps {
  id: string;
  text: string;
  name: string;
  timestamp: {
    seconds: number;
    nanoseconds: number;
  };
  userImg: string;
  username: string;
  likes?: number;
}

export default function Comments({ id }: { id: string }) {
  const [comments, setComments] = useState<CommentProps[]>([]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/posts/${id}/replies`);
        if (response.ok) {
          const data = await response.json();
          setComments(data.replies);
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchComments();

    // Poll for new comments every 5 seconds
    const interval = setInterval(fetchComments, 5000);

    return () => clearInterval(interval);
  }, [id]);

  return (
    <div>
      {comments.map((comment) => (
        <Comment key={comment.id} comment={comment} postId={id} />
      ))}
    </div>
  );
}
