import { Controller, Get, Req, UseGuards, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ContractService } from './contract.service';
import { ContractSummaryDto } from './dto/contract-summary.dto';
import { ContractListDetailDto } from './dto/contract-list-detail.dto';
// import { AuthGuard } from '@nestjs/passport'; // Assuming JWT strategy is default

@Controller('contracts')
// @UseGuards(AuthGuard()) // Protect routes - requires JWT setup later
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  @Get('summary')
  async getContractSummary(
    @Req() req,
    @Query('contractId', new ParseIntPipe({ optional: true })) specificContractId?: number
  ): Promise<ContractSummaryDto> {
    const simulatedUserId = 1; // Assuming the logged-in user is ID 1
    console.log(`Request received for /contracts/summary, contractId: ${specificContractId}`);
    return this.contractService.getContractSummary(simulatedUserId, specificContractId);
  }

  @Get()
  async getAllUserContracts(@Req() req): Promise<ContractListDetailDto[]> {
    const simulatedUserId = 1; // Assuming the logged-in user is ID 1
    console.log('Request received for /contracts (get all)');
    return this.contractService.getAllContractsForUser(simulatedUserId);
  }
} 