
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  MessageSquare, 
  CalendarDays,
  LogOut,
  Settings,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';
import { UserPresence } from './UserPresence';
import { MobileNavigation } from './MobileNavigation';
import { useMobileNavigation } from '@/hooks/useMobileNavigation';
import { MobileBottomNav } from './MobileBottomNav';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Séances', href: '/seances', icon: Calendar },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Commentaires', href: '/commentaires', icon: MessageSquare },
  { name: 'Planning', href: '/planning', icon: CalendarDays },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { isMenuOpen, toggleMenu, closeMenu, isMobile } = useMobileNavigation();

  const handleLogout = async () => {
    await logout();
  };

  // Only show developer tools in development environment
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen bg-background no-horizontal-scroll">
      {/* Navigation */}
      <nav className="bg-card border-b border-border sticky top-0 z-40 w-full">
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          {/* Header sur mobile: 2 lignes, sur desktop: 1 ligne */}
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center md:h-16 py-2 gap-2">
            
            {/* Première ligne mobile / Partie gauche desktop */}
            <div className="flex items-center justify-between md:justify-start space-x-2 w-full md:w-auto min-w-0">
              {/* Mobile Menu Button */}
              <div className="flex-shrink-0 md:hidden">
                <MobileNavigation 
                  isOpen={isMenuOpen}
                  onToggle={toggleMenu}
                  onClose={closeMenu}
                />
              </div>

              {/* Logo */}
              <Link to="/dashboard" className="flex items-center space-x-2 flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">ST</span>
                </div>
                <span className="font-semibold text-foreground text-sm sm:text-base">
                  {isMobile ? 'Suivi Tuteur' : 'Suivi Tuteur'}
                </span>
              </Link>

              {/* Mobile User Name (première ligne) */}
              <div className="md:hidden flex-shrink-0 ml-auto">
                <span className="text-xs font-medium text-foreground max-w-[80px] truncate">
                  {user?.name?.split(' ')[0] || 'User'}
                </span>
              </div>
            </div>

            {/* Desktop Navigation - Caché sur mobile */}
            <div className="hidden md:flex items-center space-x-1 flex-grow justify-center max-w-2xl">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-2 lg:px-3 py-2 rounded-md text-xs lg:text-sm font-medium transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    <div className="flex items-center space-x-1 lg:space-x-2">
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="hidden lg:block">{item.name}</span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Seconde ligne mobile / Partie droite desktop */}
            <div className="flex items-center justify-between md:justify-end space-x-1 w-full md:w-auto flex-shrink-0">
              {/* User Presence - Masqué sur très petit mobile */}
              <div className="hidden sm:block flex-shrink-0">
                <UserPresence />
              </div>

              {/* Notifications */}
              <div className="flex-shrink-0">
                <NotificationDropdown />
              </div>

              {/* Desktop User Actions */}
              <div className="hidden md:flex items-center space-x-1 flex-shrink-0">
                <Link to="/user-settings">
                  <Button variant="ghost" size="sm" className="p-2">
                    <User className="w-4 h-4" />
                  </Button>
                </Link>

                <Link to="/notification-settings">
                  <Button variant="ghost" size="sm" className="p-2">
                    <Settings className="w-4 h-4" />
                  </Button>
                </Link>

                <div className="flex items-center space-x-1">
                  <span className="text-xs font-medium text-foreground hidden lg:block max-w-[100px] truncate">
                    {user?.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-muted-foreground hover:text-foreground p-2"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Mobile Actions - seconde ligne */}
              <div className="md:hidden flex items-center space-x-1 ml-auto">
                <Link to="/user-settings">
                  <Button variant="ghost" size="sm" className="p-2">
                    <User className="w-4 h-4" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-foreground p-2"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 md:py-8 pb-24 md:pb-8 no-horizontal-scroll">
        <div className="space-y-4 md:space-y-8 w-full">
          {children}
        </div>
      </main>

      {/* Barre de navigation mobile en bas */}
      <MobileBottomNav />
    </div>
  );
}
