'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Library, TrendingUp, Sparkles, Tags, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { NavigationItem } from "@/lib/types";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/',
    icon: Home,
    description: 'Executive overview'
  },
  {
    name: 'Discover',
    href: '/discover',
    icon: Compass,
    description: 'Find gaps & plan'
  },
  {
    name: 'Library',
    href: '/library',
    icon: Library,
    description: 'Browse content'
  },
  {
    name: 'Classification',
    href: '/classification',
    icon: Tags,
    description: 'Classify content'
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: TrendingUp,
    description: 'Performance insights'
  },
  {
    name: 'Assistant',
    href: '/assistant',
    icon: Sparkles,
    description: 'AI recommendations'
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) {
      setIsCollapsed(saved === 'true');
    }
  }, []);

  // Save collapsed state to localStorage whenever it changes
  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', String(newState));
  };

  return (
    <aside className={cn(
      "border-r bg-background flex flex-col h-screen transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Logo and Toggle */}
      <div className="p-4 border-b flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-brand flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h1 className="font-semibold text-lg truncate">Content Intel</h1>
              <p className="text-xs text-muted-foreground truncate">Analytics Hub</p>
            </div>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="flex-shrink-0 h-8 w-8"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? `${item.name} - ${item.description}` : undefined}
              className={cn(
                "flex items-center rounded-lg text-sm font-medium transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                isCollapsed ? "justify-center p-3" : "gap-3 px-3 py-2",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && (
                <div className="flex-1 overflow-hidden">
                  <div className="truncate">{item.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {item.description}
                  </div>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Menu */}
      <div className={cn("p-4 border-t", isCollapsed && "flex justify-center")}>
        <div className={cn(
          "flex items-center",
          isCollapsed ? "justify-center" : "gap-3 px-3 py-2"
        )}>
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0" title={isCollapsed ? "User - user@company.com" : undefined}>
            <span className="text-sm font-medium">U</span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 overflow-hidden">
              <div className="text-sm font-medium truncate">User</div>
              <div className="text-xs text-muted-foreground truncate">user@company.com</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
