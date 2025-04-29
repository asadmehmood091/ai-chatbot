"use client";

import type { UIMessage } from "ai";
import { PreviewMessage, ThinkingMessage } from "./message";
import { useScrollToBottom } from "./use-scroll-to-bottom";
import { Greeting } from "./greeting";
import { memo } from "react";
import type { Vote } from "@/lib/db/schema";
import equal from "fast-deep-equal";
import type { UseChatHelpers } from "@ai-sdk/react";
import { ChatViewer } from "./ChatViewer";

interface MessagesProps {
  chatId: string | null;
  status: UseChatHelpers["status"];
  votes: Array<Vote> | undefined;
  messages: Array<UIMessage>;
  setMessages: UseChatHelpers["setMessages"];
  reload: UseChatHelpers["reload"];
  isReadonly: boolean;
  isArtifactVisible: boolean;
  selectedUserId: string | null;
  selectedConversationId: string | null;
}

function PureMessages({
  chatId,
  status,
  votes,
  messages,
  setMessages,
  reload,
  isReadonly,
  selectedUserId,
  selectedConversationId,
}: MessagesProps) {
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  const hasUser = !!selectedUserId;
  const hasConversation = !!selectedConversationId;

  return (
    <div
      ref={messagesContainerRef}
      className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4"
    >
      {/* 👉 2. Show ChatViewer based on selected user or conversation */}
      {hasUser && !hasConversation && <ChatViewer userId={selectedUserId!} />}
      {hasUser && hasConversation && (
        <ChatViewer chatId={selectedConversationId!} />
      )}
      {!hasUser && messages.length > 0 && (
        <>
          {messages.map((message, index) => (
            <PreviewMessage
              key={message.id}
              chatId={chatId ?? ""}
              message={message}
              isLoading={
                status === "streaming" && messages.length - 1 === index
              }
              vote={votes?.find((vote) => vote.messageId === message.id)}
              setMessages={setMessages}
              reload={reload}
              isReadonly={isReadonly}
            />
          ))}

          {status === "submitted" &&
            messages.length > 0 &&
            messages[messages.length - 1].role === "user" && (
              <ThinkingMessage />
            )}
        </>
      )}

      <div
        ref={messagesEndRef}
        className="shrink-0 min-w-[24px] min-h-[24px]"
      />
    </div>
  );
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  return (
    prevProps.isArtifactVisible === nextProps.isArtifactVisible &&
    prevProps.status === nextProps.status &&
    prevProps.messages.length === nextProps.messages.length &&
    equal(prevProps.messages, nextProps.messages) &&
    equal(prevProps.votes, nextProps.votes) &&
    prevProps.selectedUserId === nextProps.selectedUserId &&
    prevProps.selectedConversationId === nextProps.selectedConversationId
  );
});
