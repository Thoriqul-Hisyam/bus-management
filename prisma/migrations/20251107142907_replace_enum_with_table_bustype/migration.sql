-- 1) Create master table (idempotent)
CREATE TABLE IF NOT EXISTS `bus_type` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY `bus_type_name_key` (`name`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2) Add column on `bus` (portable: tanpa IF NOT EXISTS, cek ke information_schema dulu)
SET @col_missing := (
  SELECT COUNT(*) = 0
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'bus'
    AND COLUMN_NAME = 'busTypeId'
);

SET @ddl_addcol := IF(
  @col_missing,
  'ALTER TABLE `bus` ADD COLUMN `busTypeId` INT NULL',
  'SELECT 1'
);
PREPARE s1 FROM @ddl_addcol; EXECUTE s1; DEALLOCATE PREPARE s1;

-- 3) Add FK only if it doesn't already exist (idempotent)
SET @fk_exists := (
  SELECT COUNT(*)
  FROM information_schema.REFERENTIAL_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND CONSTRAINT_NAME = 'bus_busTypeId_fkey'
    AND TABLE_NAME = 'bus'
);
SET @ddl := IF(
  @fk_exists = 0,
  'ALTER TABLE `bus` ADD CONSTRAINT `bus_busTypeId_fkey` FOREIGN KEY (`busTypeId`) REFERENCES `bus_type`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE',
  'SELECT 1'
);
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 4) Seed master values (idempotent)
INSERT INTO `bus_type` (`name`, `createdAt`, `updatedAt`) VALUES
('EKONOMI', NOW(), NOW()),
('BISNIS', NOW(), NOW()),
('VIP', NOW(), NOW()),
('EKSEKUTIF', NOW(), NOW()),
('SUPER_EKSEKUTIF', NOW(), NOW())
ON DUPLICATE KEY UPDATE `updatedAt` = VALUES(`updatedAt`);

-- 5) Backfill busTypeId from legacy enum string (tolerate case/spaces)
UPDATE `bus` b
JOIN `bus_type` t ON UPPER(t.`name`) = UPPER(TRIM(b.`type`))
SET b.`busTypeId` = t.`id`
WHERE b.`busTypeId` IS NULL;

-- 6) Drop FK (if exists) so we can change the column definition
SET @fk_exists2 := (
  SELECT COUNT(*)
  FROM information_schema.REFERENTIAL_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND CONSTRAINT_NAME = 'bus_busTypeId_fkey'
    AND TABLE_NAME = 'bus'
);
SET @ddl2 := IF(
  @fk_exists2 = 1,
  'ALTER TABLE `bus` DROP FOREIGN KEY `bus_busTypeId_fkey`',
  'SELECT 1'
);
PREPARE stmt2 FROM @ddl2; EXECUTE stmt2; DEALLOCATE PREPARE stmt2;

-- 7) Make busTypeId NOT NULL (now it’s allowed)
ALTER TABLE `bus`
  MODIFY `busTypeId` INT NOT NULL;

-- 8) Re-add FK (idempotent)
SET @fk_exists3 := (
  SELECT COUNT(*)
  FROM information_schema.REFERENTIAL_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND CONSTRAINT_NAME = 'bus_busTypeId_fkey'
    AND TABLE_NAME = 'bus'
);
SET @ddl3 := IF(
  @fk_exists3 = 0,
  'ALTER TABLE `bus` ADD CONSTRAINT `bus_busTypeId_fkey` FOREIGN KEY (`busTypeId`) REFERENCES `bus_type`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE',
  'SELECT 1'
);
PREPARE stmt3 FROM @ddl3; EXECUTE stmt3; DEALLOCATE PREPARE stmt3;

-- 9) Drop old enum column `type` (only if it still exists)
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'bus'
    AND COLUMN_NAME = 'type'
);
SET @ddl4 := IF(
  @col_exists = 1,
  'ALTER TABLE `bus` DROP COLUMN `type`',
  'SELECT 1'
);
PREPARE stmt4 FROM @ddl4; EXECUTE stmt4; DEALLOCATE PREPARE stmt4;
