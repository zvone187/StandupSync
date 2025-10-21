import { LogOut, Users } from "lucide-react"
import { Button } from "./ui/button"
import { ThemeToggle } from "./ui/theme-toggle"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import { getCurrentUser } from "@/api/users"

interface CurrentUserResponse {
  user: {
    _id: string;
    email: string;
    name: string;
    role: string;
  };
}

export function Header() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const response = await getCurrentUser() as CurrentUserResponse;
        setIsAdmin(response.user.role === 'admin');
      } catch (error) {
        console.error('Error checking user role:', error);
      }
    };

    checkUserRole();
  }, []);

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="text-xl font-bold cursor-pointer" onClick={() => navigate("/")}>StandupSync</div>
        <div className="flex items-center gap-4">
          {isAdmin && (
            <Button
              variant={location.pathname === '/manage-users' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => navigate('/manage-users')}
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              Manage Users
            </Button>
          )}
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}