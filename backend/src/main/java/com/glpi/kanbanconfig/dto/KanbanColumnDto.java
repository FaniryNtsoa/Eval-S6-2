package com.glpi.kanbanconfig.dto;

import java.util.Map;

public record KanbanColumnDto(
        int statusId,
        String backgroundColor,
        Map<String, String> labels
) {
}
