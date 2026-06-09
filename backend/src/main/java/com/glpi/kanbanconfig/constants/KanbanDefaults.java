package com.glpi.kanbanconfig.constants;

import com.glpi.kanbanconfig.model.KanbanColumn;

import java.util.List;
import java.util.Map;

public final class KanbanDefaults {

    public static final List<Integer> STATUS_IDS = List.of(1, 2, 5);

    public static final Map<Integer, String> FRENCH_LABELS = Map.of(
            1, "Nouveau",
            2, "In progress",
            5, "Terminé"
    );

    private KanbanDefaults() {
    }

    public static List<KanbanColumn> defaultColumns() {
        return List.of(
                new KanbanColumn(1, "Vaovao", "#E0F2FE"),
                new KanbanColumn(2, "Efa manao", "#EDE9FE"),
                new KanbanColumn(5, "Vita", "#D1FAE5")
        );
    }
}
