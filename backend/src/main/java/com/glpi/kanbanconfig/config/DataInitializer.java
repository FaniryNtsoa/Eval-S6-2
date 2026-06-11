package com.glpi.kanbanconfig.config;

import com.glpi.kanbanconfig.constants.KanbanDefaults;
import com.glpi.kanbanconfig.model.KanbanColumn;
import com.glpi.kanbanconfig.repository.KanbanColumnRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Optional;

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
            return;
        }

        migrateResolvedColumnToClosed();
    }

    private void migrateResolvedColumnToClosed() {
        Optional<KanbanColumn> resolvedColumn = repository.findById(5);
        if (resolvedColumn.isEmpty() || repository.existsById(6)) {
            return;
        }

        KanbanColumn column = resolvedColumn.get();
        repository.delete(column);
        repository.save(new KanbanColumn(6, column.getLabelMg(), column.getBackgroundColor()));
    }
}
