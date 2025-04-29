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

type User = { id: string; email: string };
type Conversation = { id: string; title: string };

export function UserConversationSelector({
  onSelectUser,
  onSelectConversation,
  className,
}: {
  onSelectUser: (userId: string) => void;
  onSelectConversation: (conversationId: string) => void;
  className?: string;
}) {
  const [users, setUsers] = useState<User[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);

  const selectedUser = users.find((u) => u.id === selectedUserId);
  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId
  );

  // Fetch users on mount
  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("Failed to fetch users", err));
  }, []);

  // Fetch conversations when user changes
  useEffect(() => {
    if (!selectedUserId) return;

    fetch(`/api/users/${selectedUserId}/conversations`)
      .then((res) => res.json())
      .then((data) => setConversations(data))
      .catch((err) => console.error("Failed to fetch conversations", err));
  }, [selectedUserId]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* User Dropdown */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Select User:</label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              {selectedUser?.email || "Choose a user"}
              <ChevronDownIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
            {users.map((user) => (
              <DropdownMenuItem
                key={user.id}
                onSelect={() => {
                  setSelectedUserId(user.id);
                  setSelectedConversationId(null);
                  onSelectUser(user.id);
                }}
              >
                {user.email}
                {selectedUserId === user.id && <CheckCircleFillIcon />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Conversation Dropdown */}
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
          <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
            {conversations.map((conv) => (
              <DropdownMenuItem
                key={conv.id}
                onSelect={() => {
                  setSelectedConversationId(conv.id);
                  onSelectConversation(conv.id);
                }}
              >
                {conv.title}
                {selectedConversationId === conv.id && <CheckCircleFillIcon />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
