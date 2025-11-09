import { prisma } from '../client'

export class UserRepository {
  /**
   * Create or update user
   */
  async upsert(data: {
    fid: number
    username: string
    displayName?: string
    pfpUrl?: string
    signerUuid: string
  }) {
    return prisma.user.upsert({
      where: { fid: data.fid },
      update: {
        username: data.username,
        displayName: data.displayName,
        pfpUrl: data.pfpUrl,
        signerUuid: data.signerUuid,
      },
      create: {
        fid: data.fid,
        username: data.username,
        displayName: data.displayName,
        pfpUrl: data.pfpUrl,
        signerUuid: data.signerUuid,
      },
    })
  }

  /**
   * Find user by FID
   */
  async findByFid(fid: number) {
    return prisma.user.findUnique({
      where: { fid },
    })
  }

  /**
   * Find user by ID
   */
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    })
  }

  /**
   * Find user by signer UUID
   */
  async findBySignerUuid(signerUuid: string) {
    return prisma.user.findUnique({
      where: { signerUuid },
    })
  }

  /**
   * Update user
   */
  async update(
    id: string,
    data: {
      username?: string
      displayName?: string
      pfpUrl?: string
      signerUuid?: string
    }
  ) {
    return prisma.user.update({
      where: { id },
      data,
    })
  }

  /**
   * Delete user
   */
  async delete(id: string) {
    return prisma.user.delete({
      where: { id },
    })
  }
}

export const userRepository = new UserRepository()
