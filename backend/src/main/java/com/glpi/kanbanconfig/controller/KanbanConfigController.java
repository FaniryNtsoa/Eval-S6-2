package com.glpi.kanbanconfig.controller;

import com.glpi.kanbanconfig.dto.AddKanbanLanguageRequest;
import com.glpi.kanbanconfig.dto.KanbanConfigResponse;
import com.glpi.kanbanconfig.dto.SaveTicketSupercostRequest;
import com.glpi.kanbanconfig.dto.TicketSupercostDto;
import com.glpi.kanbanconfig.dto.UpdateKanbanConfigRequest;
import com.glpi.kanbanconfig.service.KanbanConfigService;
import com.glpi.kanbanconfig.service.TicketSupercostService;

import java.util.List;
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
    private final TicketSupercostService supercostService;

    public KanbanConfigController(
            KanbanConfigService service,
            TicketSupercostService supercostService
    ) {
        this.service = service;
        this.supercostService = supercostService;
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

    @GetMapping("/supercosts")
    public List<TicketSupercostDto> listSupercosts() {
        return supercostService.listAll();
    }

    @PostMapping("/supercosts")
    public TicketSupercostDto saveSupercost(@Valid @RequestBody SaveTicketSupercostRequest request) {
        return supercostService.save(request);
    }

    @DeleteMapping("/supercosts")
    public void clearSupercosts() {
        supercostService.deleteAll();
    }
}
