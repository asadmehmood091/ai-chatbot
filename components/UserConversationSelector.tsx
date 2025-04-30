"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon, CheckCircleFillIcon } from "./icons";
import { cn } from "@/lib/utils";
import type { User, Conversation, FailedMessage } from "@/lib/types";

/*───────────────────────────
  Props
───────────────────────────*/
interface Props {
  onSelectUser: (userId: string) => void;
  onSelectConversation: (conversationId: string) => void;
  onFailedPartsLoaded?: (failed: FailedMessage[]) => void;
  className?: string;
}

/*───────────────────────────
  Component
───────────────────────────*/
export function UserConversationSelector({
  onSelectUser,
  onSelectConversation,
  onFailedPartsLoaded,
  className,
}: Props) {
  /* State */
  const [users, setUsers] = useState<User[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [failedParts, setFailedParts] = useState<FailedMessage[]>([]);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);

  const selectedUser = users.find((u) => u.id === selectedUserId) ?? null;
  const selectedConversation =
    conversations.find((c) => c.id === selectedConversationId) ?? null;

  /* Fetch all users once */
  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then(setUsers)
      .catch((e) => console.error("Failed to fetch users", e));
  }, []);

  /* Fetch conversations when a user is chosen */
  useEffect(() => {
    if (!selectedUserId) return;

    fetch(`/api/users/${selectedUserId}/conversations`)
      .then((r) => r.json())
      .then(setConversations)
      .catch((e) => console.error("Failed to fetch conversations", e));
  }, [selectedUserId]);

  /* Fetch failed messages when a conversation is chosen */
  useEffect(() => {
    if (!selectedConversationId) {
      setFailedParts([]);
      return;
    }

    fetch(
      `/api/messages?conversationId=${encodeURIComponent(
        selectedConversationId
      )}`
    )
      .then((r) => r.json())
      .then((data: FailedMessage[]) => {
        setFailedParts(data);
        onFailedPartsLoaded?.(data);
      })
      .catch((e) => console.error("Failed to fetch failed parts", e));
  }, [selectedConversationId, onFailedPartsLoaded]);

  /* Helper – chat-style bubble */
  const renderFailedSummary = (m: FailedMessage) => {
    const isUser = m.role === "user";

    return (
      <div
        key={m.id}
        className={cn("flex", isUser ? "justify-end" : "justify-start")}
      >
        <div
          className={cn(
            "max-w-[80%] rounded-lg p-3 text-sm shadow-md dark:shadow-none",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground dark:bg-neutral-800"
          )}
        >
          <p className="whitespace-pre-wrap break-words">{m.message}</p>
          <p className="mt-1 text-[10px] text-right opacity-60">
            {new Date(m.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
    );
  };

  /* UI */
  return (
    <div className={cn("space-y-4", className)}>
      {/* USER DROPDOWN */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Select User:</label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              {selectedUser?.email || "Choose a user"}
              <ChevronDownIcon />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="max-h-60 w-full overflow-y-auto">
            {users.map((u) => (
              <DropdownMenuItem
                key={u.id}
                onSelect={() => {
                  setSelectedUserId(u.id);
                  setSelectedConversationId(null);
                  setFailedParts([]);
                  setConversations([]);
                  onSelectUser(u.id);
                }}
              >
                {u.email}
                {selectedUserId === u.id && <CheckCircleFillIcon />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* CONVERSATION DROPDOWN */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Select Conversation:</label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between"
              disabled={!selectedUserId}
            >
              {selectedConversation?.title || "Choose a conversation"}
              <ChevronDownIcon />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="max-h-60 w-full overflow-y-auto">
            {conversations.map((c) => (
              <DropdownMenuItem
                key={c.id}
                onSelect={() => {
                  setSelectedConversationId(c.id);
                  onSelectConversation(c.id);
                }}
              >
                {c.title}
                {selectedConversationId === c.id && <CheckCircleFillIcon />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* FAILED PARTS LIST */}
      {selectedConversationId && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">
            Failed messages ({failedParts.length})
          </h3>

          {failedParts.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No failures in this conversation&nbsp;🎉
            </p>
          ) : (
            failedParts.map(renderFailedSummary)
          )}
        </div>
      )}
    </div>
  );
}
