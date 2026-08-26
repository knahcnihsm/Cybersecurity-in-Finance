package com.cybergate.ingestion.service;

import com.cybergate.ingestion.dto.IngestionRequest;
import com.cybergate.ingestion.exception.IngestionException;
import com.cybergate.ingestion.model.SecurityEvent;
import com.cybergate.ingestion.repository.SecurityEventRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class IngestionService {

    private final SecurityEventRepository repository;
    private final NormalizerService normalizerService;
    private final EventDispatcher eventDispatcher;
    private final ObjectMapper objectMapper;

    @Autowired
    public IngestionService(SecurityEventRepository repository,
                            NormalizerService normalizerService,
                            EventDispatcher eventDispatcher,
                            ObjectMapper objectMapper) {
        this.repository = repository;
        this.normalizerService = normalizerService;
        this.eventDispatcher = eventDispatcher;
        this.objectMapper = objectMapper;
    }

    public SecurityEvent ingest(IngestionRequest request) {
        SecurityEvent event = normalizerService.normalize(request);
        SecurityEvent saved = repository.save(event);
        eventDispatcher.dispatch(saved);
        return saved;
    }

    public List<SecurityEvent> ingestBatch(List<IngestionRequest> requests) {
        List<SecurityEvent> results = new ArrayList<>();
        for (IngestionRequest request : requests) {
            try {
                SecurityEvent event = ingest(request);
                results.add(event);
            } catch (IngestionException e) {
                SecurityEvent failed = SecurityEvent.builder()
                        .eventType(null)
                        .source("batch-error")
                        .details("{\"error\": \"" + e.getMessage() + "\"}")
                        .processed(false)
                        .build();
                results.add(failed);
            }
        }
        return results;
    }

    public List<SecurityEvent> getEvents(int page, int size) {
        return repository.findAll();
    }

    public Map<String, Object> getStats() {
        List<SecurityEvent> all = repository.findAll();
        long totalEvents = all.size();
        long processedCount = all.stream().filter(SecurityEvent::getProcessed).count();
        long unprocessedCount = totalEvents - processedCount;
        Map<String, Long> byType = all.stream()
                .filter(e -> e.getEventType() != null)
                .collect(java.util.stream.Collectors.groupingBy(
                        e -> e.getEventType().name(),
                        java.util.stream.Collectors.counting()));
        return Map.of(
                "totalEvents", totalEvents,
                "processedCount", processedCount,
                "unprocessedCount", unprocessedCount,
                "byType", byType
        );
    }

    public List<SecurityEvent> simulateEvents(int count) {
        List<SecurityEvent> simulated = new ArrayList<>();
        String[] sources = {"scanner", "siem", "threat-intel", "manual", "api"};
        String[] eventTypes = {"VULNERABILITY_DETECTED", "VULNERABILITY_UPDATED", "CONTROL_STATUS_CHANGED",
                "ASSET_CREATED", "ASSET_MODIFIED", "THREAT_INTEL_RECEIVED"};

        for (int i = 0; i < count; i++) {
            String eventType = eventTypes[ThreadLocalRandom.current().nextInt(eventTypes.length)];
            String source = sources[ThreadLocalRandom.current().nextInt(sources.length)];
            Map<String, Object> details = Map.of(
                    "iteration", i,
                    "simulated", true,
                    "severity", ThreadLocalRandom.current().nextDouble(1.0, 10.0)
            );
            IngestionRequest request = new IngestionRequest(eventType, UUID.randomUUID().toString(), source, details);
            try {
                SecurityEvent event = ingest(request);
                simulated.add(event);
            } catch (IngestionException e) {
                // skip failed simulations
            }
        }
        return simulated;
    }
}
