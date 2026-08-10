import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { AuthenticatedRequest } from '../auth/principal';
import { RequirePermission } from '../rbac/require-permission.decorator';
import { TasksService } from './tasks.service';
import { CreateTaskDto, ListTasksQueryDto, UpdateTaskDto } from './dto/task.dto';

@Controller()
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get('investigations/:investigationId/tasks')
  @RequirePermission('investigation.read')
  list(
    @Req() request: AuthenticatedRequest,
    @Param('investigationId', new ParseUUIDPipe()) investigationId: string,
    @Query() query: ListTasksQueryDto,
  ) {
    return this.tasks.list(request.principal, investigationId, query);
  }

  @Post('investigations/:investigationId/tasks')
  @RequirePermission('investigation.update')
  create(
    @Req() request: AuthenticatedRequest,
    @Param('investigationId', new ParseUUIDPipe()) investigationId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasks.create(request.principal, investigationId, dto);
  }

  @Patch('tasks/:id')
  @RequirePermission('investigation.update')
  update(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasks.update(request.principal, id, dto);
  }

  @Delete('tasks/:id')
  @RequirePermission('investigation.update')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    await this.tasks.remove(request.principal, id);
  }
}