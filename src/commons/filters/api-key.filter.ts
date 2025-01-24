import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  UnauthorizedException,
} from '@nestjs/common';

@Catch(UnauthorizedException)
export class ApiKeyExceptionFilter implements ExceptionFilter {
  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    response.status(401).json({
      statusCode: 401,
      message: 'Unauthorized!',
      error: 'Invalid API Key.',
    });
  }
}
