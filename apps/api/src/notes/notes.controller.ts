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
import { NotesService } from './notes.service';
import { CreateNoteDto, ListNotesQueryDto, UpdateNoteDto } from './dto/note.dto';

@Controller('notes')
export class NotesController {
  constructor(private readonly notes: NotesService) {}

  @Get()
  @RequirePermission('investigation.read')
  list(
    @Req() request: AuthenticatedRequest,
    @Query() query: ListNotesQueryDto,
  ) {
    return this.notes.list(request.principal, query);
  }

  @Post()
  create(@Req() request: AuthenticatedRequest, @Body() dto: CreateNoteDto) {
    return this.notes.create(request.principal, dto);
  }

  @Get(':id')
  @RequirePermission('investigation.read')
  get(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.notes.get(request.principal, id);
  }

  @Patch(':id')
  update(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateNoteDto,
  ) {
    return this.notes.update(request.principal, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    await this.notes.remove(request.principal, id);
  }
}