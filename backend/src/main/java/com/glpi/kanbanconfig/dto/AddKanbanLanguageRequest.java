package com.glpi.kanbanconfig.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AddKanbanLanguageRequest(
        @NotBlank(message = "Le code langue est requis")
        @Size(min = 2, max = 10, message = "Le code langue doit contenir entre 2 et 10 caractères")
        @Pattern(regexp = "^[a-z][a-z0-9_]*$", message = "Le code langue doit commencer par une lettre minuscule")
        String code,

        @NotBlank(message = "Le nom de la langue est requis")
        @Size(max = 50, message = "Le nom de la langue ne peut pas dépasser 50 caractères")
        String name
) {
}
