-- CreateIndex
CREATE INDEX "Entity_latitude_longitude_idx" ON "Entity"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "TimelineEvent_organizationId_entityId_occurredAt_idx" ON "TimelineEvent"("organizationId", "entityId", "occurredAt");

-- CreateIndex
CREATE INDEX "TimelineEvent_organizationId_kind_occurredAt_idx" ON "TimelineEvent"("organizationId", "kind", "occurredAt");
