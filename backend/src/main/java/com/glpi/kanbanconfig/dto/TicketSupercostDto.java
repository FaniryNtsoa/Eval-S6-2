package com.glpi.kanbanconfig.dto;

public record TicketSupercostDto(
        long id,
        int ticketId,
        double amount,
        String createdAt
) {
}
