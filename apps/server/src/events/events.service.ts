import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { GenderRestriction, type Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { PUBLIC_USER_SELECT } from '../users/users.service.js';
import type { CreateEventDto } from './dto/create-event.dto.js';
import type { UpdateEventDto } from './dto/update-event.dto.js';
import type { BoardQueryDto } from './dto/board-query.dto.js';

const KM_PER_DEGREE = 111;

function timeStringToDate(time: string): Date {
  return new Date(`1970-01-01T${time}:00.000Z`);
}

function dateRangeForFilter(filter?: 0 | 1 | 2): { gte: Date; lt: Date } | undefined {
  if (filter === undefined) return undefined;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  if (filter === 0) {
    const tomorrow = new Date(startOfToday);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return { gte: startOfToday, lt: tomorrow };
  }
  if (filter === 1) {
    const tomorrow = new Date(startOfToday);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);
    return { gte: tomorrow, lt: dayAfter };
  }
  const weekOut = new Date(startOfToday);
  weekOut.setDate(weekOut.getDate() + 7);
  return { gte: startOfToday, lt: weekOut };
}

const EVENT_WITH_ATTENDEES = {
  include: {
    joinRequests: {
      where: { status: 'APPROVED' as const },
      include: { user: { select: PUBLIC_USER_SELECT } },
    },
  },
} satisfies Prisma.EventDefaultArgs;

type EventWithAttendees = Prisma.EventGetPayload<typeof EVENT_WITH_ATTENDEES>;

function shapeEvent(event: EventWithAttendees) {
  const { joinRequests, ...rest } = event;
  return {
    ...rest,
    seatsFilled: joinRequests.length,
    going: joinRequests.map((jr) => jr.user),
  };
}

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(hostId: string, dto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        hostId,
        title: dto.title,
        date: new Date(dto.date),
        time: dto.time ? timeStringToDate(dto.time) : undefined,
        venue: dto.venue,
        entryMode: dto.entryMode,
        seatsTotal: dto.seatsTotal,
        tags: dto.tags ?? [],
        genderRestriction: dto.genderRestriction,
        costMode: dto.costMode,
      },
    });
  }

  async findBoard(requesterId: string, query: BoardQueryDto) {
    const requester = await this.prisma.user.findUniqueOrThrow({ where: { id: requesterId } });

    const where: Prisma.EventWhereInput = {
      isArchived: false,
      date: dateRangeForFilter(query.filter),
    };

    if (requester.gender === 'Woman') {
      where.genderRestriction = { in: [GenderRestriction.ANYONE, GenderRestriction.WOMEN] };
    } else if (requester.gender === 'Man') {
      where.genderRestriction = { in: [GenderRestriction.ANYONE, GenderRestriction.MEN] };
    } else {
      where.genderRestriction = GenderRestriction.ANYONE;
    }

    if (requester.latitude != null && requester.longitude != null) {
      const delta = requester.proximityKm / KM_PER_DEGREE;
      where.host = {
        latitude: { gte: requester.latitude - delta, lte: requester.latitude + delta },
        longitude: { gte: requester.longitude - delta, lte: requester.longitude + delta },
      };
    }

    const events = await this.prisma.event.findMany({ where, ...EVENT_WITH_ATTENDEES, orderBy: { date: 'asc' } });
    return events.map(shapeEvent);
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({ where: { id }, ...EVENT_WITH_ATTENDEES });
    if (!event) throw new NotFoundException('Event not found');
    return shapeEvent(event);
  }

  async findHosted(hostId: string) {
    const events = await this.prisma.event.findMany({
      where: { hostId },
      ...EVENT_WITH_ATTENDEES,
      orderBy: { date: 'asc' },
    });
    return events.map(shapeEvent);
  }

  async update(hostId: string, id: string, dto: UpdateEventDto) {
    await this.assertHost(hostId, id);
    return this.prisma.event.update({
      where: { id },
      data: { ...dto, time: dto.time ? timeStringToDate(dto.time) : undefined },
    });
  }

  async archive(hostId: string, id: string) {
    await this.assertHost(hostId, id);
    return this.prisma.event.update({ where: { id }, data: { isArchived: true } });
  }

  private async assertHost(hostId: string, eventId: string) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');
    if (event.hostId !== hostId) throw new ForbiddenException('Only the host can do this');
  }
}
