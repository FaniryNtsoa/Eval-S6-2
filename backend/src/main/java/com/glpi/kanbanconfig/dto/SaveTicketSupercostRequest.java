package com.glpi.kanbanconfig.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record SaveTicketSupercostRequest(
        @NotNull Integer ticketId,
        @NotNull @PositiveOrZero Double amount
) {
}
