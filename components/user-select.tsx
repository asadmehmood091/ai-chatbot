// components/user-select.tsx
"use client";

import type { User } from "next-auth";
import useSWR from "swr";
import { fetcher } from "@/lib/utils";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type Props = {
  value: string | undefined;
  onChange: (v: string) => void;
};

/**
 * A tiny drop-down that lists every user returned by `/api/users`.
 * When you pick one, it calls `onChange` with that user’s id.
 */
export function UserSelect({ value, onChange }: Props) {
  const {
    data: users = [],
    isLoading,
    error,
  } = useSWR<User[]>("/api/users", fetcher);

  if (isLoading || error) return null; // keep it silent on first paint

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full h-8 mb-2">
        <SelectValue placeholder="Choose a user…" />
      </SelectTrigger>

      <SelectContent>
        {users.map((u) => (
          //@ts-ignore
          <SelectItem key={u.id} value={u.id}>
            {u.email}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
