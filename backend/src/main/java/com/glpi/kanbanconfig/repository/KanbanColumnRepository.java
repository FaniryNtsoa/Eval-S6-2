package com.glpi.kanbanconfig.repository;

import com.glpi.kanbanconfig.model.KanbanColumn;
import org.springframework.data.jpa.repository.JpaRepository;

public interface KanbanColumnRepository extends JpaRepository<KanbanColumn, Integer> {
}
