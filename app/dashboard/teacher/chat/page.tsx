import { requireRole } from "@/lib/auth";
import ChatClient from "@/components/ChatClient";
import { getChatData } from "@/lib/chatData";

export const dynamic = "force-dynamic";

export default async function TeacherChat() {
  const profile = await requireRole("teacher");
  const { contacts, groups } = await getChatData(profile);
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-sm text-muted-foreground mt-1">Chat with your students, admins and class groups.</p>
      </div>
      <ChatClient meId={profile.id} contacts={contacts} groups={groups} />
    </div>
  );
}
