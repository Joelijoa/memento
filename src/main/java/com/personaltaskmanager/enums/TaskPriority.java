package com.personaltaskmanager.enums;

public enum TaskPriority {
    LOW("Faible"),
    MEDIUM("Moyenne"),
    HIGH("Élevée"),
    URGENT("Urgente");

    private final String displayName;

    TaskPriority(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
