import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";

export type Role = "Employee" | "Admin" | "Manager" | "HR";

interface IAuthContext {
  isLoggedin: boolean;
  setLoggedin: Dispatch<SetStateAction<boolean>>;
  user: UserData | null;
  setUser: Dispatch<SetStateAction<UserData | null>>;
}

export interface UserData {
  userId: number
  email: string
  role: Role
  profileUrl: string
  name: string
}

const AuthContext = createContext<IAuthContext | undefined>(undefined);

export const getCookie = (name: string) => {
  const cookies = document.cookie.split("; ");
  const foundCookie = cookies.find((row) => row.startsWith(`${name}=`));
  return foundCookie ? foundCookie.split("=")[1] : null;
};

export default function AuthContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isLoggedin, setLoggedin] = useState<boolean>(
    () => !!getCookie("LoggedIn"),
  );
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const cookieExists = !!getCookie("LoggedIn");
    if (isLoggedin !== cookieExists) {
      setLoggedin(cookieExists);
    }
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        console.error("Error parsing user from sessionStorage:", e);
        localStorage.removeItem("user");
      }
    }
  }, []);

   useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ isLoggedin, setLoggedin, user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const auth = useContext(AuthContext);
  if (!auth)
    throw new Error("useAuth must be used within an AuthContextProvider");
  return auth;
};
