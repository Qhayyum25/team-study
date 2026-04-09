import { Router } from "express";
import { db, usersTable, groupsTable, membersTable, messagesTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import {
  CreateGroupBody,
  GetGroupParams,
  DeleteGroupParams,
  JoinGroupParams,
  GetGroupMembersParams,
  GetGroupMessagesParams,
  SendMessageBody,
  SendMessageParams,
  ListGroupsQueryParams,
} from "@workspace/api-zod";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!req.session?.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  next();
}

router.get("/groups", requireAuth, async (req, res) => {
  const parsed = ListGroupsQueryParams.safeParse(req.query);
  const subject = parsed.success ? parsed.data.subject : undefined;

  const userId = req.session!.userId!;

  const groups = await db.select().from(groupsTable);
  const filtered = subject ? groups.filter((g) => g.subject === subject) : groups;

  const result = await Promise.all(
    filtered.map(async (group) => {
      const memberCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(membersTable)
        .where(eq(membersTable.groupId, group.id));
      const memberRows = await db
        .select()
        .from(membersTable)
        .where(and(eq(membersTable.groupId, group.id), eq(membersTable.userId, userId)));
      return {
        id: group.id,
        name: group.name,
        subject: group.subject,
        topic: group.topic,
        examTarget: group.examTarget,
        createdBy: group.createdBy,
        memberCount: Number(memberCount[0]?.count ?? 0),
        isMember: memberRows.length > 0,
      };
    })
  );

  res.json(result);
});

router.post("/groups", requireAuth, async (req, res) => {
  const parsed = CreateGroupBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const userId = req.session!.userId!;
  const { name, subject, topic, examTarget } = parsed.data;

  const [group] = await db
    .insert(groupsTable)
    .values({ name, subject, topic, examTarget, createdBy: userId })
    .returning();

  await db.insert(membersTable).values({ userId, groupId: group.id });

  res.status(201).json({
    id: group.id,
    name: group.name,
    subject: group.subject,
    topic: group.topic,
    examTarget: group.examTarget,
    createdBy: group.createdBy,
  });
});

router.get("/groups/:groupId", requireAuth, async (req, res) => {
  const parsed = GetGroupParams.safeParse({ groupId: Number(req.params.groupId) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid group ID" });
    return;
  }
  const { groupId } = parsed.data;
  const userId = req.session!.userId!;

  const groups = await db.select().from(groupsTable).where(eq(groupsTable.id, groupId));
  const group = groups[0];
  if (!group) {
    res.status(404).json({ error: "Group not found" });
    return;
  }

  const memberCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(membersTable)
    .where(eq(membersTable.groupId, groupId));

  const memberRows = await db
    .select()
    .from(membersTable)
    .where(and(eq(membersTable.groupId, groupId), eq(membersTable.userId, userId)));

  const allMemberRows = await db
    .select()
    .from(membersTable)
    .where(eq(membersTable.groupId, groupId));

  const members = await Promise.all(
    allMemberRows.map(async (m) => {
      const users = await db.select().from(usersTable).where(eq(usersTable.id, m.userId));
      const u = users[0];
      return { id: u.id, name: u.name, email: u.email, role: u.role };
    })
  );

  res.json({
    id: group.id,
    name: group.name,
    subject: group.subject,
    topic: group.topic,
    examTarget: group.examTarget,
    createdBy: group.createdBy,
    memberCount: Number(memberCount[0]?.count ?? 0),
    isMember: memberRows.length > 0,
    members,
  });
});

router.delete("/groups/:groupId", requireAuth, async (req, res) => {
  const parsed = DeleteGroupParams.safeParse({ groupId: Number(req.params.groupId) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid group ID" });
    return;
  }
  const userId = req.session!.userId!;
  const users = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  const user = users[0];
  if (!user || user.role !== "admin") {
    res.status(403).json({ error: "Admin only" });
    return;
  }
  const { groupId } = parsed.data;
  await db.delete(messagesTable).where(eq(messagesTable.groupId, groupId));
  await db.delete(membersTable).where(eq(membersTable.groupId, groupId));
  await db.delete(groupsTable).where(eq(groupsTable.id, groupId));
  res.json({ message: "Group deleted" });
});

router.post("/groups/:groupId/join", requireAuth, async (req, res) => {
  const parsed = JoinGroupParams.safeParse({ groupId: Number(req.params.groupId) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid group ID" });
    return;
  }
  const { groupId } = parsed.data;
  const userId = req.session!.userId!;

  const existing = await db
    .select()
    .from(membersTable)
    .where(and(eq(membersTable.groupId, groupId), eq(membersTable.userId, userId)));

  if (existing.length > 0) {
    res.status(409).json({ error: "Already a member" });
    return;
  }

  await db.insert(membersTable).values({ userId, groupId });
  res.json({ message: "Joined successfully" });
});

router.get("/groups/:groupId/members", requireAuth, async (req, res) => {
  const parsed = GetGroupMembersParams.safeParse({ groupId: Number(req.params.groupId) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid group ID" });
    return;
  }
  const { groupId } = parsed.data;

  const memberRows = await db.select().from(membersTable).where(eq(membersTable.groupId, groupId));
  const members = await Promise.all(
    memberRows.map(async (m) => {
      const users = await db.select().from(usersTable).where(eq(usersTable.id, m.userId));
      const u = users[0];
      return { id: u.id, name: u.name, email: u.email, role: u.role };
    })
  );

  res.json(members);
});

router.get("/groups/:groupId/messages", requireAuth, async (req, res) => {
  const parsed = GetGroupMessagesParams.safeParse({ groupId: Number(req.params.groupId) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid group ID" });
    return;
  }
  const { groupId } = parsed.data;

  const msgs = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.groupId, groupId))
    .orderBy(messagesTable.timestamp);

  const result = await Promise.all(
    msgs.map(async (m) => {
      const users = await db.select().from(usersTable).where(eq(usersTable.id, m.userId));
      const u = users[0];
      return {
        id: m.id,
        groupId: m.groupId,
        userId: m.userId,
        message: m.message,
        timestamp: m.timestamp.toISOString(),
        user: { id: u.id, name: u.name, email: u.email, role: u.role },
      };
    })
  );

  res.json(result);
});

router.post("/groups/:groupId/messages", requireAuth, async (req, res) => {
  const paramParsed = SendMessageParams.safeParse({ groupId: Number(req.params.groupId) });
  const bodyParsed = SendMessageBody.safeParse(req.body);
  if (!paramParsed.success || !bodyParsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const { groupId } = paramParsed.data;
  const { message } = bodyParsed.data;
  const userId = req.session!.userId!;

  const [msg] = await db
    .insert(messagesTable)
    .values({ groupId, userId, message })
    .returning();

  const users = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  const u = users[0];

  res.status(201).json({
    id: msg.id,
    groupId: msg.groupId,
    userId: msg.userId,
    message: msg.message,
    timestamp: msg.timestamp.toISOString(),
    user: { id: u.id, name: u.name, email: u.email, role: u.role },
  });
});

export default router;
