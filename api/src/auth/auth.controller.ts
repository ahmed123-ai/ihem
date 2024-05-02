import { Body, Controller, Get, HttpCode, HttpStatus, Param,  Post,  Req,  Request,  UseGuards,  ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { changeMyPassword, forgetPasswordDto, loginDto, passCodeDto, registerDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
 

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) { }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    login(@Body() dto: loginDto) {
        return this.authService.login(dto)
    }

    @HttpCode(HttpStatus.OK)
    @Post('registerToken')
    registerToken(@Body() dto: registerDto) {
        return this.authService.registerToken(dto)
    }

    @HttpCode(HttpStatus.OK)
    @Get('validate-token/:token')
    validateToken(@Param('token', new ValidationPipe({ transform: true })) token: string) {
        return this.authService.validateToken(token)
    }
    @HttpCode(HttpStatus.OK)
    @Post('registerPassCode')
    registerPassCode(@Body() dto: registerDto) {
        return this.authService.registerPassCode(dto)
    }

    @HttpCode(HttpStatus.OK)
    @Post('validate')
    validateCode(@Body() dto: passCodeDto) {
        return this.authService.validateCode(dto)
    }
    @HttpCode(HttpStatus.OK)
    @Post('forget-password')
    forgetPassword(@Body() dto: forgetPasswordDto) {
        return this.authService.forgetPasswordCode(dto)
    }
    
    @HttpCode(HttpStatus.OK)
    @Post('forget-password/validCode')
    valideCodeFrogetPassword(@Body() dto: passCodeDto) {
        return this.authService.valideCodeFrogetPassword(dto)
    }

    @HttpCode(HttpStatus.OK)
    @Post('forget-password-token')
    forgetPasswordToken(@Body() dto: forgetPasswordDto) {
        return this.authService.forgetPasswordToken(dto)
    }
    @HttpCode(HttpStatus.OK)
    @Post('resend-validation')
    resendValidationCode(@Body() dto: forgetPasswordDto) {
        return this.authService.resendValidationPassCode(dto)
    }
    @HttpCode(HttpStatus.OK)
    @Post('resend-validation-token')
    resendValidationToken(@Body() dto: forgetPasswordDto) {
        return this.authService.resendValidationToken(dto)
    }

    @HttpCode(HttpStatus.OK)
    @Get('forget-password-token/:token')
    valideTokenFrogetPassword(@Param('token', new ValidationPipe({ transform: true })) token: string) {
        return this.authService.valideTokenForgetPassword(token)
    }

    @HttpCode(HttpStatus.OK)
    @Post('change-my-password')
    chnageMyPassword(@Body() dto: changeMyPassword) {
        return this.authService.changeMyPassword(dto)
    }
  
      @HttpCode(HttpStatus.OK)
      @UseGuards(AuthGuard("jwt"))
      @Get('')
      listingUser(@Req() req: Request) {
          return this.authService.listingUser()
      }
 
      @Post('sendSms')
       sendSms(@Req()  req :Request){
         return this.authService.sendSms()
      }

}
