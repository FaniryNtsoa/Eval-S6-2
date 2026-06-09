package com.glpi.kanbanconfig.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "kanban_column")
public class KanbanColumn {

    @Id
    @Column(name = "status_id")
    private Integer statusId;

    @Column(name = "label_mg", nullable = false)
    private String labelMg;

    @Column(name = "background_color", nullable = false)
    private String backgroundColor;

    public KanbanColumn() {
    }

    public KanbanColumn(Integer statusId, String labelMg, String backgroundColor) {
        this.statusId = statusId;
        this.labelMg = labelMg;
        this.backgroundColor = backgroundColor;
    }

    public Integer getStatusId() {
        return statusId;
    }

    public void setStatusId(Integer statusId) {
        this.statusId = statusId;
    }

    public String getLabelMg() {
        return labelMg;
    }

    public void setLabelMg(String labelMg) {
        this.labelMg = labelMg;
    }

    public String getBackgroundColor() {
        return backgroundColor;
    }

    public void setBackgroundColor(String backgroundColor) {
        this.backgroundColor = backgroundColor;
    }
}
