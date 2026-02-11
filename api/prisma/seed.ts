import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
    // 기존 데이터 정리
    await prisma.gameAnswer.deleteMany();
    await prisma.gameSession.deleteMany();
    await prisma.question.deleteMany();
    await prisma.challenge.deleteMany();

    // 챌린지 + 문제 3개 생성
    const challenge = await prisma.challenge.create({
        data: {
            slug: 'ch00001',
            title: 'AI vs Human 챌린지 #1',
            description:
                '과연 AI와 사람의 사진을 구별할 수 있을까요? 3문제에 도전해보세요!',
            questions: {
                create: [
                    {
                        order: 1,
                        humanImageUrl:
                            'https://images.unsplash.com/photo-1761839259484-4741afbbdcbf?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                        humanAuthor: 'Unsplash 작가',
                        humanSourceUrl:
                            'https://unsplash.com/photos/photo-1761839259484-4741afbbdcbf',
                        aiImageUrl:
                            'https://images.unsplash.com/photo-1770425033997-7110b9c23c9e?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                        aiModel: 'Midjourney v6',
                    },
                    {
                        order: 2,
                        humanImageUrl:
                            'https://images.unsplash.com/photo-1770425033997-7110b9c23c9e?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                        humanAuthor: 'Unsplash 작가',
                        humanSourceUrl:
                            'https://unsplash.com/photos/photo-1770425033997-7110b9c23c9e',
                        aiImageUrl:
                            'https://images.unsplash.com/photo-1770035183754-40166582f83f?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                        aiModel: 'DALL-E 3',
                    },
                    {
                        order: 3,
                        humanImageUrl:
                            'https://images.unsplash.com/photo-1770035183754-40166582f83f?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                        humanAuthor: 'Unsplash 작가',
                        humanSourceUrl:
                            'https://unsplash.com/photos/photo-1770035183754-40166582f83f',
                        aiImageUrl:
                            'https://images.unsplash.com/photo-1761839259484-4741afbbdcbf?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                        aiModel: 'Gemini 3 Pro Image',
                    },
                ],
            },
        },
        include: { questions: true },
    });

    console.log(`챌린지 생성 완료: ${challenge.title}`);
    console.log(`문제 ${challenge.questions.length}개 등록됨`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
