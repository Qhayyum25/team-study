import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "wouter";
import { Layout } from "@/components/layout";
import { 
  useGetGroup, 
  useGetGroupMessages, 
  useSendMessage,
  getGetGroupMessagesQueryKey,
  MessageWithUser
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Target, Send, ShieldAlert, MessageSquare } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

export default function GroupDetail() {
  const { groupId } = useParams();
  const id = Number(groupId);
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: group, isLoading: groupLoading, error: groupError } = useGetGroup(id);
  const { data: messages, isLoading: messagesLoading } = useGetGroupMessages(id, {
    query: { 
      refetchInterval: 3000,
      queryKey: getGetGroupMessagesQueryKey(id)
    }
  });
  
  const sendMessage = useSendMessage();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (groupError) {
    return (
      <Layout>
        <div className="py-12 text-center flex flex-col items-center">
          <ShieldAlert className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold">Group not found</h2>
          <p className="text-muted-foreground mt-2 mb-6">This group may have been deleted or you don't have access.</p>
          <Link href="/">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  if (groupLoading || !group) {
    return (
      <Layout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-32 bg-muted rounded w-full" />
          <div className="h-96 bg-muted rounded w-full" />
        </div>
      </Layout>
    );
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    sendMessage.mutate(
      { groupId: id, data: { message: message.trim() } },
      {
        onSuccess: () => {
          setMessage("");
          queryClient.invalidateQueries({ queryKey: getGetGroupMessagesQueryKey(id) });
        }
      }
    );
  };

  return (
    <Layout>
      <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
        <div>
          <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
          
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">{group.name}</h1>
                <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100">
                  {group.subject}
                </Badge>
              </div>
              <p className="text-slate-600">{group.topic}</p>
            </div>
            
            <div className="flex items-center gap-6 text-sm bg-slate-50 px-4 py-2.5 rounded-lg border border-slate-100">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-slate-400" />
                <span className="font-medium">{group.examTarget}</span>
              </div>
              <div className="w-px h-4 bg-slate-300" />
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400" />
                <span>{group.memberCount} Members</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0">
          <Card className="md:w-64 lg:w-72 shrink-0 flex flex-col border-slate-200 shadow-sm overflow-hidden bg-white">
            <div className="p-4 border-b border-slate-100 bg-slate-50/80">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" /> Members
              </h3>
            </div>
            <div className="overflow-y-auto flex-1 p-3 space-y-1">
              {group.members?.map(member => (
                <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <Avatar className="w-8 h-8 border border-slate-200">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-slate-900 truncate">{member.name}</span>
                    <span className="text-xs text-slate-500 truncate">{member.email}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="flex-1 flex flex-col border-slate-200 shadow-sm overflow-hidden bg-white">
            <div className="p-4 border-b border-slate-100 bg-slate-50/80 flex justify-between items-center">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" /> Discussion
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading && !messages ? (
                <div className="text-center text-muted-foreground py-8">Loading messages...</div>
              ) : !messages || messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                  <MessageSquare className="w-10 h-10 text-slate-200 mb-3" />
                  <p>No messages yet.</p>
                  <p className="text-sm">Say hi and start studying!</p>
                </div>
              ) : (
                (messages as any[]).map((msg: any, i: number) => {
                  const showHeader = i === 0 || messages![i-1].userId !== msg.userId || 
                    new Date(msg.timestamp).getTime() - new Date(messages![i-1].timestamp).getTime() > 300000;
                  
                  return (
                    <div key={msg.id} className={`flex flex-col ${!showHeader ? 'mt-1' : 'mt-4'}`}>
                      {showHeader && (
                        <div className="flex items-baseline gap-2 mb-1 pl-1">
                          <span className="font-semibold text-sm text-slate-900">{msg.user.name}</span>
                          <span className="text-xs text-slate-400">
                            {format(new Date(msg.timestamp), "h:mm a")}
                          </span>
                        </div>
                      )}
                      <div className="bg-slate-50 text-slate-800 rounded-2xl rounded-tl-none px-4 py-2 text-sm max-w-[85%] self-start border border-slate-100 shadow-sm">
                        {msg.message}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t border-slate-100 bg-slate-50/50">
              <form onSubmit={handleSend} className="flex items-center gap-2">
                <Input 
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-white border-slate-200 focus-visible:ring-primary rounded-full px-4"
                  disabled={sendMessage.isPending}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={!message.trim() || sendMessage.isPending}
                  className="rounded-full shrink-0 shadow-sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
