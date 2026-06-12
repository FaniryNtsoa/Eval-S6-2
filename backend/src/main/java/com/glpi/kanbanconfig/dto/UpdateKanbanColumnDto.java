package com.glpi.kanbanconfig.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.util.Map;

public record UpdateKanbanColumnDto(
        int statusId,

        @NotBlank(message = "La couleur est requise")
        @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "La couleur doit être au format hex (#RRGGBB)")
        String backgroundColor,

        @NotNull(message = "Les libellés sont requis")
        Map<String, String> labels
) {
}
