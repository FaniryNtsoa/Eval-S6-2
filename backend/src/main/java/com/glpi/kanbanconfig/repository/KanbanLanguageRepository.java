package com.glpi.kanbanconfig.repository;

import com.glpi.kanbanconfig.model.KanbanLanguage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface KanbanLanguageRepository extends JpaRepository<KanbanLanguage, String> {
}
