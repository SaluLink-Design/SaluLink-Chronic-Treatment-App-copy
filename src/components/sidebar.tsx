'use client';

import { useState } from 'react';
import { 
  Trash2, 
  Sun, 
  User, 
  ArrowSquareOut, 
  SignOut,
  MessageSquare,
  FileText,
  Settings,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [activeItem, setActiveItem] = useState('new-case');

  const menuItems = [
    { id: 'new-case', label: 'New Case', icon: FileText },
    { id: 'view-cases', label: 'View Cases', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Updates & FAQ', icon: HelpCircle },
  ];

  const bottomItems = [
    { id: 'clear', label: 'Clear conversations', icon: Trash2 },
    { id: 'light-mode', label: 'Light mode', icon: Sun },
    { id: 'account', label: 'My account', icon: User },
    { id: 'updates', label: 'Updates & FAQ', icon: ArrowSquareOut },
    { id: 'logout', label: 'Log out', icon: SignOut },
  ];

  return (
    <div className={cn(
      "flex flex-col justify-between h-screen w-72 bg-gradient-to-b from-gray-100 to-gray-50 border-r border-gray-200",
      className
    )}>
      {/* Top Section */}
      <div className="flex flex-col gap-1 p-5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveItem(item.id)}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                activeItem === item.id
                  ? "bg-gray-200 text-gray-900"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon size={20} />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col gap-1 p-5 border-t border-gray-200">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <Icon size={20} />
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
