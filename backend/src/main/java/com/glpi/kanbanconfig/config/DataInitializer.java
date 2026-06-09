package com.glpi.kanbanconfig.config;

import com.glpi.kanbanconfig.constants.KanbanDefaults;
import com.glpi.kanbanconfig.repository.KanbanColumnRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final KanbanColumnRepository repository;

    public DataInitializer(KanbanColumnRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) {
        if (repository.count() == 0) {
            repository.saveAll(KanbanDefaults.defaultColumns());
        }
    }
}
