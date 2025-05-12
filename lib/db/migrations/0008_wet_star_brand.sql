CREATE TABLE IF NOT EXISTS "FolderChat" (
	"folderId" uuid NOT NULL,
	"chatId" uuid NOT NULL,
	CONSTRAINT "FolderChat_folderId_chatId_pk" PRIMARY KEY("folderId","chatId")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "FolderChat" ADD CONSTRAINT "FolderChat_folderId_Folder_id_fk" FOREIGN KEY ("folderId") REFERENCES "public"."Folder"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "FolderChat" ADD CONSTRAINT "FolderChat_chatId_Chat_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."Chat"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
