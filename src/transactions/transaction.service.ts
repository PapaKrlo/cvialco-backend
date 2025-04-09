import { Injectable, NotFoundException } from '@nestjs/common';
import { TransactionPreviewDto } from './dto/transaction-preview.dto';
import { TransactionDetailDto } from './dto/transaction-detail.dto';

@Injectable()
export class TransactionService {

  // Map for Estacion IDs to Names
  private stationNames = { '1': 'Chongón', '2': 'Playas', '3': 'Olmedo' };

  // Map for PagoMotivo IDs to details
  private pagoMotivoMap = {
    1: { name: 'Recarga Contrato', type: 'recarga_contrato', sign: 1 },
    2: { name: 'Venta TAG', type: 'venta_tag', sign: -1 },
    3: { name: 'Ajuste Contrato', type: 'ajuste_contrato', sign: 1 }, // Assuming Adjustments can be +/-? Defaulting to +
    4: { name: 'Recarga Convenio', type: 'recarga_convenio', sign: 1 },
  };

  // Mock data combining Transitos and Pagos
  private mockCombinedTransactions: any[] = [
    // Transitos (Peajes) - Keep relevant ones for Contrato 2
    { sourceTable: 'Transitos', Transaccion: 1, Estacion: '1', Cabina: 'CHG-02A', Fecha: new Date('2020-06-18T01:56:18'), TagNro: 96036584, Importe: 1.00, Contrato: 2, Dominio: 'GTA6155' },
    { sourceTable: 'Transitos', Transaccion: 10, Estacion: '1', Cabina: 'CAB_01', Fecha: new Date('2024-04-09T10:00:00'), TagNro: 96036584, Importe: 1.50, Contrato: 2, Dominio: 'GBC1234' },
    { sourceTable: 'Transitos', Transaccion: 11, Estacion: '3', Cabina: 'CAB_03', Fecha: new Date('2024-04-08T15:30:00'), TagNro: 96036584, Importe: 2.00, Contrato: 2, Dominio: 'PXY4567' },
    { sourceTable: 'Transitos', Transaccion: 12, Estacion: '1', Cabina: 'CAB_02', Fecha: new Date('2024-04-07T08:15:00'), TagNro: 96036584, Importe: 1.50, Contrato: 2, Dominio: 'GBC1234' },
    { sourceTable: 'Transitos', Transaccion: 13, Estacion: '2', Cabina: 'CAB_01', Fecha: new Date('2024-04-06T18:45:00'), TagNro: 96036584, Importe: 3.00, Contrato: 2, Dominio: 'GTR7890' },
    { sourceTable: 'Transitos', Transaccion: 14, Estacion: '1', Cabina: 'CAB_01', Fecha: new Date('2024-04-05T12:00:00'), TagNro: 96036584, Importe: 1.50, Contrato: 2, Dominio: 'GBC1234' },
    { sourceTable: 'Transitos', Transaccion: 86369880, Estacion: '3', Cabina: 'OLM-09A', Fecha: new Date('2025-01-13T00:49:02.043'), TagNro: 2001577, Importe: 5.00, Contrato: 2, Dominio: 'GBP2740' },

    // Pagos (Recargas, Ventas, etc.)
    { sourceTable: 'Pagos', Id: 552929, Contrato: 2, Motivo: 1, Monto: 6.00, Fecha: new Date('2025-01-13T00:35:16.907') },
    { sourceTable: 'Pagos', Id: 552928, Contrato: 12531, Motivo: 1, Monto: 24.00, Fecha: new Date('2025-01-13T00:34:57.530') },
    { sourceTable: 'Pagos', Id: 552927, Contrato: 9216, Motivo: 1, Monto: 15.00, Fecha: new Date('2025-01-12T22:37:21.697') },
    { sourceTable: 'Pagos', Id: -100, Contrato: 2, Motivo: 2, Monto: 7.19, Fecha: new Date('2024-04-01T11:00:00') },

  ];

  // Renamed and added date filtering + optional limit
  async getTransactions(
    contractId: number, 
    limit?: number, 
    startDate?: Date, 
    endDate?: Date
  ): Promise<TransactionPreviewDto[]> {
    console.log(`TransactionService: Getting transactions for contractId: ${contractId}, limit: ${limit}, startDate: ${startDate}, endDate: ${endDate}`);

    // Filter by contractId first
    let filtered = this.mockCombinedTransactions.filter(t => t.Contrato === contractId);

    // Filter by startDate if provided
    if (startDate) {
        // Ensure comparison is done correctly (Date objects)
        filtered = filtered.filter(t => t.Fecha.getTime() >= startDate.getTime());
    }

    // Filter by endDate if provided
    if (endDate) {
        // Add 1 day to endDate to make it inclusive of the whole day
        const inclusiveEndDate = new Date(endDate);
        inclusiveEndDate.setDate(inclusiveEndDate.getDate() + 1);
        filtered = filtered.filter(t => t.Fecha.getTime() < inclusiveEndDate.getTime());
    }

    // Sort by date descending (always applied)
    const sorted = filtered.sort((a, b) => b.Fecha.getTime() - a.Fecha.getTime());

    // Apply limit *only if* it's provided
    const limited = limit ? sorted.slice(0, limit) : sorted;

    // Map to DTO (logic remains the same as before)
    const result = limited.map(t => {
      let dto: Partial<TransactionPreviewDto> = {}; 
      if (t.sourceTable === 'Transitos') {
        const stationName = this.stationNames[t.Estacion] || `Estación ${t.Estacion}`;
        dto.id = t.Transaccion; 
        dto.sourceId = t.Transaccion;
        dto.date = t.Fecha;
        dto.amount = -Math.abs(t.Importe); 
        dto.description = `Peaje - ${stationName}`;
        dto.type = 'peaje';
      } else if (t.sourceTable === 'Pagos') {
        const motivoInfo = this.pagoMotivoMap[t.Motivo] || { name: 'Otro Pago', type: 'otro', sign: 1 };
        dto.id = -t.Id; 
        dto.sourceId = t.Id;
        dto.date = t.Fecha;
        dto.amount = motivoInfo.sign * Math.abs(t.Monto);
        dto.description = motivoInfo.name;
        dto.type = motivoInfo.type as any;
      }
      return dto as TransactionPreviewDto;
    });

    console.log(`TransactionService: Returning ${result.length} transactions.`);
    return result.filter(dto => dto && dto.id !== undefined);
  }

  // --- NEW METHOD: Get Transaction Detail --- 
  async getTransactionDetail(transactionId: number): Promise<TransactionDetailDto> {
    console.log(`TransactionService: Getting detail for transactionId: ${transactionId}`);

    // Find the transaction in mock data (ONLY looking in Transitos for now)
    // Note: We are using 'Transaccion' field for matching the ID from the Preview DTO
    const transit = this.mockCombinedTransactions.find(
      t => t.sourceTable === 'Transitos' && t.Transaccion === transactionId
    );

    if (!transit) {
      console.error(`TransactionService: Transit with ID ${transactionId} not found.`);
      // In a real app, you might query dbo.Pago here if not found in Transitos
      throw new NotFoundException(`Detalle de transacción con ID ${transactionId} no encontrado.`);
    }

    // Format the date and time
    const transactionDate = new Date(transit.Fecha);
    let formattedDate = transactionDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (transactionDate.toDateString() === today.toDateString()) formattedDate = 'Hoy';
    else if (transactionDate.toDateString() === yesterday.toDateString()) formattedDate = 'Ayer';
    const formattedTime = transactionDate.toLocaleTimeString('es-ES', { hour: 'numeric', minute: '2-digit' }).replace('.', '').toLowerCase();
    const fullFormattedDate = `${formattedDate}, ${formattedTime}`;

    // Map to TransactionDetailDto
    const detailDto: TransactionDetailDto = {
      fecha: fullFormattedDate,
      monto: transit.Importe, // Show positive amount in detail view
      tipo: 'Débito', // Always 'Débito' for Transitos
      placa: transit.Dominio || 'N/A', // Use 'Dominio' field, provide fallback
      teletag: transit.TagNro, // Use 'TagNro'
      motivo: 'Tránsito', // Always 'Tránsito' for Transitos
      estacion: this.stationNames[transit.Estacion] || `Estación ${transit.Estacion}`, // Use map
      cabina: transit.Cabina,
    };

    console.log(`TransactionService: Returning detail:`, detailDto);
    return detailDto;
  }
  // --------------------------------------- 
} 