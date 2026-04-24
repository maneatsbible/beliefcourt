import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  // In a real app, fetch user/auth state from API or localStorage
  const [user, setUser] = useState(null); // { id, handle }
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Mock login/logout for demo
  const login = (handle = 'alice') => {
    setUser({ id: `person-${handle}`, handle });
    setIsAuthenticated(true);
  };
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <UserContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
