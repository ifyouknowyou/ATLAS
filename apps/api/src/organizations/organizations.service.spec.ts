import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { PrismaService } from '../prisma/prisma.service';

function serviceWith(overrides: {
  findUnique?: unknown | null;
  count?: number;
}) {
  const prisma = {
    membership: {
      findUnique: jest.fn(async () => overrides.findUnique ?? null),
      count: jest.fn(async () => overrides.count ?? 1),
      update: jest.fn(async () => ({ id: 'm1', role: 'ANALYST' })),
    },
  } as unknown as PrismaService;

  const service = new OrganizationsService(prisma);
  return { service, prisma };
}

describe('OrganizationsService.updateMemberRole', () => {
  it('rejects unknown members', async () => {
    const { service } = serviceWith({ findUnique: null });
    await expect(
      service.updateMemberRole('org1', 'u9', 'ANALYST', 'u1'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('prevents an ANALYST from self-escalating to OWNER', async () => {
    const { service } = serviceWith({
      findUnique: { role: 'ANALYST', userId: 'u2' },
    });
    await expect(
      service.updateMemberRole('org1', 'u2', 'OWNER', 'u2'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('prevents demoting the last OWNER', async () => {
    const { service } = serviceWith({
      findUnique: { role: 'OWNER', userId: 'u1' },
      count: 1,
    });
    await expect(
      service.updateMemberRole('org1', 'u1', 'ANALYST', 'u1'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('allows an OWNER to demote another OWNER when more than one exists', async () => {
    const { service, prisma } = serviceWith({
      findUnique: { role: 'OWNER', userId: 'u2' },
      count: 2,
    });
    await service.updateMemberRole('org1', 'u2', 'ANALYST', 'u1');
    expect(prisma.membership.update).toHaveBeenCalledWith({
      where: { userId_organizationId: { userId: 'u2', organizationId: 'org1' } },
      data: { role: 'ANALYST' },
      select: { id: true, role: true },
    });
  });
});