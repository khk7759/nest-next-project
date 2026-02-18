import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api'); // 글로벌 접두사 설정
    app.enableCors(); // 프론트(Next.js)에서 API 호출 허용

    // 전역 파이프 설정
    app.useGlobalPipes(
        // 유효성 검사 파이프
        new ValidationPipe({
            whitelist: true, // DTO에 정의 안 된 필드 자동 제거
            forbidNonWhitelisted: true, // 정의 안 된 필드 보내면 400 에러
            transform: true, // 문자열 → 숫자 자동 변환
        }),
    );
    const config = new DocumentBuilder()
        .setTitle('AI vs Human Quiz API')
        .setDescription(
            'AI가 생성한 이미지와 실제 사진을 구별하는 퀴즈 플랫폼 API',
        )
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
