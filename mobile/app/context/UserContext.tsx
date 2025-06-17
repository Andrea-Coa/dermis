// context/UserContext.tsx
import React, { createContext, useContext, useState } from 'react';

type FrontImage = {
  uri: string;
  width: number;
  height: number;
  base64?: string;
};

type UserContextType = {
  _user_id: string;
  setUserId: (id: string) => void;
  frontImage?: FrontImage;
  setFrontImage: (image: FrontImage) => void;
};

const UserContext = createContext<UserContextType | null>(null);

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used inside a UserProvider');
  return ctx;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState('');
  const [frontImage, setFrontImage] = useState<FrontImage>();

  return (
    <UserContext.Provider value={{ _user_id: userId, setUserId, frontImage, setFrontImage }}>
      {children}
    </UserContext.Provider>
  );
};
