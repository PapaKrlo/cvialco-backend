import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  Documento: string;

  @IsString()
  @IsNotEmpty()
  Contrasenia: string; // Por ahora lo manejaremos como string
} 