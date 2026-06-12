package com.glpi.kanbanconfig.controller;

import com.glpi.kanbanconfig.dto.AddKanbanLanguageRequest;
import com.glpi.kanbanconfig.dto.KanbanConfigResponse;
import com.glpi.kanbanconfig.dto.UpdateKanbanConfigRequest;
import com.glpi.kanbanconfig.service.KanbanConfigService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/kanban-config")
public class KanbanConfigController {

    private final KanbanConfigService service;

    public KanbanConfigController(KanbanConfigService service) {
        this.service = service;
    }

    @GetMapping
    public KanbanConfigResponse getConfig() {
        return service.getConfig();
    }

    @PutMapping
    public KanbanConfigResponse updateConfig(@Valid @RequestBody UpdateKanbanConfigRequest request) {
        return service.updateConfig(request);
    }

    @PostMapping("/languages")
    public KanbanConfigResponse addLanguage(@Valid @RequestBody AddKanbanLanguageRequest request) {
        return service.addLanguage(request);
    }

    @DeleteMapping("/languages/{code}")
    public KanbanConfigResponse removeLanguage(@PathVariable String code) {
        return service.removeLanguage(code);
    }
}
