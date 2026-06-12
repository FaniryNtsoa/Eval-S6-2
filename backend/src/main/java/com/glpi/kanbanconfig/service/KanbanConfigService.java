package com.glpi.kanbanconfig.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.glpi.kanbanconfig.constants.KanbanDefaults;
import com.glpi.kanbanconfig.dto.AddKanbanLanguageRequest;
import com.glpi.kanbanconfig.dto.KanbanColumnDto;
import com.glpi.kanbanconfig.dto.KanbanConfigResponse;
import com.glpi.kanbanconfig.dto.KanbanLanguageDto;
import com.glpi.kanbanconfig.dto.UpdateKanbanColumnDto;
import com.glpi.kanbanconfig.dto.UpdateKanbanConfigRequest;
import com.glpi.kanbanconfig.model.KanbanColumn;
import com.glpi.kanbanconfig.model.KanbanLanguage;
import com.glpi.kanbanconfig.repository.KanbanColumnRepository;

@Service
public class KanbanConfigService {

    private final KanbanColumnRepository repository;
    private final KanbanLabelColumnService labelColumnService;

    public KanbanConfigService(
            KanbanColumnRepository repository,
            KanbanLabelColumnService labelColumnService
    ) {
        this.repository = repository;
        this.labelColumnService = labelColumnService;
    }

    public KanbanConfigResponse getConfig() {
        List<KanbanColumnDto> columns = repository.findAll().stream()
                .sorted(Comparator.comparing(KanbanColumn::getStatusId))
                .map(this::toDto)
                .toList();

        return new KanbanConfigResponse(buildLanguageDtos(), columns);
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

            column.setBackgroundColor(columnDto.backgroundColor().toUpperCase());

            if (columnDto.labels().containsKey(KanbanLabelColumnService.MALAGASY_CODE)) {
                column.setLabelMg(columnDto.labels().get(KanbanLabelColumnService.MALAGASY_CODE).trim());
            }

            repository.save(column);
            labelColumnService.writeLabelsForStatus(columnDto.statusId(), columnDto.labels());
        }

        return getConfig();
    }

    @Transactional
    public KanbanConfigResponse addLanguage(AddKanbanLanguageRequest request) {
        labelColumnService.addLanguage(request.code(), request.name());
        return getConfig();
    }

    @Transactional
    public KanbanConfigResponse removeLanguage(String code) {
        labelColumnService.removeLanguage(code);
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

    private List<KanbanLanguageDto> buildLanguageDtos() {
        List<KanbanLanguageDto> languages = new ArrayList<>();
        languages.add(new KanbanLanguageDto(
                KanbanLabelColumnService.FRENCH_CODE,
                "Français"
        ));

        for (KanbanLanguage language : labelColumnService.listStoredLanguages()) {
            languages.add(new KanbanLanguageDto(language.getCode(), language.getName()));
        }

        return languages;
    }

    private KanbanColumnDto toDto(KanbanColumn column) {
        return new KanbanColumnDto(
                column.getStatusId(),
                column.getBackgroundColor(),
                labelColumnService.readLabelsForStatus(column.getStatusId())
        );
    }
}
