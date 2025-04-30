// components/chat-select.tsx
"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import type { Chat } from "@/lib/db/schema";

interface Props {
  chats: Chat[];
  activeChatId?: string;
  onPicked?: () => void;
}

export function ChatSelect({ chats, activeChatId, onPicked }: Props) {
  const router = useRouter();

  return (
    <Select
      value={activeChatId ?? undefined}
      onValueChange={(id) => {
        router.push(`/chat/${id}`);
        router.refresh();
        onPicked?.();
      }}
    >
      <SelectTrigger className="w-full h-8 mb-2">
        <SelectValue placeholder="Choose a chat…" />
      </SelectTrigger>

      <SelectContent>
        {chats.map((chat) => (
          <SelectItem key={chat.id} value={chat.id}>
            {chat.title || format(new Date(chat.createdAt), "PP p")}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
