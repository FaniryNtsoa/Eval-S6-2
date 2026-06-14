package com.glpi.kanbanconfig.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record SaveTicketReopenCostRequest(
        @NotNull Integer ticketId,
        @NotNull @Positive Double percentage
) {
}
