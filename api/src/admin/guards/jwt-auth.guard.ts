import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

//  Guard 자체는 코드가 거의 없음. AuthGuard('jwt')가 Passport에게 'jwt' 전략을 실행하라고 위임.
// 'jwt' 이름의 Strategy를 찾아서 실행
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
