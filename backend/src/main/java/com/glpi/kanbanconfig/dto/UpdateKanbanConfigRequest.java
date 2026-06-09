package com.glpi.kanbanconfig.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record UpdateKanbanConfigRequest(
        @NotNull
        @Size(min = 3, max = 3, message = "La configuration doit contenir exactement 3 colonnes")
        List<@Valid UpdateKanbanColumnDto> columns
) {
}
