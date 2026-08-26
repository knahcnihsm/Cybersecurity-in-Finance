package com.cybergate.asset.controller;

import com.cybergate.asset.dto.AssetCreateRequest;
import com.cybergate.asset.dto.AssetDTO;
import com.cybergate.asset.model.Asset;
import com.cybergate.asset.model.AssetType;
import com.cybergate.asset.model.AssetDependency;
import com.cybergate.asset.repository.AssetDependencyRepository;
import com.cybergate.asset.repository.AssetRepository;
import com.cybergate.asset.service.AssetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class AssetController {

    private final AssetService assetService;
    private final AssetDependencyRepository assetDependencyRepository;
    private final AssetRepository assetRepository;

    @GetMapping
    public ResponseEntity<List<AssetDTO>> listAssets(
            @RequestParam(required = false) AssetType assetType,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Boolean internetExposed,
            @RequestParam(required = false) Integer minCriticality) {
        return ResponseEntity.ok(assetService.listAssets(assetType, department, internetExposed, minCriticality));
    }

    @PostMapping
    public ResponseEntity<AssetDTO> createAsset(@Valid @RequestBody AssetCreateRequest request) {
        AssetDTO asset = assetService.createAsset(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(asset);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssetDTO> getAsset(@PathVariable UUID id) {
        return ResponseEntity.ok(assetService.getAsset(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AssetDTO> updateAsset(@PathVariable UUID id, @Valid @RequestBody AssetCreateRequest request) {
        return ResponseEntity.ok(assetService.updateAsset(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAsset(@PathVariable UUID id) {
        assetService.deleteAsset(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/dependencies")
    public ResponseEntity<List<AssetDependency>> getDependencies(@PathVariable UUID id) {
        List<AssetDependency> dependencies = assetDependencyRepository.findByAssetId(id);
        return ResponseEntity.ok(dependencies);
    }

    @PostMapping("/{id}/dependencies")
    public ResponseEntity<AssetDependency> addDependency(@PathVariable UUID id, @RequestBody AssetDependency dependency) {
        dependency.setAssetId(id);
        AssetDependency saved = assetDependencyRepository.save(dependency);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/criticality/{id}")
    public ResponseEntity<AssetDTO> getCriticality(@PathVariable UUID id) {
        return ResponseEntity.ok(assetService.recalculateCriticality(id));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        List<Asset> allAssets = assetRepository.findAll();

        stats.put("totalAssets", allAssets.size());

        Map<String, Long> byType = allAssets.stream()
                .collect(Collectors.groupingBy(a -> a.getAssetType().name(), Collectors.counting()));
        stats.put("byType", byType);

        Map<String, Long> byDepartment = allAssets.stream()
                .filter(a -> a.getDepartment() != null)
                .collect(Collectors.groupingBy(Asset::getDepartment, Collectors.counting()));
        stats.put("byDepartment", byDepartment);

        long internetExposedCount = allAssets.stream()
                .filter(a -> Boolean.TRUE.equals(a.getInternetExposed()))
                .count();
        stats.put("internetExposed", internetExposedCount);

        double avgCriticality = allAssets.stream()
                .filter(a -> a.getCriticalityScore() != null)
                .mapToInt(Asset::getCriticalityScore)
                .average()
                .orElse(0.0);
        stats.put("averageCriticality", avgCriticality);

        return ResponseEntity.ok(stats);
    }
}
