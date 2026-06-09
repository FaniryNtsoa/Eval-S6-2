package com.glpi.kanbanconfig.dto;

import java.util.List;

public record KanbanConfigResponse(List<KanbanColumnDto> columns) {
}
