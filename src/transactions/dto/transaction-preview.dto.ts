export class TransactionPreviewDto {
  id: number; // Mapped from Transaccion
  sourceId: number; // Original ID from Pago.Id or Transito.Transaccion
  date: Date; // Mapped from Fecha
  amount: number; // Mapped from Importe
  description: string; // Combined from Estacion / Cabina
  station?: string; // Keep original station ID/code if needed
  booth?: string; // Mapped from Cabina
  tagNumber?: number; // Mapped from TagNro (optional)
  // Updated types based on PagoMotivo and Transitos
  type: 'peaje' | 'recarga_contrato' | 'venta_tag' | 'ajuste_contrato' | 'recarga_convenio' | 'otro'; // Added transaction type
} 