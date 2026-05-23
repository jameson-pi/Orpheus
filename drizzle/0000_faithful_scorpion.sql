CREATE TABLE "orpheus_conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orpheus_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orpheus_messages" ADD CONSTRAINT "orpheus_messages_conversation_id_orpheus_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."orpheus_conversations"("id") ON DELETE no action ON UPDATE no action;