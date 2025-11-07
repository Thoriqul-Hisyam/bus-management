-- DropForeignKey
ALTER TABLE `tripsheet` DROP FOREIGN KEY `TripSheet_bookingId_fkey`;

-- AddForeignKey
ALTER TABLE `tripsheet` ADD CONSTRAINT `tripsheet_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `booking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `tripsheet` RENAME INDEX `TripSheet_bookingId_key` TO `tripsheet_bookingId_key`;
