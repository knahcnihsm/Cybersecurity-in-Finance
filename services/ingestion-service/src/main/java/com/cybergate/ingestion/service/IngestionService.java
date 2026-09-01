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
import java.util.HashMap;
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
        return repository.findAll(
                org.springframework.data.domain.PageRequest.of(
                        Math.max(0, page),
                        Math.min(200, Math.max(1, size))))
                .getContent();
    }

    public long getTotalEvents() {
        return repository.count();
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
        String[] realAssets = {
                "00000001-0001-0001-0001-000000000001",  // PAY-SRV-001
                "00000001-0001-0001-0001-000000000002",  // CUST-DB-001
                "00000001-0001-0001-0001-000000000003",  // AUTH-IDP-001
                "00000001-0001-0001-0001-000000000004",  // WEB-APP-001
                "00000001-0001-0001-0001-000000000008",  // CLOUD-MGMT-001
        };

        for (int i = 0; i < count; i++) {
            String eventType = eventTypes[ThreadLocalRandom.current().nextInt(eventTypes.length)];
            String source = sources[ThreadLocalRandom.current().nextInt(sources.length)];
            String assetId = realAssets[ThreadLocalRandom.current().nextInt(realAssets.length)];
            Map<String, Object> details = new HashMap<>();
            details.put("iteration", i);
            details.put("simulated", true);
            details.put("severity", ThreadLocalRandom.current().nextDouble(1.0, 10.0));
            details.put("cve_id", "SIM-CVE-2026-" + (10000 + ThreadLocalRandom.current().nextInt(90000)));
            details.put("cvss_score", 4.0 + ThreadLocalRandom.current().nextDouble(5.0));
            details.put("title", "Simulated incident " + (i + 1));
            IngestionRequest request = new IngestionRequest(eventType, assetId, source, details);
            try {
                SecurityEvent event = ingest(request);
                simulated.add(event);
            } catch (IngestionException e) {
                // skip failed simulations
            }
        }
        return simulated;
    }

    public SecurityEvent simulateVulnerability(String assetId, double cvss, String cveId, String title) {
        String sourceId = UUID.randomUUID().toString();
        Map<String, Object> details = new HashMap<>();
        details.put("cve_id", cveId);
        details.put("title", title != null ? title : "Simulated vulnerability (CVSS " + cvss + ")");
        details.put("cvss_score", cvss);
        details.put("severity", vulnSeverity(cvss));
        details.put("exploitability", Math.min(cvss, 10.0));
        details.put("internet_exposed", true);
        IngestionRequest request = new IngestionRequest(
                "VULNERABILITY_DETECTED", assetId, "scanner", details);
        return ingest(request);
    }

    public SecurityEvent remediateVulnerability(String assetId, String cveId) {
        Map<String, Object> details = new HashMap<>();
        details.put("cve_id", cveId);
        IngestionRequest request = new IngestionRequest(
                "VULNERABILITY_REMEDIATED", assetId, "soc-team", details);
        return ingest(request);
    }

    public SecurityEvent changeControl(String assetId, String controlType, String status) {
        Map<String, Object> details = new HashMap<>();
        details.put("control_type", controlType);
        details.put("status", status);
        IngestionRequest request = new IngestionRequest(
                "CONTROL_STATUS_CHANGED", assetId, "control-tower", details);
        return ingest(request);
    }

    private String vulnSeverity(double cvss) {
        if (cvss >= 9.0) return "CRITICAL";
        if (cvss >= 7.0) return "HIGH";
        if (cvss >= 4.0) return "MEDIUM";
        if (cvss >= 0.1) return "LOW";
        return "INFO";
    }
}
