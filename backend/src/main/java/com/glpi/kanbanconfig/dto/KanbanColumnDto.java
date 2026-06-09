package com.glpi.kanbanconfig.dto;

public record KanbanColumnDto(
        int statusId,
        String labelFr,
        String labelMg,
        String backgroundColor
) {
}
