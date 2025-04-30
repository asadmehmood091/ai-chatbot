// components/sidebar-history.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { User } from "next-auth";
import useSWRInfinite from "swr/infinite";
import { toast } from "sonner";

import {
  SidebarGroup,
  SidebarGroupContent,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LoaderIcon } from "@/components/icons";
import { fetcher } from "@/lib/utils";

import { UserSelect } from "./user-select";
import { ChatSelect } from "./chat-select";
import type { Chat } from "@/lib/db/schema";

/* ------------------------------------------------------------------ */
/*  Types & constants                                                 */
/* ------------------------------------------------------------------ */

export interface ChatHistory {
  chats: Chat[];
  hasMore: boolean;
}

const PAGE_SIZE = 50; // we can load more at once now

/* ------------------------------------------------------------------ */
/*  **Legacy helper** – other files (components/chat.tsx) import this */
/* ------------------------------------------------------------------ */
export function getChatHistoryPaginationKey(
  pageIndex: number,
  previousPageData: ChatHistory | null
) {
  if (previousPageData && previousPageData.hasMore === false) return null;

  if (pageIndex === 0) return `/api/history?limit=${PAGE_SIZE}`;

  const last = previousPageData?.chats.at(-1);
  if (!last) return null;

  return `/api/history?ending_before=${last.id}&limit=${PAGE_SIZE}`;
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export function SidebarHistory({ user }: { user: User | undefined }) {
  const router = useRouter();
  const { id: activeChatId } = useParams();
  const { setOpenMobile } = useSidebar();

  /* — Which user's history are we viewing? — */
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(
    user?.id
  );

  /* — SWR key that includes userId — */
  const getKey = (pageIndex: number, prev: ChatHistory | null) => {
    if (prev && prev.hasMore === false) return null;

    const cursor =
      pageIndex === 0
        ? ""
        : prev?.chats.at(-1)
        ? `&ending_before=${prev.chats.at(-1)!.id}`
        : "";

    return `/api/history?limit=${PAGE_SIZE}&userId=${selectedUserId}${cursor}`;
  };

  const {
    data: pages = [],
    isLoading,
    setSize,
    isValidating,
    mutate,
  } = useSWRInfinite<ChatHistory>(getKey, fetcher, { fallbackData: [] });

  /* — reset paging when switching users — */
  useEffect(() => {
    setSize(1);
  }, [selectedUserId, setSize]);

  /* — delete-chat dialog state — */
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    const p = fetch(`/api/chat?id=${deleteId}`, { method: "DELETE" });

    toast.promise(p, {
      loading: "Deleting chat…",
      success: () => {
        mutate((hist) =>
          hist?.map((page) => ({
            ...page,
            chats: page.chats.filter((c) => c.id !== deleteId),
          }))
        );
        return "Chat deleted";
      },
      error: "Failed to delete chat",
    });

    setShowDeleteDialog(false);
    if (deleteId === activeChatId) router.push("/");
  };

  /* — early exits — */
  if (!user) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <div className="px-2 text-zinc-500 w-full flex justify-center text-sm">
            Log in to save and revisit previous chats!
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (isLoading) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <div className="p-2 text-zinc-500 flex gap-2 items-center">
            <div className="animate-spin">
              <LoaderIcon />
            </div>
            <span>Loading chats…</span>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  const chats = pages.flatMap((p) => p.chats);
  const reachedEnd = pages.some((p) => p.hasMore === false);

  return (
    <>
      <SidebarGroup>
        <SidebarGroupContent>
          {/* 1️⃣  pick a user */}
          <UserSelect value={selectedUserId} onChange={setSelectedUserId} />

          {/* 2️⃣  pick a chat */}
          <ChatSelect
            chats={chats}
            activeChatId={activeChatId as string | undefined}
            onPicked={() => setOpenMobile(false)}
          />

          {/* sentinel that loads more pages once (immediately visible) */}
          <motion.div
            onViewportEnter={() => {
              if (!isValidating && !reachedEnd) setSize((s) => s + 1);
            }}
          />
          {!reachedEnd && (
            <div className="p-2 text-zinc-500 flex gap-2 items-center">
              <div className="animate-spin">
                <LoaderIcon />
              </div>
              <span>Loading more…</span>
            </div>
          )}
        </SidebarGroupContent>
      </SidebarGroup>

      {/* delete dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The chat will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
