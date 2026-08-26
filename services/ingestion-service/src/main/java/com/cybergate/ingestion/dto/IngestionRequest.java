package com.cybergate.ingestion.dto;

import java.util.Map;

public record IngestionRequest(
        String eventType,
        String assetId,
        String source,
        Map<String, Object> details
) {}
