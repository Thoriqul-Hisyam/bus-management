/*
  Warnings:

  - You are about to drop the column `type` on the `bus` table. All the data in the column will be lost.
  - Added the required column `busTypeId` to the `Bus` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `bus` DROP COLUMN `type`,
    ADD COLUMN `busTypeId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `bus_type` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `bus_type_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Bus` ADD CONSTRAINT `Bus_busTypeId_fkey` FOREIGN KEY (`busTypeId`) REFERENCES `bus_type`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
