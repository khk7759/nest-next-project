import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'fallback-secret',
        });
    }

    // 서명 + 만료 검증 통과 후 호출됨
    validate(payload: { sub: string; username: string }) {
        // 이 리턴값이 request.user에 들어감
        return { userId: payload.sub, username: payload.username };
    }
}
