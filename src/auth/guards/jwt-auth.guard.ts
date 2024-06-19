import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard {
    static readonly ACCESS_TOKEN = AuthGuard('jwt-access');
    static readonly REFRESH_TOKEN = AuthGuard('jwt-refresh');
}
