package com.glpi.kanbanconfig.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "kanban_language")
public class KanbanLanguage {

    @Id
    @Column(length = 10)
    private String code;

    @Column(nullable = false)
    private String name;

    public KanbanLanguage() {
    }

    public KanbanLanguage(String code, String name) {
        this.code = code;
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
