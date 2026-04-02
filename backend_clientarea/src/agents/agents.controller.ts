import { Controller, Get, Param, Post, Body, Req, Res } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { Response } from 'express';

@Controller('agent')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  /**
   * Get online agents in company
   * GET /agent/online
   * POST /agent/online (for compatibility with backend_v2)
   * Similar to backend_v2: GET /agent/online
   */
  @Get('online')
  @Post('online')
  async getOnlineAgents(@Req() request: any, @Body() body: any, @Res() res: Response) {
    try {
      // Get company name from request
      // In backend_v2, this comes from req.body.user.company_name after token verification
      // Try multiple sources: body.user, request.user, session
      const companyName =
        body?.user?.company_name ||
        request.body?.user?.company_name ||
        request.user?.company_name ||
        request.session?.user?.company_name;

      if (!companyName) {
        return res.status(400).json({
          success: false,
          message: 'Company name not found. Please provide company_name in request.',
          data: [],
          code: 400,
        });
      }

      const onlineAgents = await this.agentsService.getOnlineAgents(companyName);

      return res.status(200).json({
        success: true,
        message: 'Successfully get online agents',
        data: onlineAgents,
        code: 200,
      });
    } catch (error) {
      console.error('Error getting online agents:', error);
      return res.status(500).json({
        success: false,
        message: `Error getting online agents: ${error.message}`,
        data: [],
        code: 500,
      });
    }
  }

  /**
   * Get agent detail by ID
   * GET /agent/online/:id
   * Similar to backend_v2: GET /agent/online/:id
   */
  @Get('online/:id')
  async getAgentDetail(@Param('id') id: string) {
    try {
      const agentDetail = await this.agentsService.getAgentDetail(id);

      if (!agentDetail) {
        return {
          success: false,
          message: 'Agent not found',
          data: null,
          code: 404,
        };
      }

      return {
        success: true,
        message: 'Successfully get agent detail',
        data: agentDetail,
        code: 200,
      };
    } catch (error) {
      return {
        success: false,
        message: `Error getting agent detail: ${error.message}`,
        data: null,
        code: 500,
      };
    }
  }
}

