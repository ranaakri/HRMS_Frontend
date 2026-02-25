import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Card } from "../../components/ui/card";
import { Commet } from "react-loading-indicators";

const Logout = () => {
  const navigate = useNavigate();
  const { setLoggedin } = useAuth();

  useEffect(() => {
    document.cookie =
      "LoggedIn=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setLoggedin(false);
    navigate("/login");
  }, [navigate]);

  return (
    <Card className="w-full h-full p-4 flex justify-center items-center">
      <Commet
        color="#9088ff"
        size="medium"
        text="Logging out..."
        textColor=""
      />
    </Card>
  );
};

export default Logout;
