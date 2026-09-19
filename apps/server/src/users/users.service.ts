import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { UpdateUserDto } from './dto/update-user.dto.js';
import { isChanged } from '@companion/common';

const MIN_AGE_YEARS = 18;

function isAtLeastMinAge(dob: Date): boolean {
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - MIN_AGE_YEARS);
  return dob.getTime() <= cutoff.getTime();
}

export const PUBLIC_USER_SELECT = {
  id: true,
  name: true,
  gender: true,
  genderVisible: true,
  profilePicture: true,
  highlights: true,
  vibeTags: true,
  aggregatedRating: true,
  createdAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findMe(userId: string) {
    return this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
  }

  async updateMe(userId: string, dto: UpdateUserDto) {
    const current = await this.prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { name: true, dob: true, gender: true } });
    const dob = dto.dob ? new Date(dto.dob) : undefined;
    const changed =
      isChanged(dto.name, current.name) ||
      isChanged(dto.gender, current.gender) ||
      isChanged(dob, current.dob, (a, b) => a.getTime() === b.getTime());
    if (changed) throw new BadRequestException('Name, date of birth and gender can’t be changed once set');
    if (dob && !isAtLeastMinAge(dob)) throw new BadRequestException(`You must be at least ${MIN_AGE_YEARS} years old`);
    return this.prisma.user.update({
      where: { id: userId },
      data: { ...dto, dob },
    });
  }

  findPublicProfile(id: string) {
    return this.prisma.user.findUniqueOrThrow({ where: { id }, select: PUBLIC_USER_SELECT });
  }

  archiveMe(userId: string) {
    return this.prisma.user.update({ where: { id: userId }, data: { isArchived: true } });
  }
}
