import { useState } from "react";
import { Link } from "wouter";
import { useListGroups, useJoinGroup, getListGroupsQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Target, CheckCircle2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

const SUBJECTS = ["All", "DBMS", "OS", "CN", "DSA", "Maths"];

export default function Dashboard() {
  const [subject, setSubject] = useState("All");
  const queryClient = useQueryClient();
  
  const { data: groups, isLoading } = useListGroups(
    subject === "All" ? {} : { subject }
  );

  const joinGroup = useJoinGroup();

  const handleJoin = (groupId: number) => {
    joinGroup.mutate({ groupId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListGroupsQueryKey() });
      }
    });
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Study Groups</h1>
            <p className="text-muted-foreground mt-1">Find your peers and start collaborating.</p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Filter by Subject:</span>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger className="w-[140px] bg-white">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="h-[200px] animate-pulse bg-muted/50 border-0" />
            ))}
          </div>
        ) : !Array.isArray(groups) || groups.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed">
            <div className="bg-primary/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">No groups found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-2">
              There are no active study groups for this subject yet. Be the first to create one!
            </p>
            <Link href="/create">
              <Button className="mt-6 rounded-full">Create a Group</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {groups.map(group => (
              <Card key={group.id} className="flex flex-col hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <CardTitle className="text-xl line-clamp-1 leading-tight" title={group.name}>{group.name}</CardTitle>
                    <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 whitespace-nowrap rounded-md shrink-0">
                      {group.subject}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">{group.topic}</p>
                </CardHeader>
                <CardContent className="py-4 flex-1 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                    <Target className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">Exam: <span className="font-medium text-slate-900">{group.examTarget}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 px-3">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>{group.memberCount} member{group.memberCount !== 1 && 's'}</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 pb-4 px-4">
                  {group.isMember ? (
                    <Link href={`/groups/${group.id}`} className="w-full">
                      <Button variant="outline" className="w-full bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700 gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Open Group
                      </Button>
                    </Link>
                  ) : (
                    <Button 
                      className="w-full shadow-sm" 
                      onClick={() => handleJoin(group.id)}
                      disabled={joinGroup.isPending}
                    >
                      {joinGroup.isPending ? "Joining..." : "Join Group"}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
