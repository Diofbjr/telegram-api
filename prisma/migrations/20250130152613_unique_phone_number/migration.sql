/*
  Warnings:

  - The `expires_in` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[number]` on the table `Phone` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "expires_in",
ADD COLUMN     "expires_in" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Phone_number_key" ON "Phone"("number");
