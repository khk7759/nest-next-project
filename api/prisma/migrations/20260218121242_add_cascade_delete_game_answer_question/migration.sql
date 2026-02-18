-- DropForeignKey
ALTER TABLE "game_answers" DROP CONSTRAINT "game_answers_questionId_fkey";

-- AddForeignKey
ALTER TABLE "game_answers" ADD CONSTRAINT "game_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
