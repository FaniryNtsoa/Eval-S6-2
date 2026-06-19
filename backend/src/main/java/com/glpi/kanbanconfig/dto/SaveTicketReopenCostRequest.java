package com.glpi.kanbanconfig.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record SaveTicketReopenCostRequest(
        @NotNull Integer ticketId,
        @NotNull @Positive Double percentage,
        @NotNull @Min(1) @Max(4) Integer mode
) {
}
