package com.cybergate.ingestion.controller;

import com.cybergate.ingestion.dto.IngestionRequest;
import com.cybergate.ingestion.model.SecurityEvent;
import com.cybergate.ingestion.service.IngestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ingestion")
public class IngestionController {

    private final IngestionService ingestionService;

    @Autowired
    public IngestionController(IngestionService ingestionService) {
        this.ingestionService = ingestionService;
    }

    @PostMapping("/vulnerability")
    public ResponseEntity<SecurityEvent> ingestVulnerability(@RequestBody IngestionRequest request) {
        SecurityEvent event = ingestionService.ingest(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(event);
    }

    @PostMapping("/control")
    public ResponseEntity<SecurityEvent> ingestControl(@RequestBody IngestionRequest request) {
        SecurityEvent event = ingestionService.ingest(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(event);
    }

    @PostMapping("/asset")
    public ResponseEntity<SecurityEvent> ingestAsset(@RequestBody IngestionRequest request) {
        SecurityEvent event = ingestionService.ingest(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(event);
    }

    @PostMapping("/batch")
    public ResponseEntity<List<SecurityEvent>> ingestBatch(@RequestBody List<IngestionRequest> requests) {
        List<SecurityEvent> events = ingestionService.ingestBatch(requests);
        return ResponseEntity.status(HttpStatus.CREATED).body(events);
    }

    @GetMapping("/events")
    public ResponseEntity<List<SecurityEvent>> getEvents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(ingestionService.getEvents(page, size));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(ingestionService.getStats());
    }

    @PostMapping("/simulate")
    public ResponseEntity<List<SecurityEvent>> simulate(
            @RequestParam(defaultValue = "10") int count) {
        List<SecurityEvent> events = ingestionService.simulateEvents(count);
        return ResponseEntity.status(HttpStatus.CREATED).body(events);
    }

    @PostMapping("/simulate/vulnerability")
    public ResponseEntity<SecurityEvent> simulateVulnerability(@RequestBody Map<String, Object> body) {
        SecurityEvent event = ingestionService.simulateVulnerability(
                (String) body.get("assetId"),
                ((Number) body.getOrDefault("cvss", 8.0)).doubleValue(),
                (String) body.get("cveId"),
                (String) body.get("title"));
        return ResponseEntity.status(HttpStatus.CREATED).body(event);
    }

    @PostMapping("/simulate/remediate")
    public ResponseEntity<SecurityEvent> remediateVulnerability(@RequestBody Map<String, Object> body) {
        SecurityEvent event = ingestionService.remediateVulnerability(
                (String) body.get("assetId"),
                (String) body.get("cveId"));
        return ResponseEntity.status(HttpStatus.CREATED).body(event);
    }

    @PostMapping("/simulate/control")
    public ResponseEntity<SecurityEvent> changeControl(@RequestBody Map<String, Object> body) {
        SecurityEvent event = ingestionService.changeControl(
                (String) body.get("assetId"),
                (String) body.get("controlType"),
                (String) body.get("status"));
        return ResponseEntity.status(HttpStatus.CREATED).body(event);
    }
}
