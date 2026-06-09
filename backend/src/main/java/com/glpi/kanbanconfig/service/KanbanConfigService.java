package com.glpi.kanbanconfig.service;

import com.glpi.kanbanconfig.constants.KanbanDefaults;
import com.glpi.kanbanconfig.dto.KanbanColumnDto;
import com.glpi.kanbanconfig.dto.KanbanConfigResponse;
import com.glpi.kanbanconfig.dto.UpdateKanbanColumnDto;
import com.glpi.kanbanconfig.dto.UpdateKanbanConfigRequest;
import com.glpi.kanbanconfig.model.KanbanColumn;
import com.glpi.kanbanconfig.repository.KanbanColumnRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class KanbanConfigService {

    private final KanbanColumnRepository repository;

    public KanbanConfigService(KanbanColumnRepository repository) {
        this.repository = repository;
    }

    public KanbanConfigResponse getConfig() {
        List<KanbanColumnDto> columns = repository.findAll().stream()
                .sorted(Comparator.comparing(KanbanColumn::getStatusId))
                .map(this::toDto)
                .toList();

        return new KanbanConfigResponse(columns);
    }

    @Transactional
    public KanbanConfigResponse updateConfig(UpdateKanbanConfigRequest request) {
        validateStatusIds(request.columns());

        for (UpdateKanbanColumnDto columnDto : request.columns()) {
            KanbanColumn column = repository.findById(columnDto.statusId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Colonne introuvable pour le statut " + columnDto.statusId()
                    ));

            column.setLabelMg(columnDto.labelMg().trim());
            column.setBackgroundColor(columnDto.backgroundColor().toUpperCase());
            repository.save(column);
        }

        return getConfig();
    }

    private void validateStatusIds(List<UpdateKanbanColumnDto> columns) {
        Set<Integer> providedIds = columns.stream()
                .map(UpdateKanbanColumnDto::statusId)
                .collect(Collectors.toSet());

        if (!providedIds.equals(Set.copyOf(KanbanDefaults.STATUS_IDS))) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Les statuts autorisés sont : " + KanbanDefaults.STATUS_IDS
            );
        }
    }

    private KanbanColumnDto toDto(KanbanColumn column) {
        String labelFr = KanbanDefaults.FRENCH_LABELS.getOrDefault(column.getStatusId(), "Inconnu");
        return new KanbanColumnDto(
                column.getStatusId(),
                labelFr,
                column.getLabelMg(),
                column.getBackgroundColor()
        );
    }
}
