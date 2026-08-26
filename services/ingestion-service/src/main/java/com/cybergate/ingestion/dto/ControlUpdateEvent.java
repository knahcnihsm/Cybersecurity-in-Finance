package com.cybergate.ingestion.dto;

public record ControlUpdateEvent(
        String assetId,
        String controlType,
        String status,
        Double coverageScore
) {}
