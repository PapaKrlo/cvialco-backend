import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  async login(loginDto: LoginDto): Promise<any> {
    // Lógica de autenticación simulada
    if (
      loginDto.Documento === '12345678' &&
      loginDto.Contrasenia === 'password'
    ) {
      // En un caso real, aquí buscarías el usuario en la BD
      // y verificarías la contraseña (considerando el formato varbinary)
      // También generarías un token JWT, ahora devolvemos un ejemplo
      return {
        message: 'Login exitoso!',
        userId: 1, 
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        // Ejemplo de token arriba
      };
    } else {
      throw new UnauthorizedException('Credenciales inválidas');
    }
  }
}
