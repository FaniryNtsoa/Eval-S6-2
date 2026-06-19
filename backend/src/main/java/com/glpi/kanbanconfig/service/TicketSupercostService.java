package com.glpi.kanbanconfig.service;

import com.glpi.kanbanconfig.dto.SaveTicketReopenCostRequest;
import com.glpi.kanbanconfig.dto.SaveTicketSupercostRequest;
import com.glpi.kanbanconfig.dto.TicketSupercostDto;
import com.glpi.kanbanconfig.model.TicketSupercost;
import com.glpi.kanbanconfig.repository.TicketSupercostRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

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
                .sorted(Comparator.comparing(TicketSupercost::getTicketId)
                        .thenComparing(TicketSupercost::getId))
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public TicketSupercostDto save(SaveTicketSupercostRequest request) {
        TicketSupercost entity = new TicketSupercost(
                request.ticketId(),
                request.amount(),
                TicketSupercost.MOVEMENT_SUPERCOST,
                Instant.now().toString()
        );

        return toDto(repository.save(entity));
    }

    @Transactional
    public void cancelLastSupercost(Integer ticketId) {
        TicketSupercost last = repository
                .findTopByTicketIdAndMovementTypeOrderByIdDesc(
                        ticketId,
                        TicketSupercost.MOVEMENT_SUPERCOST
                )
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Aucun supercost à annuler pour ce ticket"
                ));

        repository.delete(last);
    }

    @Transactional
    public TicketSupercostDto saveReopenCost(SaveTicketReopenCostRequest request) {
        List<TicketSupercost> baseCosts = repository.findByTicketIdOrderByIdDesc(request.ticketId()).stream()
                .filter(e -> TicketSupercost.MOVEMENT_SUPERCOST.equals(e.getMovementType()))
                .toList();

        if (baseCosts.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Aucun supercost de référence pour ce ticket"
            );
        }

        double baseAmount = computeBaseAmount(baseCosts, request.mode());
        double reopenAmount = baseAmount * request.percentage() / 100.0;

        TicketSupercost entity = new TicketSupercost(
                request.ticketId(),
                reopenAmount,
                TicketSupercost.MOVEMENT_REOPEN,
                Instant.now().toString()
        );
        entity.setMode(request.mode());

        return toDto(repository.save(entity));
    }

    private double computeBaseAmount(List<TicketSupercost> costs, int mode) {
        return switch (mode) {
            case 1 -> costs.get(0).getAmount();
            case 2 -> costs.get(costs.size() - 1).getAmount();
            case 3 -> costs.stream().mapToDouble(TicketSupercost::getAmount).average().orElse(0);
            case 4 -> costs.stream().mapToDouble(TicketSupercost::getAmount).sum();
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mode invalide (1..4)");
        };
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
                entity.getMovementType(),
                entity.getCreatedAt(),
                entity.getMode()
        );
        
    }
}
