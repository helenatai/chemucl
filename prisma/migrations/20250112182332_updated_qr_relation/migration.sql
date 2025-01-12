-- CreateEnum
CREATE TYPE "QrCodeType" AS ENUM ('CHEMICAL', 'LOCATION');

-- CreateTable
CREATE TABLE "User" (
    "userID" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "activeStatus" BOOLEAN NOT NULL DEFAULT true,
    "researchGroupID" INTEGER,
    "permission" TEXT NOT NULL DEFAULT 'Research Student',
    "registrationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "password" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userID")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "chemicals" (
    "chemicalID" SERIAL NOT NULL,
    "casNumber" TEXT NOT NULL,
    "restrictionStatus" BOOLEAN NOT NULL,
    "chemicalName" TEXT NOT NULL,
    "locationID" INTEGER,
    "activeStatus" BOOLEAN NOT NULL DEFAULT true,
    "researchGroupID" INTEGER,
    "supplier" TEXT,
    "description" TEXT,
    "chemicalType" TEXT NOT NULL DEFAULT 'Chemical',
    "auditStatus" BOOLEAN NOT NULL DEFAULT false,
    "lastAudit" TIMESTAMP(3),
    "quartzyNumber" TEXT,
    "qrID" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "dateAdded" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chemicals_pkey" PRIMARY KEY ("chemicalID")
);

-- CreateTable
CREATE TABLE "ResearchGroup" (
    "researchGroupID" SERIAL NOT NULL,
    "groupName" TEXT NOT NULL,

    CONSTRAINT "ResearchGroup_pkey" PRIMARY KEY ("researchGroupID")
);

-- CreateTable
CREATE TABLE "QrCode" (
    "qrID" TEXT NOT NULL,
    "type" "QrCodeType" NOT NULL,
    "locationID" INTEGER,
    "chemicalID" INTEGER,

    CONSTRAINT "QrCode_pkey" PRIMARY KEY ("qrID")
);

-- CreateTable
CREATE TABLE "locations" (
    "locationID" SERIAL NOT NULL,
    "building" TEXT NOT NULL,
    "room" TEXT NOT NULL,
    "subLocation1" TEXT,
    "subLocation2" TEXT,
    "subLocation3" TEXT,
    "subLocation4" TEXT,
    "qrID" TEXT,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("locationID")
);

-- CreateTable
CREATE TABLE "logs" (
    "logID" SERIAL NOT NULL,
    "userID" INTEGER,
    "actionType" TEXT NOT NULL,
    "chemicalID" INTEGER,
    "description" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_pkey" PRIMARY KEY ("logID")
);

-- CreateTable
CREATE TABLE "audit_general" (
    "auditGeneralID" SERIAL NOT NULL,
    "round" INTEGER NOT NULL,
    "auditorID" INTEGER NOT NULL,
    "pendingCount" INTEGER NOT NULL DEFAULT 0,
    "finishedCount" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3),
    "lastAuditDate" TIMESTAMP(3),
    "status" TEXT NOT NULL,

    CONSTRAINT "audit_general_pkey" PRIMARY KEY ("auditGeneralID")
);

-- CreateTable
CREATE TABLE "audits" (
    "auditID" SERIAL NOT NULL,
    "locationID" INTEGER NOT NULL,
    "auditorID" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastAuditDate" TIMESTAMP(3),
    "round" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "pendingCount" INTEGER NOT NULL DEFAULT 0,
    "finishedCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "audits_pkey" PRIMARY KEY ("auditID")
);

-- CreateTable
CREATE TABLE "audit_records" (
    "auditRecordID" SERIAL NOT NULL,
    "auditID" INTEGER NOT NULL,
    "chemicalID" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "auditDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastAuditDate" TIMESTAMP(3),
    "locationID" INTEGER NOT NULL,

    CONSTRAINT "audit_records_pkey" PRIMARY KEY ("auditRecordID")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "chemicals_qrID_key" ON "chemicals"("qrID");

-- CreateIndex
CREATE UNIQUE INDEX "ResearchGroup_groupName_key" ON "ResearchGroup"("groupName");

-- CreateIndex
CREATE UNIQUE INDEX "QrCode_locationID_key" ON "QrCode"("locationID");

-- CreateIndex
CREATE UNIQUE INDEX "QrCode_chemicalID_key" ON "QrCode"("chemicalID");

-- CreateIndex
CREATE UNIQUE INDEX "locations_qrID_key" ON "locations"("qrID");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_researchGroupID_fkey" FOREIGN KEY ("researchGroupID") REFERENCES "ResearchGroup"("researchGroupID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chemicals" ADD CONSTRAINT "chemicals_locationID_fkey" FOREIGN KEY ("locationID") REFERENCES "locations"("locationID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chemicals" ADD CONSTRAINT "chemicals_researchGroupID_fkey" FOREIGN KEY ("researchGroupID") REFERENCES "ResearchGroup"("researchGroupID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QrCode" ADD CONSTRAINT "QrCode_locationID_fkey" FOREIGN KEY ("locationID") REFERENCES "locations"("locationID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QrCode" ADD CONSTRAINT "QrCode_chemicalID_fkey" FOREIGN KEY ("chemicalID") REFERENCES "chemicals"("chemicalID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_chemicalID_fkey" FOREIGN KEY ("chemicalID") REFERENCES "chemicals"("chemicalID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_general" ADD CONSTRAINT "audit_general_auditorID_fkey" FOREIGN KEY ("auditorID") REFERENCES "User"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audits" ADD CONSTRAINT "audits_locationID_fkey" FOREIGN KEY ("locationID") REFERENCES "locations"("locationID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audits" ADD CONSTRAINT "audits_auditorID_fkey" FOREIGN KEY ("auditorID") REFERENCES "User"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_records" ADD CONSTRAINT "audit_records_locationID_fkey" FOREIGN KEY ("locationID") REFERENCES "locations"("locationID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_records" ADD CONSTRAINT "audit_records_auditID_fkey" FOREIGN KEY ("auditID") REFERENCES "audits"("auditID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_records" ADD CONSTRAINT "audit_records_chemicalID_fkey" FOREIGN KEY ("chemicalID") REFERENCES "chemicals"("chemicalID") ON DELETE RESTRICT ON UPDATE CASCADE;
