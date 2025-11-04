-- CreateTable
CREATE TABLE `account` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` INTEGER NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `lastLoginAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `account_employeeId_key`(`employeeId`),
    UNIQUE INDEX `account_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `travel` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `booking` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `customerId` INTEGER NOT NULL,
    `busId` INTEGER NOT NULL,
    `pickupAt` DATETIME(3) NULL,
    `pickupAddress` TEXT NULL,
    `destination` VARCHAR(191) NULL,
    `seatsBooked` INTEGER NULL,
    `priceTotal` DECIMAL(12, 2) NULL,
    `legrest` BOOLEAN NOT NULL DEFAULT false,
    `driverId` INTEGER NULL,
    `coDriverId` INTEGER NULL,
    `salesId` INTEGER NULL,
    `rentStartAt` DATETIME(3) NULL,
    `rentEndAt` DATETIME(3) NULL,
    `status` ENUM('DRAFT', 'CONFIRMED', 'CANCELLED', 'COMPLETED') NOT NULL DEFAULT 'DRAFT',
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `booking_code_key`(`code`),
    INDEX `booking_busId_rentStartAt_rentEndAt_idx`(`busId`, `rentStartAt`, `rentEndAt`),
    INDEX `booking_status_idx`(`status`),
    INDEX `booking_pickupAt_idx`(`pickupAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bookingId` INTEGER NOT NULL,
    `type` ENUM('DP', 'FULL', 'OTHER') NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `paidAt` DATETIME(3) NOT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `payment_bookingId_type_idx`(`bookingId`, `type`),
    INDEX `payment_paidAt_idx`(`paidAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `account` ADD CONSTRAINT `account_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `booking` ADD CONSTRAINT `booking_driverId_fkey` FOREIGN KEY (`driverId`) REFERENCES `employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `booking` ADD CONSTRAINT `booking_coDriverId_fkey` FOREIGN KEY (`coDriverId`) REFERENCES `employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `booking` ADD CONSTRAINT `booking_salesId_fkey` FOREIGN KEY (`salesId`) REFERENCES `employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `booking` ADD CONSTRAINT `booking_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `booking` ADD CONSTRAINT `booking_busId_fkey` FOREIGN KEY (`busId`) REFERENCES `Bus`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment` ADD CONSTRAINT `payment_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `booking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
