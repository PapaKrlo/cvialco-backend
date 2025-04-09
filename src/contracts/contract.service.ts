import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ContractSummaryDto } from './dto/contract-summary.dto';
import { ContractListDetailDto } from './dto/contract-list-detail.dto';

@Injectable()
export class ContractService {
  // Mock data store simulating Contrato table filtered by Cliente Id
  private mockContracts = {
    2: [ // Assuming ClienteId 2 (Fausto) corresponds to UsuarioId 1
      {
        contratoId: 2,
        numeroTeletags: 1, // Simulate based on previous query result for Fausto
        saldoContrato: 5.25,
        cliente: 'Fausto Villafuerte',
        clienteId: 2,
      },
      // Add another contract for Fausto
      {
        contratoId: 4450628, 
        numeroTeletags: 1, 
        saldoContrato: 70.75,
        cliente: 'Fausto Villafuerte',
        clienteId: 2,
      },
      {
        contratoId: 1237664, 
        numeroTeletags: 40, 
        saldoContrato: 525.00,
        cliente: 'Fausto Villafuerte',
        clienteId: 2,
      },
    ],
    3: [ // Example for another ClienteId 
         {
            contratoId: 3,
            numeroTeletags: 1, 
            saldoContrato: 0.00,
            cliente: 'Corporacion Maria Elena Comael C Ltda',
            clienteId: 3,
        }
    ]
    // Add other clienteIds and their contracts as needed
  };

  // Simulate mapping from userId (from Auth) to clienteId (from Cliente table)
  private userToClienteMap = {
    1: 2, // Assuming userId 1 maps to clienteId 2 (Fausto)
    // Add other mappings if needed
  };

  async getContractSummary(userId: number, specificContractId?: number): Promise<ContractSummaryDto> {
    console.log(`ContractService: Fetching summary for userId: ${userId}, specificContractId: ${specificContractId}`);
    
    const clienteId = this.userToClienteMap[userId];
    console.log(`ContractService: Mapped userId ${userId} to clienteId: ${clienteId}`);

    if (!clienteId) {
        console.warn(`ContractService: No clienteId found for userId: ${userId}`);
        throw new NotFoundException(`No se encontró cliente para el usuario ${userId}.`);
    }

    const contractsForClient = this.mockContracts[clienteId];
    
    if (!contractsForClient || contractsForClient.length === 0) {
        console.warn(`ContractService: No contracts found for clienteId: ${clienteId}`);
         return { 
            contratoId: 0, 
            numeroTeletags: 0,
            saldoContrato: 0.00,
            cliente: 'Cliente sin contratos', 
            clienteId: clienteId,
        };
    }

    let contractToReturn: ContractSummaryDto;

    if (specificContractId) {
      // Find the specific contract requested
      contractToReturn = contractsForClient.find(c => c.contratoId === specificContractId);
      if (!contractToReturn) {
        // Important: Ensure the requested contract actually belongs to this user/client
        console.warn(`ContractService: Contract ${specificContractId} not found or does not belong to clienteId: ${clienteId}`);
        throw new ForbiddenException(`Contrato ${specificContractId} no encontrado o no pertenece a este usuario.`);
      }
       console.log(`ContractService: Returning summary for specific contratoId: ${contractToReturn.contratoId}`);
    } else {
      // If no specific contract requested, return the first one (default behavior)
      contractToReturn = contractsForClient[0];
      console.log(`ContractService: Returning summary for default (first) contratoId: ${contractToReturn.contratoId}`);
    }
    
    return contractToReturn;
  }

   // Updated method to return details for all contracts
   async getAllContractsForUser(userId: number): Promise<ContractListDetailDto[]> { 
       const clienteId = this.userToClienteMap[userId];
       if (!clienteId) {
           throw new NotFoundException(`No se encontró cliente para el usuario ${userId}.`);
       }
       const contracts = this.mockContracts[clienteId] || [];
       console.log(`ContractService: Found ${contracts.length} contracts for clienteId: ${clienteId}`);
       
       // Return detailed info for the list
       return contracts.map(c => ({ 
           contratoId: c.contratoId,
           numeroTeletags: c.numeroTeletags,
           saldoContrato: c.saldoContrato 
        })); 
   }
   // ----------------------------------------------------------------------
} 