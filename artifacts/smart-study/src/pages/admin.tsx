import { Layout } from "@/components/layout";
import { useGetMe, useListGroups, useDeleteGroup, getListGroupsQueryKey } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Shield, Trash2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Admin() {
  const { data: user, isLoading: userLoading } = useGetMe();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: groups, isLoading: groupsLoading } = useListGroups();
  const deleteGroup = useDeleteGroup();

  useEffect(() => {
    if (!userLoading && user?.role !== 'admin') {
      setLocation("/");
    }
  }, [user, userLoading, setLocation]);

  if (userLoading || user?.role !== 'admin') return null;

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this group?")) return;

    deleteGroup.mutate({ groupId: id }, {
      onSuccess: () => {
        toast({ title: "Group deleted" });
        queryClient.invalidateQueries({ queryKey: getListGroupsQueryKey() });
      },
      onError: (error) => {
        toast({ 
          title: "Error deleting group", 
          description: error.error?.error || "Unknown error",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
          <div className="bg-slate-100 p-2 rounded-lg">
            <Shield className="w-6 h-6 text-slate-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-500 text-sm">Manage study groups and platform content.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Members</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupsLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading groups...</TableCell>
                </TableRow>
              ) : !groups || groups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No groups found.</TableCell>
                </TableRow>
              ) : (
                groups.map(group => (
                  <TableRow key={group.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium text-slate-500">#{group.id}</TableCell>
                    <TableCell className="font-semibold text-slate-900">{group.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-slate-50 text-slate-600 font-normal">
                        {group.subject}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600">{group.examTarget}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Users className="w-4 h-4 text-slate-400" />
                        {group.memberCount}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(group.id)}
                        disabled={deleteGroup.isPending}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2 h-8"
                      >
                        <Trash2 className="w-4 h-4 mr-1.5" />
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
}
