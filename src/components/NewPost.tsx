"use client";

import { useSession } from "next-auth/react";
import { ChangeEvent, useRef, useState, useEffect } from "react";
import { HiOutlinePhotograph } from "react-icons/hi";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

const NewPost: React.FC = () => {
  const { data: session } = useSession();
  const [imageFileUrl, setImageFileUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  const imagePickRef = useRef<HTMLInputElement>(null);

  const addImageToPost = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImageFileUrl(URL.createObjectURL(file));
    }
  };

  const uploadImageToStorage = async () => {
    if (!selectedFile) {
      console.error("No file selected for upload.");
      return;
    }

    if (!supabase) {
      console.warn("Supabase not configured - skipping image upload");
      setImageFileUrl(URL.createObjectURL(selectedFile));
      setUploading(false);
      return;
    }

    setUploading(true);
    const fileName = new Date().getTime() + "-" + selectedFile.name;

    try {
      const { data, error } = await supabase.storage
        .from('images')
        .upload(fileName, selectedFile);

      if (error) {
        console.error("Upload failed", error);
        setUploading(false);
        setImageFileUrl(null);
        setSelectedFile(null);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);

      setImageFileUrl(publicUrl);
      setUploading(false);
    } catch (error) {
      console.error("Upload failed", error);
      setUploading(false);
      setImageFileUrl(null);
      setSelectedFile(null);
    }
  };

  const handlePostSubmit = async () => {
    setPosting(true);

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: text,
          imageUrl: imageFileUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      setText("");
      setImageFileUrl(null);
      setSelectedFile(null);
      location.reload(); // Temporary - should use state management instead
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setPosting(false);
    }
  };

  useEffect(() => {
    if (selectedFile) {
      uploadImageToStorage();
    }
  }, [selectedFile]);

  if (!session) return null;

  return (
    <div className="flex border-b border-gray-200 p-3 space-x-3 w-full">
      <img
        src={session.user.image as string}
        alt="user profile image"
        className="h-11 w-11 rounded-full cursor-pointer hover:brightness-95"
      />
      <div className="w-full divide-y divide-gray-200">
        <textarea
          className="w-full border-none outline-none tracking-wide min-h-[50px]"
          placeholder="What's happening?"
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
        ></textarea>
        {selectedFile && (
          <img
            src={imageFileUrl as string}
            alt="Selected image"
            className={`w-full max-h-[250px] object-cover cursor-pointer ${
              uploading ? "animate-pulse" : ""
            }`}
          />
        )}
        <div className="flex justify-between items-center pt-2.5">
          <HiOutlinePhotograph
            onClick={() => imagePickRef.current?.click()}
            className="h-10 w-10 p-2 text-sky-500 hover:bg-sky-100 rounded-full cursor-pointer"
          />
          <input
            type="file"
            ref={imagePickRef}
            accept="image/*"
            hidden
            onChange={addImageToPost}
          />
          <button
            onClick={handlePostSubmit}
            className="bg-blue-400 text-white px-4 py-1.5 rounded-full font-bold shadow-md hover:brightness-95 disabled:opacity-50"
            disabled={uploading || text.trim() === "" || posting}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewPost;
