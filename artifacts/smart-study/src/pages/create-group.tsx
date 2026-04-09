import { Layout } from "@/components/layout";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateGroup, getListGroupsQueryKey } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Link } from "wouter";

const createGroupSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  subject: z.string().min(1, "Subject is required"),
  topic: z.string().min(3, "Topic must be at least 3 characters"),
  examTarget: z.string().min(2, "Exam target is required"),
});

const SUBJECTS = ["DBMS", "OS", "CN", "DSA", "Maths"];

export default function CreateGroup() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const createGroup = useCreateGroup();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof createGroupSchema>>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: "",
      subject: "",
      topic: "",
      examTarget: "",
    },
  });

  const onSubmit = (values: z.infer<typeof createGroupSchema>) => {
    createGroup.mutate({ data: values }, {
      onSuccess: (newGroup) => {
        toast({ title: "Group created successfully!" });
        queryClient.invalidateQueries({ queryKey: getListGroupsQueryKey() });
        setLocation(`/groups/${newGroup.id}`);
      },
      onError: (error) => {
        toast({ 
          title: "Failed to create group", 
          description: error.error?.error || "Something went wrong",
          variant: "destructive" 
        });
      }
    });
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
        
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-primary/10 p-2 rounded-lg text-primary">
                <BookOpen className="w-5 h-5" />
              </div>
              <CardTitle className="text-2xl">Create Study Group</CardTitle>
            </div>
            <CardDescription className="text-base">
              Start a new group to prepare for an upcoming exam with peers.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Group Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Midterm Mastery, Night Owls..." className="bg-slate-50 focus-visible:bg-white" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700">Subject</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-slate-50 focus:bg-white">
                              <SelectValue placeholder="Select a subject" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SUBJECTS.map(s => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="examTarget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700">Exam Target</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Midterms, Finals, Quiz 3..." className="bg-slate-50 focus-visible:bg-white" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Main Focus / Topics</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Chapter 4-6, B-Trees and Hashing..." className="bg-slate-50 focus-visible:bg-white" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                  <Link href="/">
                    <Button type="button" variant="outline" className="border-slate-200">Cancel</Button>
                  </Link>
                  <Button type="submit" disabled={createGroup.isPending} className="shadow-sm">
                    {createGroup.isPending ? "Creating..." : "Create Group"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
