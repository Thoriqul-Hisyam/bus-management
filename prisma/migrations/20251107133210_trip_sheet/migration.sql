/*
  Warnings:

  - You are about to alter the column `sangu` on the `tripsheet` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - You are about to alter the column `premiDriver` on the `tripsheet` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - You are about to alter the column `premiCoDriver` on the `tripsheet` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - You are about to alter the column `umDriver` on the `tripsheet` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - You are about to alter the column `umCoDriver` on the `tripsheet` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - You are about to alter the column `bbm` on the `tripsheet` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - You are about to alter the column `total` on the `tripsheet` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.

*/
-- AlterTable
ALTER TABLE `tripsheet` MODIFY `sangu` DECIMAL(12, 2) NULL,
    MODIFY `premiDriver` DECIMAL(12, 2) NULL,
    MODIFY `premiCoDriver` DECIMAL(12, 2) NULL,
    MODIFY `umDriver` DECIMAL(12, 2) NULL,
    MODIFY `umCoDriver` DECIMAL(12, 2) NULL,
    MODIFY `bbm` DECIMAL(12, 2) NULL,
    MODIFY `total` DECIMAL(12, 2) NULL;
