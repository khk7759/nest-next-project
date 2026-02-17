import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

const CDN =
    'https://res.cloudinary.com/dlwdt4cez/image/upload/f_auto,q_auto,w_800';

async function main() {
    // 기존 데이터 정리
    await prisma.gameAnswer.deleteMany();
    await prisma.gameSession.deleteMany();
    await prisma.question.deleteMany();
    await prisma.challenge.deleteMany();

    // 챌린지 + 문제 생성
    const challenge = await prisma.challenge.create({
        data: {
            slug: 'ch00001',
            title: '챌린지 #1',
            description:
                '과연 AI와 사람의 사진을 구별할 수 있을까요? 문제에 도전해보세요!',
            questions: {
                create: [
                    {
                        order: 1,
                        humanImageUrl: `${CDN}/v1771322592/unsplash_1_sl8zjr.jpg`,
                        humanAuthor: 'Unsplash 작가',
                        humanSourceUrl:
                            'https://unsplash.com/photos/photo-1761839259484-4741afbbdcbf',
                        aiImageUrl: `${CDN}/v1771322812/Gemini_1_r5et20.png`,
                        aiModel: 'Gemini Plus Image',
                    },
                    {
                        order: 2,
                        humanImageUrl: `${CDN}/v1771322576/unsplash_2_bum3bd.jpg`,
                        humanAuthor: 'Unsplash 작가',
                        humanSourceUrl:
                            'https://unsplash.com/photos/photo-1770425033997-7110b9c23c9e',
                        aiImageUrl: `${CDN}/v1771322800/Gemini_2_t6j87b.png`,
                        aiModel: 'Gemini Plus Image',
                    },
                    {
                        order: 3,
                        humanImageUrl: `${CDN}/v1771322585/unsplash_3_uzra5x.jpg`,
                        humanAuthor: 'Unsplash 작가',
                        humanSourceUrl:
                            'https://unsplash.com/photos/photo-1770035183754-40166582f83f',
                        aiImageUrl: `${CDN}/v1771322819/Gemini_3_ozogkn.png`,
                        aiModel: 'Gemini Plus Image',
                    },
                    {
                        order: 4,
                        humanImageUrl: `${CDN}/v1771322591/unsplash_4_balskm.jpg`,
                        humanAuthor: 'Unsplash 작가',
                        humanSourceUrl:
                            'https://unsplash.com/photos/photo-1770035183754-40166582f83f',
                        aiImageUrl: `${CDN}/v1771322830/Gemini_4_ixmstn.png`,
                        aiModel: 'Gemini Plus Image',
                    },
                    {
                        order: 5,
                        humanImageUrl: `${CDN}/v1771322588/unsplash_5_ylskqy.jpg`,
                        humanAuthor: 'Unsplash 작가',
                        humanSourceUrl:
                            'https://unsplash.com/photos/photo-1770035183754-40166582f83f',
                        aiImageUrl: `${CDN}/v1771322809/Gemini_5_co02qp.png`,
                        aiModel: 'Gemini Plus Image',
                    },
                    {
                        order: 6,
                        humanImageUrl: `${CDN}/v1771322602/unsplash_6_kdfria.jpg`,
                        humanAuthor: 'Unsplash 작가',
                        humanSourceUrl:
                            'https://unsplash.com/photos/photo-1770035183754-40166582f83f',
                        aiImageUrl: `${CDN}/v1771322786/ChatGPT_6_dpitsx.png`,
                        aiModel: 'ChatGPT Image',
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
