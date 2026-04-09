import { Link, useLocation } from "wouter";
import { useLogout, useGetMe } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { LogOut, Plus, Shield, GraduationCap } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Layout({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: user } = useGetMe();
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.clear();
        setLocation("/login");
      }
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto max-w-5xl flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 text-primary font-bold text-xl">
            <GraduationCap className="h-6 w-6" />
            <span>Smart Study</span>
          </Link>
          
          <nav className="flex items-center gap-4">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            {user?.role === 'admin' && (
              <Link href="/admin" className="text-sm font-medium flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                <Shield className="h-4 w-4" /> Admin
              </Link>
            )}
            <Link href="/create">
              <Button size="sm" className="gap-2 rounded-full px-4">
                <Plus className="h-4 w-4" /> Create Group
              </Button>
            </Link>
            
            <div className="h-8 w-px bg-border mx-2"></div>
            
            <div className="flex items-center gap-3">
              {user && (
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 border border-border">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col text-xs">
                    <span className="font-semibold">{user.name}</span>
                    <span className="text-muted-foreground">{user.role}</span>
                  </div>
                </div>
              )}
              <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Log out</span>
              </Button>
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto max-w-5xl p-4 py-8">
        {children}
      </main>
    </div>
  );
}
