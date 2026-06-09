package com.glpi.kanbanconfig.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UpdateKanbanColumnDto(
        int statusId,

        @NotBlank(message = "Le libellé malgache est requis")
        String labelMg,

        @NotBlank(message = "La couleur est requise")
        @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "La couleur doit être au format hex (#RRGGBB)")
        String backgroundColor
) {
}
