import { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser } from "../api/auth";

const AuthContext = createContext({
  user: null,
  setUser: () => {},
  logout: () => {},
  isAuthenticated: false,
  loading: true,
});

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);

  // Check if user is logged in on app load
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const storedUser = localStorage.getItem("user");

        if (token && storedUser) {
          // Try to validate token with backend
          try {
            const response = await getCurrentUser();
            if (response.success) {
              setUserState(response.data.user);
            } else {
              // Token invalid, clear storage
              localStorage.removeItem("authToken");
              localStorage.removeItem("user");
              setUserState(null);
            }
          } catch (error) {
            // If validation fails, use stored user but might need re-login
            console.log("Token validation failed, clearing auth");
            localStorage.removeItem("authToken");
            localStorage.removeItem("user");
            setUserState(null);
          }
        } else {
          setUserState(null);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setUserState(null);
      } finally {
        setLoading(false);
        setAuthReady(true);
      }
    };

    initAuth();
  }, []);

  // Modified setUser to save to localStorage
  const setUser = (userData) => {
    console.log('[AuthContext] Setting user:', userData);
    setUserState(userData);
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("authToken");
    }
  };

  // Logout function
  const logout = () => {
    setUserState(null);
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
  };

  // Show loading screen while checking authentication
  if (loading || !authReady) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle at center, #1b4e43 0%, #0a241e 100%)"
      }}>
        <div style={{ textAlign: "center" }}>
          <div className="five-balls-loader">
            <div></div><div></div><div></div><div></div><div></div>
          </div>
          <div style={{ color: "#ffffff", fontWeight: "bold", fontSize: 20, letterSpacing: "0.5px" }}>
            Loading Tea Factory System...
          </div>
        </div>
      </div>
    );
  }

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, setUser, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
