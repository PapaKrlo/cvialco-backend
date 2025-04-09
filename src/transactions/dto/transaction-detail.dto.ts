export class TransactionDetailDto {
  fecha: string; // Formatted date and time string
  monto: number; // Importe from Transitos
  tipo: string; // Always 'Débito' for transits
  placa: string; // Mapped from 'Dominio'
  teletag: number; // Mapped from 'TagNro'
  motivo: string; // Always 'Tránsito' for transits
  estacion: string; // Mapped from 'Estacion' (using stationNames map)
  cabina: string; // Mapped from 'Cabina'
} 