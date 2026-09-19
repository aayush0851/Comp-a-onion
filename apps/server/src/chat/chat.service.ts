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

  async sendPostMessage(postId: string, authorId: string, text: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    if (post.hostId !== authorId) {
      const approved = await this.prisma.joinRequest.findUnique({
        where: { postId_userId: { postId, userId: authorId } },
      });
      if (!approved || approved.status !== 'APPROVED') {
        throw new ForbiddenException('Only the host and approved attendees can post here');
      }
    }

    const message = await this.prisma.chatMessage.create({ data: { postId, authorId, text }, ...WITH_AUTHOR });
    this.posts.emit('chat.postMessage', { postId, message });
    return message;
  }

  listPostMessages(postId: string, after?: string) {
    return this.prisma.chatMessage.findMany({
      where: { postId, createdAt: after ? { gt: new Date(after) } : undefined },
      orderBy: { createdAt: 'asc' },
      take: 100,
      ...WITH_AUTHOR,
    });
  }

  // "My" post chat threads: posts I host or was approved into, minus
  // archived ones — a chat has no reason to still show once its plan is over.
  async listPostThreads(userId: string) {
    const [hostedPosts, joinedPosts] = await Promise.all([
      this.prisma.post.findMany({ where: { hostId: userId, isArchived: false }, select: { id: true, title: true } }),
      this.prisma.post.findMany({
        where: { isArchived: false, joinRequests: { some: { userId, status: 'APPROVED' } } },
        select: { id: true, title: true },
      }),
    ]);
    const postsById = new Map([...hostedPosts, ...joinedPosts].map((e) => [e.id, e]));

    const threads = await Promise.all(
      [...postsById.values()].map(async (e) => {
        const lastMessage = await this.prisma.chatMessage.findFirst({
          where: { postId: e.id },
          orderBy: { createdAt: 'desc' },
          ...WITH_AUTHOR,
        });
        return { postId: e.id, title: e.title, lastMessage };
      }),
    );

    return threads.sort((a, b) => (b.lastMessage?.createdAt.getTime() ?? 0) - (a.lastMessage?.createdAt.getTime() ?? 0));
  }

  async sendDm(fromUserId: string, toUserId: string, text: string) {
    const message = await this.prisma.chatMessage.create({
      data: { authorId: fromUserId, dmWithUserId: toUserId, text },
      ...WITH_AUTHOR,
    });
    this.posts.emit('chat.dm', { participantIds: [fromUserId, toUserId], message });
    return message;
  }

  listDmThread(userId: string, peerId: string) {
    return this.prisma.chatMessage.findMany({
      where: {
        postId: null,
        OR: [
          { authorId: userId, dmWithUserId: peerId },
          { authorId: peerId, dmWithUserId: userId },
        ],
      },
      orderBy: { createdAt: 'asc' },
      ...WITH_AUTHOR,
    });
  }

  // No dedicated "conversations" table — a DM thread is just messages with a given
  // dmWithUserId, so the thread list is derived by taking the newest message per peer.
  async listDmThreads(userId: string) {
    const messages = await this.prisma.chatMessage.findMany({
      where: { postId: null, OR: [{ authorId: userId }, { dmWithUserId: userId }] },
      orderBy: { createdAt: 'desc' },
      ...WITH_AUTHOR,
    });

    const latestByPeer = new Map<string, (typeof messages)[number]>();
    for (const m of messages) {
      const peerId = m.authorId === userId ? m.dmWithUserId! : m.authorId;
      if (!latestByPeer.has(peerId)) latestByPeer.set(peerId, m);
    }

    const peerIds = [...latestByPeer.keys()];
    const peers = await this.prisma.user.findMany({ where: { id: { in: peerIds } }, select: PUBLIC_USER_SELECT });
    const peerById = new Map(peers.map((p) => [p.id, p]));

    return peerIds.map((peerId) => ({ peer: peerById.get(peerId)!, lastMessage: latestByPeer.get(peerId)! }));
  }
}
