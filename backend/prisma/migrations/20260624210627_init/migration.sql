-- CreateEnum
CREATE TYPE "Role" AS ENUM ('superadmin', 'admin', 'artisan', 'buyer');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('CC', 'CE', 'NIT', 'PAS');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('awaiting_payment', 'pendiente', 'en_proceso', 'enviado', 'entregado', 'cancelado');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('whatsapp', 'transfer', 'cod');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'confirmed', 'failed');

-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('entrada', 'salida', 'ajuste');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'buyer',
    "documentType" "DocumentType",
    "documentNumber" TEXT,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "passwordResetToken" TEXT,
    "passwordResetExpires" TIMESTAMP(3),
    "verificationStatus" "VerificationStatus",
    "whatsapp" TEXT,
    "instagram" TEXT,
    "craft" TEXT,
    "region" TEXT,
    "applicationNotes" TEXT,
    "referredById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "category" TEXT NOT NULL,
    "images" TEXT[],
    "artisanId" TEXT NOT NULL,
    "isPromotion" BOOLEAN NOT NULL DEFAULT false,
    "promotionPrice" DOUBLE PRECISION,
    "soldCount" INTEGER NOT NULL DEFAULT 0,
    "ratingAverage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "totalOrder" DOUBLE PRECISION NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'awaiting_payment',
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'whatsapp',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "customerNotes" TEXT,
    "notes" TEXT,
    "shippingName" TEXT,
    "shippingPhone" TEXT,
    "shippingAddress" TEXT,
    "shippingCity" TEXT,
    "shippingDept" TEXT,
    "shippingPostal" TEXT,
    "shippingNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalItem" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArtisanProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "logo" TEXT,
    "description" TEXT,
    "phone" TEXT,
    "city" TEXT,
    "department" TEXT,
    "website" TEXT,
    "socialFacebook" TEXT,
    "socialInstagram" TEXT,
    "socialWhatsapp" TEXT,
    "nit" TEXT,
    "bankAccount" TEXT,
    "bankName" TEXT,
    "story" TEXT,
    "craft" TEXT,
    "region" TEXT,
    "coverImage" TEXT,
    "slug" TEXT,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArtisanProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "department" TEXT,
    "postalCode" TEXT,
    "totalPurchases" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Banner" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "description" TEXT,
    "link" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryMovement" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "type" "MovementType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "previousStock" INTEGER NOT NULL,
    "newStock" INTEGER NOT NULL,
    "reason" TEXT,
    "performedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryMovement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_isActive_idx" ON "User"("role", "isActive");

-- CreateIndex
CREATE INDEX "User_role_verificationStatus_idx" ON "User"("role", "verificationStatus");

-- CreateIndex
CREATE INDEX "Product_category_price_idx" ON "Product"("category", "price");

-- CreateIndex
CREATE INDEX "Product_artisanId_idx" ON "Product"("artisanId");

-- CreateIndex
CREATE INDEX "Product_soldCount_idx" ON "Product"("soldCount");

-- CreateIndex
CREATE INDEX "Review_productId_idx" ON "Review"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_buyerId_productId_key" ON "Review"("buyerId", "productId");

-- CreateIndex
CREATE INDEX "Order_buyerId_idx" ON "Order"("buyerId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_paymentStatus_idx" ON "Order"("paymentStatus");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "ArtisanProfile_userId_key" ON "ArtisanProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ArtisanProfile_slug_key" ON "ArtisanProfile"("slug");

-- CreateIndex
CREATE INDEX "ArtisanProfile_craft_region_idx" ON "ArtisanProfile"("craft", "region");

-- CreateIndex
CREATE UNIQUE INDEX "ClientProfile_userId_key" ON "ClientProfile"("userId");

-- CreateIndex
CREATE INDEX "InventoryMovement_productId_idx" ON "InventoryMovement"("productId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_artisanId_fkey" FOREIGN KEY ("artisanId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtisanProfile" ADD CONSTRAINT "ArtisanProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientProfile" ADD CONSTRAINT "ClientProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
