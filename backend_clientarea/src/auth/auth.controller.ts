import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class AuthController {
  constructor() {}

  @Post('login')
  async login(@Body() body: any, @Res() res: Response) {
    try {
      console.log('🔐 Login request:', {
        email: body.email,
        agent_id: body.agent_id,
        token: body.token
      });

      // Format response sesuai dengan backend_v2
      // Backend_v2 menggunakan successResponseFormat yang mengembalikan:
      // { success: true, message: 'Successfully process the request.', data: true, code: 200 }

      // Backend_v2 login endpoint mengembalikan data: true (boolean)
      // karena session disimpan di server side

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Successfully process the request.',
        data: true,
        code: 200,
      });
    } catch (error) {
      console.error('❌ Error login:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: `Error login. ${error.message}`,
        data: null,
        code: 500,
      });
    }
  }
}

