"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type Part = {
  type: "text";
  text: string;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  parts: Part[];
  createdAt: string;
};

type Chat = {
  id: string;
  title: string;
};

interface ChatViewerProps {
  chatId?: string;
  userId?: string;
}

export function ChatViewer({ chatId, userId }: ChatViewerProps) {
  const [messagesByChat, setMessagesByChat] = useState<
    Record<string, { chat: Chat; messages: Message[] }>
  >({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log("🧩 ChatViewer props:", { chatId, userId });

  useEffect(() => {
    async function fetchMessages() {
      if (!chatId && !userId) {
        console.log("No chatId or userId provided, skipping fetch.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        if (chatId) {
          console.log(`Fetching messages for chatId: ${chatId}`);
          const res = await fetch(`/api/chats/${chatId}/messages`);
          if (!res.ok) {
            throw new Error(`Failed to fetch messages: ${res.statusText}`);
          }
          const messages: Message[] = await res.json();
          console.log(`Messages fetched for chatId ${chatId}:`, messages);

          setMessagesByChat({
            [chatId]: { chat: { id: chatId, title: "Conversation" }, messages },
          });
        } else if (userId) {
          console.log(`Fetching conversations for userId: ${userId}`);
          const res = await fetch(`/api/users/${userId}/conversations`);
          if (!res.ok) {
            throw new Error(`Failed to fetch conversations: ${res.statusText}`);
          }
          const chats: Chat[] = await res.json();
          console.log(`Chats fetched for userId ${userId}:`, chats);

          const chatMessages: Record<
            string,
            { chat: Chat; messages: Message[] }
          > = {};

          for (const chat of chats) {
            console.log(`Fetching messages for chatId: ${chat.id}`);
            const res = await fetch(`/api/chats/${chat.id}/messages`);
            if (!res.ok) {
              throw new Error(
                `Failed to fetch messages for chat ${chat.id}: ${res.statusText}`
              );
            }
            const messages: Message[] = await res.json();
            console.log(`Messages for chatId ${chat.id}:`, messages);
            chatMessages[chat.id] = { chat, messages };
          }

          setMessagesByChat(chatMessages);
        }
      } catch (error) {
        console.error("❌ Failed to fetch conversations:", error);
        setError("Failed to load conversations. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchMessages();
  }, [chatId, userId]);

  if (!chatId && !userId) {
    return (
      <p className="text-sm text-muted-foreground">No conversation selected.</p>
    );
  }

  if (loading) {
    return <p>Loading conversations...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-500">{error}</p>;
  }

  if (Object.keys(messagesByChat).length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No conversations available.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(messagesByChat).map(([chatId, { chat, messages }]) => (
        <div
          key={chatId}
          className="border rounded-md p-4 space-y-4 bg-white dark:bg-zinc-900"
        >
          <h2 className="font-bold text-lg">{chat.title}</h2>

          {messages.length === 0 && (
            <p className="text-sm text-muted-foreground">No messages found.</p>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "rounded-lg px-4 py-2 w-fit max-w-[80%]",
                msg.role === "user"
                  ? "bg-black text-white self-end ml-auto"
                  : "bg-zinc-200 dark:bg-zinc-700 text-black dark:text-white"
              )}
            >
              <div className="text-sm whitespace-pre-line">
                {msg.parts
                  .filter((part) => part.type === "text")
                  .map((part, index) => (
                    <p key={index}>{part.text}</p>
                  ))}
              </div>
              <div className="text-xs mt-1 text-right text-muted-foreground">
                {format(new Date(msg.createdAt), "dd/MM/yyyy @ HH:mm:ss")}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
