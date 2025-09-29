import { createContext, useState, useContext } from "react";

const userContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const login = (userData) => setUser(userData);
  const logout = () => setUser(null);

  return (
    <userContext.Provider value={(user, login, logout)}>
      {{ children }}
    </userContext.Provider>
  );
};

export const useUser = () => useContext(userContext);
