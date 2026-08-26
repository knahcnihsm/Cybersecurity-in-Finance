package com.cybergate.ingestion.service;

import com.cybergate.ingestion.dto.IngestionRequest;
import com.cybergate.ingestion.model.EventType;
import com.cybergate.ingestion.model.SecurityEvent;
import com.cybergate.ingestion.exception.IngestionException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
public class NormalizerService {

    private final ObjectMapper objectMapper;

    public NormalizerService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public SecurityEvent normalize(IngestionRequest request) {
        if (request.eventType() == null || request.eventType().isBlank()) {
            throw new IngestionException("Event type is required");
        }
        if (request.source() == null || request.source().isBlank()) {
            throw new IngestionException("Source is required");
        }

        EventType eventType;
        try {
            eventType = EventType.valueOf(request.eventType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IngestionException("Invalid event type: " + request.eventType());
        }

        UUID sourceAsset = null;
        if (request.assetId() != null && !request.assetId().isBlank()) {
            try {
                sourceAsset = UUID.fromString(request.assetId());
            } catch (IllegalArgumentException e) {
                throw new IngestionException("Invalid asset ID format: " + request.assetId());
            }
        }

        String detailsJson = null;
        if (request.details() != null && !request.details().isEmpty()) {
            try {
                detailsJson = objectMapper.writeValueAsString(request.details());
            } catch (JsonProcessingException e) {
                throw new IngestionException("Failed to serialize details to JSON");
            }
        }

        return SecurityEvent.builder()
                .eventType(eventType)
                .sourceAsset(sourceAsset)
                .source(request.source())
                .details(detailsJson)
                .timestamp(LocalDateTime.now())
                .processed(false)
                .createdAt(LocalDateTime.now())
                .build();
    }

    public SecurityEvent normalizeWithDetails(IngestionRequest request, Map<String, Object> extraDetails) {
        Map<String, Object> merged = request.details() != null ? new java.util.HashMap<>(request.details()) : new java.util.HashMap<>();
        if (extraDetails != null) {
            merged.putAll(extraDetails);
        }
        IngestionRequest enriched = new IngestionRequest(
                request.eventType(),
                request.assetId(),
                request.source(),
                merged
        );
        return normalize(enriched);
    }
}
