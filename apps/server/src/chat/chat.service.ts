import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service.js';
import { PUBLIC_USER_SELECT } from '../users/users.service.js';

const WITH_AUTHOR = { include: { author: { select: PUBLIC_USER_SELECT } } };

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly posts: EventEmitter2,
  ) {}

  private async findPost(postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  private async isApproved(postId: string, userId: string) {
    const jr = await this.prisma.joinRequest.findUnique({ where: { postId_userId: { postId, userId } } });
    return jr?.status === 'APPROVED';
  }

  // The hangout chat is only for the host and approved attendees (open posts approve on join).
  private async assertHangoutMember(postId: string, userId: string) {
    const post = await this.findPost(postId);
    if (post.hostId !== userId && !(await this.isApproved(postId, userId))) {
      throw new ForbiddenException('Only the host and approved attendees can see this chat');
    }
    return post;
  }

  // Messages from others in a thread since I last opened it; peerId '' is the hangout's group chat.
  private async unreadCount(userId: string, postId: string, peerId = '') {
    const read = await this.prisma.chatRead.findUnique({ where: { userId_postId_peerId: { userId, postId, peerId } } });
    return this.prisma.chatMessage.count({
      where: {
        postId,
        createdAt: read ? { gt: read.lastReadAt } : undefined,
        ...(peerId ? { authorId: peerId, dmWithUserId: userId } : { dmWithUserId: null, authorId: { not: userId } }),
      },
    });
  }

  async markRead(userId: string, postId: string, peerId = '') {
    await this.prisma.chatRead.upsert({
      where: { userId_postId_peerId: { userId, postId, peerId } },
      create: { userId, postId, peerId },
      update: { lastReadAt: new Date() },
    });
    return { ok: true };
  }

  // Host chat rules (a duo plan's only chat): it exists only between the host and someone who
  // requested. The host can text first; the guest can once approved (open posts approve on join)
  // or once the host has texted them.
  private async assertCanDmAboutPost(postId: string, fromUserId: string, toUserId: string) {
    const post = await this.findPost(postId);
    if (post.hostId === fromUserId) {
      const requested = await this.prisma.joinRequest.findUnique({ where: { postId_userId: { postId, userId: toUserId } } });
      if (!requested) throw new ForbiddenException('You can only message people who asked to join');
      return;
    }
    if (post.hostId !== toUserId) throw new ForbiddenException('Plan chats are between a guest and the host');
    if (await this.isApproved(postId, fromUserId)) return;
    const hostTexted = await this.prisma.chatMessage.count({ where: { postId, authorId: toUserId, dmWithUserId: fromUserId } });
    if (!hostTexted) throw new ForbiddenException('You can message the host once they text you or approve your request');
  }

  async sendPostMessage(postId: string, authorId: string, text: string) {
    const post = await this.assertHangoutMember(postId, authorId);
    const message = await this.prisma.chatMessage.create({ data: { postId, authorId, text }, ...WITH_AUTHOR });
    this.posts.emit('chat.postMessage', { postId, message });
    const members = await this.prisma.joinRequest.findMany({ where: { postId, status: 'APPROVED' }, select: { userId: true } });
    this.posts.emit('chat.inbox', { userIds: [post.hostId, ...members.map((m) => m.userId)], message });
    return message;
  }

  async listPostMessages(postId: string, userId: string, after?: string) {
    await this.assertHangoutMember(postId, userId);
    return this.prisma.chatMessage.findMany({
      where: { postId, dmWithUserId: null, createdAt: after ? { gt: new Date(after) } : undefined },
      orderBy: { createdAt: 'asc' },
      take: 100,
      ...WITH_AUTHOR,
    });
  }

  // "My" post chat threads: posts I host or was approved into, minus
  // archived ones — a chat has no reason to still show once its plan is over.
  async listPostThreads(userId: string) {
    const [hostedPosts, joinedPosts] = await Promise.all([
      this.prisma.post.findMany({ where: { hostId: userId, isArchived: false, seatsTotal: { gt: 2 } }, select: { id: true, title: true } }),
      this.prisma.post.findMany({
        where: { isArchived: false, seatsTotal: { gt: 2 }, joinRequests: { some: { userId, status: 'APPROVED' } } },
        select: { id: true, title: true },
      }),
    ]);
    const postsById = new Map([...hostedPosts, ...joinedPosts].map((e) => [e.id, e]));

    const threads = await Promise.all(
      [...postsById.values()].map(async (e) => {
        const lastMessage = await this.prisma.chatMessage.findFirst({
          where: { postId: e.id, dmWithUserId: null },
          orderBy: { createdAt: 'desc' },
          ...WITH_AUTHOR,
        });
        return { postId: e.id, title: e.title, lastMessage, unreadCount: await this.unreadCount(userId, e.id) };
      }),
    );

    return threads.sort((a, b) => (b.lastMessage?.createdAt.getTime() ?? 0) - (a.lastMessage?.createdAt.getTime() ?? 0));
  }

  // A DM is always a host chat about one plan.
  async sendDm(fromUserId: string, toUserId: string, text: string, postId: string) {
    await this.assertCanDmAboutPost(postId, fromUserId, toUserId);
    const message = await this.prisma.chatMessage.create({
      data: { authorId: fromUserId, dmWithUserId: toUserId, postId, text },
      ...WITH_AUTHOR,
    });
    this.posts.emit('chat.dm', { participantIds: [fromUserId, toUserId], postId, message });
    this.posts.emit('chat.inbox', { userIds: [fromUserId, toUserId], message });
    return message;
  }

  listDmThread(userId: string, peerId: string, postId: string) {
    return this.prisma.chatMessage.findMany({
      where: {
        postId,
        OR: [
          { authorId: userId, dmWithUserId: peerId },
          { authorId: peerId, dmWithUserId: userId },
        ],
      },
      orderBy: { createdAt: 'asc' },
      ...WITH_AUTHOR,
    });
  }

  // No dedicated "conversations" table — a DM thread is the newest message per (plan, peer).
  // A guest can't open a locked plan's host chat, so its thread only exists once the host texts.
  async listDmThreads(userId: string) {
    const messages = await this.prisma.chatMessage.findMany({
      where: { dmWithUserId: { not: null }, postId: { not: null }, OR: [{ authorId: userId }, { dmWithUserId: userId }] },
      orderBy: { createdAt: 'desc' },
      include: { ...WITH_AUTHOR.include, post: { select: { id: true, title: true, isArchived: true } } },
    });

    const latestByThread = new Map<string, (typeof messages)[number]>();
    for (const m of messages) {
      if (!m.post || m.post.isArchived) continue;
      const peerId = m.authorId === userId ? m.dmWithUserId! : m.authorId;
      const key = `${m.postId}:${peerId}`;
      if (!latestByThread.has(key)) latestByThread.set(key, m);
    }

    const threads = [...latestByThread.values()];
    const peerIds = threads.map((m) => (m.authorId === userId ? m.dmWithUserId! : m.authorId));
    const peers = await this.prisma.user.findMany({ where: { id: { in: peerIds } }, select: PUBLIC_USER_SELECT });
    const peerById = new Map(peers.map((p) => [p.id, p]));

    return Promise.all(threads.map(async ({ post, ...lastMessage }, i) => ({
      peer: peerById.get(peerIds[i])!,
      post: { id: post!.id, title: post!.title },
      lastMessage,
      unreadCount: await this.unreadCount(userId, post!.id, peerIds[i]),
    })));
  }
}
