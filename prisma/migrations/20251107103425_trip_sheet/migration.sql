-- CreateTable
CREATE TABLE `TripSheet` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bookingId` INTEGER NOT NULL,
    `busId` INTEGER NOT NULL,
    `driverId` INTEGER NOT NULL,
    `coDriverId` INTEGER NULL,
    `customerId` INTEGER NOT NULL,
    `rentStartAt` DATETIME(3) NULL,
    `rentEndAt` DATETIME(3) NULL,
    `pickupAddress` VARCHAR(191) NULL,
    `destination` VARCHAR(191) NULL,
    `priceTotal` DECIMAL(65, 30) NULL DEFAULT 0.0,
    `description` VARCHAR(191) NULL,
    `sangu` DECIMAL(65, 30) NULL DEFAULT 0.0,
    `premiDriver` DECIMAL(65, 30) NULL DEFAULT 0.0,
    `premiCoDriver` DECIMAL(65, 30) NULL DEFAULT 0.0,
    `umDriver` DECIMAL(65, 30) NULL DEFAULT 0.0,
    `umCoDriver` DECIMAL(65, 30) NULL DEFAULT 0.0,
    `bbm` DECIMAL(65, 30) NULL DEFAULT 0.0,
    `total` DECIMAL(65, 30) NULL DEFAULT 0.0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TripSheet_bookingId_key`(`bookingId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TripSheet` ADD CONSTRAINT `TripSheet_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `booking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TripSheet` ADD CONSTRAINT `TripSheet_busId_fkey` FOREIGN KEY (`busId`) REFERENCES `Bus`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TripSheet` ADD CONSTRAINT `TripSheet_driverId_fkey` FOREIGN KEY (`driverId`) REFERENCES `employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TripSheet` ADD CONSTRAINT `TripSheet_coDriverId_fkey` FOREIGN KEY (`coDriverId`) REFERENCES `employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TripSheet` ADD CONSTRAINT `TripSheet_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
