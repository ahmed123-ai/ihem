import { AuthGuard } from '@nestjs/passport';

export class PrivateGuard extends AuthGuard('jwt') {
  constructor() {
    super();
  }
}
