"use client";

import { createContext, useContext, useState } from "react";

interface UserAvatarContextValue {
  avatarUrl: string | null;
  setAvatarUrl: (url: string) => void;
}

const UserAvatarContext = createContext<UserAvatarContextValue>({
  avatarUrl: null,
  setAvatarUrl: () => {},
});

export function UserAvatarProvider({
  children,
  initialUrl,
}: {
  children: React.ReactNode;
  initialUrl: string | null;
}) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialUrl);

  return (
    <UserAvatarContext.Provider value={{ avatarUrl, setAvatarUrl }}>
      {children}
    </UserAvatarContext.Provider>
  );
}

export function useUserAvatar() {
  return useContext(UserAvatarContext);
}
