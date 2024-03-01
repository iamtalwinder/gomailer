import { v4 as uuidv4 } from 'uuid';
import { BadRequestException, UnauthorizedException, Injectable } from '@nestjs/common';
import { translationKeys, EncryptionService } from 'src/common';
import { UserDocument, UserRole, UserService } from 'src/user';
import { LoginDto, RegisterDto, TokenResponseDto } from '../dtos';
import { TokenService } from './token.service';

const EMAIL_ALREADY_EXISTS: string = translationKeys.auth.emailAlreadyExists;
const INVALID_CREDENTIALS: string = translationKeys.auth.invalidCredentials;

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private tokenService: TokenService,
  ) {}

  async register(dto: RegisterDto): Promise<TokenResponseDto> {
    const { email, password, firstName, lastName } = dto;

    const hashedPassword = await EncryptionService.hash(password);
    const userExists: boolean = await this.userService.doesUserWithEmailExist(email);

    if (userExists) {
      throw new BadRequestException(EMAIL_ALREADY_EXISTS);
    }

    const user: UserDocument = await this.userService.create({
      email,
      firstName,
      lastName,
      password: hashedPassword,
      role: UserRole.customer,
    });

    return this.tokenService.issueToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }

  async login(dto: LoginDto): Promise<TokenResponseDto> {
    const { email, password } = dto;
    const user = await this.userService.findOne({ email });

    if (!user) {
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }

    const isPasswordValid = await EncryptionService.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }

    return this.tokenService.issueToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }

  public async issueAnonymousToken(): Promise<TokenResponseDto> {
    return this.tokenService.issueToken({
      id: uuidv4(),
      role: UserRole.anonymous,
    });
  }
}
