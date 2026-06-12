package com.glpi.kanbanconfig.repository;

import com.glpi.kanbanconfig.model.TicketSupercost;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TicketSupercostRepository extends JpaRepository<TicketSupercost, Long> {
    Optional<TicketSupercost> findByTicketId(Integer ticketId);
}
