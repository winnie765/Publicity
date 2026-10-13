CREATE TABLE "facebook_followers" (
 "id" TEXT NOT NULL PRIMARY KEY,
 "snapshot_date" DATE NOT NULL UNIQUE,
 "follower_count" INTEGER NOT NULL CHECK ("follower_count" >= 0),
 "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updated_at" TIMESTAMP(3) NOT NULL
);
