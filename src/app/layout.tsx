import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import NewsFeed from "@/components/News";
import SessionWrapper from "@/components/SessionWrapper";
import CommentModal from "@/components/CommentModal";

export const metadata: Metadata = {
  title: "Evvecast | Community-Driven Decentralized Social App for the Metaverse",
  description:
    "A platform for community-driven social interaction for the Metaverse",
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionWrapper>
      <html lang="en">
        <body className="font-sans">
          <div className="flex justify-between max-w-6xl mx-auto">
            <div className="hidden sm:inline border-r h-screen sticky top-0">
              <Sidebar />
            </div>
            <div className="max-w-2xl flex-1">{children}</div>
            <div className="lg:flex-col p-3 h-screen border-l hidden lg:flex w-[24rem]">
              <div className="sticky top-0 bg-white py-2">
                <input
                  type="text"
                  placeholder="Search"
                  className="bg-gray-100 border border-gray-200 rounded-3xl text-sm w-full px-4 py-2"
                />
              </div>
              <NewsFeed />
            </div>
          </div>
          <CommentModal />
        </body>
      </html>
    </SessionWrapper>
  );
}
