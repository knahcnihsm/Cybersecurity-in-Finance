package com.cybergate.control.controller;

import com.cybergate.control.dto.AssetControlCreateRequest;
import com.cybergate.control.dto.ControlCreateRequest;
import com.cybergate.control.dto.ControlDTO;
import com.cybergate.control.dto.EffectivenessDTO;
import com.cybergate.control.model.AssetControl;
import com.cybergate.control.model.AssetControlStatus;
import com.cybergate.control.model.ControlType;
import com.cybergate.control.repository.AssetControlRepository;
import com.cybergate.control.service.ControlService;
import com.cybergate.control.service.EffectivenessService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/controls")
@RequiredArgsConstructor
public class ControlController {

    private final ControlService controlService;
    private final EffectivenessService effectivenessService;
    private final AssetControlRepository assetControlRepository;

    @GetMapping
    public ResponseEntity<List<ControlDTO>> listControls(
            @RequestParam(required = false) ControlType controlType) {
        return ResponseEntity.ok(controlService.listControls(controlType));
    }

    @PostMapping
    public ResponseEntity<ControlDTO> createControl(@Valid @RequestBody ControlCreateRequest request) {
        ControlDTO control = controlService.createControl(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(control);
    }

    @GetMapping("/asset/{assetId}")
    public ResponseEntity<List<AssetControl>> getAssetControls(@PathVariable UUID assetId) {
        return ResponseEntity.ok(effectivenessService.getAssetControls(assetId));
    }

    @GetMapping("/effectiveness")
    public ResponseEntity<EffectivenessDTO> getEffectiveness(@RequestParam UUID assetId) {
        return ResponseEntity.ok(effectivenessService.calculateEffectiveness(assetId));
    }

    @GetMapping("/coverage")
    public ResponseEntity<Map<String, Object>> getCoverage() {
        Map<String, Object> coverage = new HashMap<>();
        List<AssetControl> allControls = assetControlRepository.findAll();

        long implementedCount = allControls.stream()
                .filter(ac -> ac.getStatus() == AssetControlStatus.IMPLEMENTED || ac.getStatus() == AssetControlStatus.VERIFIED)
                .count();

        coverage.put("totalAssetControls", allControls.size());
        coverage.put("implementedControls", implementedCount);
        coverage.put("coveragePercentage", allControls.isEmpty() ? 0.0 :
                (double) implementedCount / allControls.size() * 100);

        Map<String, Long> byStatus = new HashMap<>();
        for (AssetControlStatus status : AssetControlStatus.values()) {
            long count = allControls.stream()
                    .filter(ac -> ac.getStatus() == status)
                    .count();
            byStatus.put(status.name(), count);
        }
        coverage.put("byStatus", byStatus);

        return ResponseEntity.ok(coverage);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<AssetControl> updateStatus(
            @PathVariable UUID id,
            @RequestParam AssetControlStatus status) {
        return ResponseEntity.ok(effectivenessService.updateAssetControlStatus(id, status));
    }
}
