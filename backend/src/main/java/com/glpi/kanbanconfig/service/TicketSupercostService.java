package com.glpi.kanbanconfig.service;

import com.glpi.kanbanconfig.dto.SaveTicketSupercostRequest;
import com.glpi.kanbanconfig.dto.TicketSupercostDto;
import com.glpi.kanbanconfig.model.TicketSupercost;
import com.glpi.kanbanconfig.repository.TicketSupercostRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;

@Service
public class TicketSupercostService {

    private final TicketSupercostRepository repository;

    public TicketSupercostService(TicketSupercostRepository repository) {
        this.repository = repository;
    }

    public List<TicketSupercostDto> listAll() {
        return repository.findAll().stream()
                .sorted(Comparator.comparing(TicketSupercost::getTicketId))
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public TicketSupercostDto save(SaveTicketSupercostRequest request) {
        TicketSupercost entity = repository.findByTicketId(request.ticketId())
                .orElseGet(TicketSupercost::new);

        entity.setTicketId(request.ticketId());
        entity.setAmount(request.amount());

        if (entity.getCreatedAt() == null) {
            entity.setCreatedAt(Instant.now().toString());
        }

        return toDto(repository.save(entity));
    }

    @Transactional
    public void deleteAll() {
        repository.deleteAll();
    }

    private TicketSupercostDto toDto(TicketSupercost entity) {
        return new TicketSupercostDto(
                entity.getId(),
                entity.getTicketId(),
                entity.getAmount(),
                entity.getCreatedAt()
        );
    }
}
