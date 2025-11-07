/*
  Warnings:

  - You are about to drop the column `busId` on the `tripsheet` table. All the data in the column will be lost.
  - You are about to drop the column `coDriverId` on the `tripsheet` table. All the data in the column will be lost.
  - You are about to drop the column `customerId` on the `tripsheet` table. All the data in the column will be lost.
  - You are about to drop the column `destination` on the `tripsheet` table. All the data in the column will be lost.
  - You are about to drop the column `driverId` on the `tripsheet` table. All the data in the column will be lost.
  - You are about to drop the column `pickupAddress` on the `tripsheet` table. All the data in the column will be lost.
  - You are about to drop the column `priceTotal` on the `tripsheet` table. All the data in the column will be lost.
  - You are about to drop the column `rentEndAt` on the `tripsheet` table. All the data in the column will be lost.
  - You are about to drop the column `rentStartAt` on the `tripsheet` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `tripsheet` DROP FOREIGN KEY `TripSheet_busId_fkey`;

-- DropForeignKey
ALTER TABLE `tripsheet` DROP FOREIGN KEY `TripSheet_coDriverId_fkey`;

-- DropForeignKey
ALTER TABLE `tripsheet` DROP FOREIGN KEY `TripSheet_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `tripsheet` DROP FOREIGN KEY `TripSheet_driverId_fkey`;

-- DropIndex
DROP INDEX `TripSheet_busId_fkey` ON `tripsheet`;

-- DropIndex
DROP INDEX `TripSheet_coDriverId_fkey` ON `tripsheet`;

-- DropIndex
DROP INDEX `TripSheet_customerId_fkey` ON `tripsheet`;

-- DropIndex
DROP INDEX `TripSheet_driverId_fkey` ON `tripsheet`;

-- AlterTable
ALTER TABLE `tripsheet` DROP COLUMN `busId`,
    DROP COLUMN `coDriverId`,
    DROP COLUMN `customerId`,
    DROP COLUMN `destination`,
    DROP COLUMN `driverId`,
    DROP COLUMN `pickupAddress`,
    DROP COLUMN `priceTotal`,
    DROP COLUMN `rentEndAt`,
    DROP COLUMN `rentStartAt`;
