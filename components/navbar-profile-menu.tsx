"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  User,
  Settings,
  LogOut,
} from "lucide-react";

interface NavbarProfileMenuProps {
  user: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export function getInitials(name: string | null, email: string): string {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return email[0].toUpperCase();
}

export function getDisplayName(name: string | null, email: string): string {
  if (name) return name;
  // Derive from email local-part
  const localPart = email.split("@")[0];
  return localPart.charAt(0).toUpperCase() + localPart.slice(1);
}

export default function NavbarProfileMenu({ user }: NavbarProfileMenuProps) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            className="flex items-center gap-2 rounded-full p-1 hover:bg-light-bg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-navy cursor-pointer"
            aria-label="Profile menu"
          />
        }
      >
        <Avatar className="h-8 w-8 border border-brand-border">
          <AvatarImage
            src={user.avatar_url || undefined}
            alt={user.full_name || user.email}
          />
          <AvatarFallback className="bg-navy text-white text-xs font-medium">
            {getInitials(user.full_name, user.email)}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium text-navy hidden xl:inline-block max-w-[120px] truncate">
          {getDisplayName(user.full_name, user.email)}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 bg-white border-brand-border shadow-lg"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium text-navy">
                {getDisplayName(user.full_name, user.email)}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-brand-border" />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="cursor-pointer text-navy/80 hover:text-navy focus:text-navy focus:bg-light-bg"
            onClick={() => router.push("/dashboard/profile")}
          >
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer text-navy/80 hover:text-navy focus:text-navy focus:bg-light-bg"
            onClick={() => router.push("/dashboard")}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer text-navy/80 hover:text-navy focus:text-navy focus:bg-light-bg"
            onClick={() => router.push("/dashboard/settings")}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-brand-border" />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
            onClick={async () => {
              await signOut();
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
