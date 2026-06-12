package com.glpi.kanbanconfig.service;

import com.glpi.kanbanconfig.constants.KanbanDefaults;
import com.glpi.kanbanconfig.model.KanbanLanguage;
import com.glpi.kanbanconfig.repository.KanbanLanguageRepository;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
public class KanbanLabelColumnService {

    public static final String FRENCH_CODE = "fr";
    public static final String MALAGASY_CODE = "mg";

    private static final Set<String> PROTECTED_CODES = Set.of(FRENCH_CODE, MALAGASY_CODE);

    private final JdbcTemplate jdbcTemplate;
    private final KanbanLanguageRepository languageRepository;

    public KanbanLabelColumnService(
            JdbcTemplate jdbcTemplate,
            KanbanLanguageRepository languageRepository
    ) {
        this.jdbcTemplate = jdbcTemplate;
        this.languageRepository = languageRepository;
    }

    public List<KanbanLanguage> listStoredLanguages() {
        return languageRepository.findAll().stream()
                .sorted((left, right) -> left.getCode().compareTo(right.getCode()))
                .toList();
    }

    public boolean isProtectedLanguage(String code) {
        return PROTECTED_CODES.contains(normalizeCode(code));
    }

    public Map<String, String> readLabelsForStatus(int statusId) {
        Map<String, String> labels = new HashMap<>();
        labels.put(FRENCH_CODE, KanbanDefaults.FRENCH_LABELS.getOrDefault(statusId, ""));

        for (KanbanLanguage language : listStoredLanguages()) {
            labels.put(
                    language.getCode(),
                    readLabelFromColumn(statusId, toColumnName(language.getCode()))
            );
        }

        return labels;
    }

    public void writeLabelsForStatus(int statusId, Map<String, String> labels) {
        for (KanbanLanguage language : listStoredLanguages()) {
            if (!labels.containsKey(language.getCode())) {
                continue;
            }

            String value = labels.get(language.getCode()).trim();
            jdbcTemplate.update(
                    "UPDATE kanban_column SET " + toColumnName(language.getCode()) + " = ? WHERE status_id = ?",
                    value,
                    statusId
            );
        }
    }

    @Transactional
    public KanbanLanguage addLanguage(String code, String name) {
        String normalizedCode = normalizeCode(code);
        String columnName = toColumnName(normalizedCode);

        if (PROTECTED_CODES.contains(normalizedCode)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Le code langue \"" + normalizedCode + "\" est réservé"
            );
        }

        if (languageRepository.existsById(normalizedCode)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "La langue \"" + normalizedCode + "\" existe déjà"
            );
        }

        if (columnExists(columnName)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "La colonne \"" + columnName + "\" existe déjà"
            );
        }

        jdbcTemplate.execute(
                "ALTER TABLE kanban_column ADD COLUMN " + columnName + " TEXT NOT NULL DEFAULT ''"
        );

        KanbanLanguage language = new KanbanLanguage(normalizedCode, name.trim());
        return languageRepository.save(language);
    }

    @Transactional
    public void removeLanguage(String code) {
        String normalizedCode = normalizeCode(code);

        if (PROTECTED_CODES.contains(normalizedCode)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La langue \"" + normalizedCode + "\" ne peut pas être supprimée"
            );
        }

        KanbanLanguage language = languageRepository.findById(normalizedCode)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Langue introuvable : " + normalizedCode
                ));

        String columnName = toColumnName(normalizedCode);

        if (columnExists(columnName)) {
            jdbcTemplate.execute("ALTER TABLE kanban_column DROP COLUMN " + columnName);
        }

        languageRepository.delete(language);
    }

    public void ensureMalagasyLanguageRegistered() {
        if (languageRepository.existsById(MALAGASY_CODE)) {
            return;
        }

        languageRepository.save(new KanbanLanguage(MALAGASY_CODE, "Malgache"));
    }

    private String readLabelFromColumn(int statusId, String columnName) {
        if (!columnExists(columnName)) {
            return "";
        }

        return jdbcTemplate.query(
                "SELECT " + columnName + " FROM kanban_column WHERE status_id = ?",
                rs -> rs.next() ? rs.getString(1) : "",
                statusId
        );
    }

    private boolean columnExists(String columnName) {
        List<String> columns = jdbcTemplate.query(
                "PRAGMA table_info(kanban_column)",
                (rs, rowNum) -> rs.getString("name")
        );

        return columns.contains(columnName);
    }

    private String normalizeCode(String code) {
        return code.trim().toLowerCase(Locale.ROOT);
    }

    public String toColumnName(String code) {
        return "label_" + normalizeCode(code).replace("-", "_");
    }
}
