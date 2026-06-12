package com.glpi.kanbanconfig.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record SaveTicketSupercostRequest(
        @NotNull Integer ticketId,
        @NotNull @Positive Double amount
) {
}
