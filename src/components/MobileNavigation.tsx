
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  MessageSquare, 
  CalendarDays,
  Menu,
  X,
  LogOut,
  Settings,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/context/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Séances', href: '/seances', icon: Calendar },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Commentaires', href: '/commentaires', icon: MessageSquare },
  { name: 'Planning', href: '/planning', icon: CalendarDays },
];

interface MobileNavigationProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export function MobileNavigation({ isOpen, onToggle, onClose }: MobileNavigationProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  const handleLinkClick = () => {
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onToggle}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={onToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">ST</span>
            </div>
            <span className="font-semibold">Suivi Tuteur</span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={handleLinkClick}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="border-t p-4 space-y-2">
            <div className="flex items-center space-x-3 px-4 py-2">
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-accent-foreground" />
              </div>
              <span className="text-sm font-medium">{user?.name}</span>
            </div>
            
            <Link
              to="/user-settings"
              onClick={handleLinkClick}
              className="flex items-center space-x-3 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
            >
              <User className="w-4 h-4" />
              <span>Paramètres utilisateur</span>
            </Link>
            
            <Link
              to="/notification-settings"
              onClick={handleLinkClick}
              className="flex items-center space-x-3 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
            >
              <Settings className="w-4 h-4" />
              <span>Notifications</span>
            </Link>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg w-full text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
