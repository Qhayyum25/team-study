import { useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin, useGetMe } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Users, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export default function Login() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading: isLoadingUser } = useGetMe();
  const login = useLogin();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "password",
    },
  });

  useEffect(() => {
    if (user && !isLoadingUser) {
      setLocation("/");
    }
  }, [user, isLoadingUser, setLocation]);

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    login.mutate({ data: values }, {
      onSuccess: () => {
        toast({ title: "Welcome back!" });
        setLocation("/");
      },
      onError: (error) => {
        toast({ 
          title: "Login failed", 
          description: error.error?.error || "Invalid credentials",
          variant: "destructive" 
        });
      }
    });
  };

  const loadDemoUser = (email: string, password: string) => {
    form.setValue("email", email);
    form.setValue("password", password);
  };

  if (isLoadingUser) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6 hidden md:block">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <GraduationCap className="w-4 h-4" />
            KITS College
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
            Smart Study Group Finder
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Find focused study partners, share resources, and prepare for exams together. 
            The intelligent way to organize your academic life.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <Users className="w-6 h-6 text-primary mb-2" />
              <h3 className="font-semibold mb-1">Find Peers</h3>
              <p className="text-sm text-slate-500">Connect with students taking the same classes.</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <BookOpen className="w-6 h-6 text-primary mb-2" />
              <h3 className="font-semibold mb-1">Stay Focused</h3>
              <p className="text-sm text-slate-500">Subject-specific groups keep discussions on track.</p>
            </div>
          </div>
        </div>

        <Card className="w-full max-w-md mx-auto shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Sign in to access your study groups
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="student@kits.edu" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={login.isPending}>
                  {login.isPending ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </Form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Demo Accounts</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={() => loadDemoUser("rahul@kits.edu", "123")}>
                Student: Rahul
              </Button>
              <Button variant="outline" size="sm" onClick={() => loadDemoUser("priya@kits.edu", "123")}>
                Student: Priya
              </Button>
              <Button variant="outline" size="sm" className="col-span-2" onClick={() => loadDemoUser("admin@kits.edu", "admin")}>
                Admin
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
