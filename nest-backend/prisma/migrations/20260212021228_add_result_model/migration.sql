-- CreateTable
CREATE TABLE "Result" (
    "id" SERIAL NOT NULL,
    "documentId" INTEGER NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "chunkText" TEXT NOT NULL,
    "aiScore" DOUBLE PRECISION NOT NULL,
    "aiResult" TEXT NOT NULL,
    "criterion" DOUBLE PRECISION NOT NULL,
    "model" TEXT NOT NULL DEFAULT 'fast-detect-gpt',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Result_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Result_documentId_idx" ON "Result"("documentId");

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
