import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../services';
import { LoginDto, RegisterDto, TokenResponseDto } from '../dtos';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Return auth & refresh token', type: TokenResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  public async login(@Body() dto: LoginDto): Promise<TokenResponseDto> {
    return this.authService.login(dto);
  }

  @Post('register')
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 200, description: 'Return auth & refresh token', type: TokenResponseDto })
  @ApiResponse({ status: 400, description: 'User already exists' })
  public async register(@Body() dto: RegisterDto): Promise<TokenResponseDto> {
    return this.authService.register(dto);
  }
}
