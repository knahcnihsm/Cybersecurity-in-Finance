package com.cybergate.asset.service;

import com.cybergate.asset.dto.AssetCreateRequest;
import com.cybergate.asset.dto.AssetDTO;
import com.cybergate.asset.exception.AssetNotFoundException;
import com.cybergate.asset.model.Asset;
import com.cybergate.asset.model.AssetType;
import com.cybergate.asset.repository.AssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AssetService {

    private final AssetRepository assetRepository;
    private final CriticalityService criticalityService;

    public List<AssetDTO> listAssets(AssetType assetType, String department, Boolean internetExposed, Integer minCriticality) {
        List<Asset> assets;

        if (assetType != null) {
            assets = assetRepository.findByAssetType(assetType);
        } else if (department != null) {
            assets = assetRepository.findByDepartment(department);
        } else if (internetExposed != null) {
            assets = assetRepository.findByInternetExposed(internetExposed);
        } else if (minCriticality != null) {
            assets = assetRepository.findByCriticalityScoreGreaterThanEqual(minCriticality);
        } else {
            assets = assetRepository.findAll();
        }

        return assets.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public AssetDTO createAsset(AssetCreateRequest request) {
        Asset asset = Asset.builder()
                .name(request.name())
                .assetType(request.assetType())
                .environment(request.environment())
                .owner(request.owner())
                .department(request.department())
                .ipAddress(request.ipAddress())
                .businessValueInr(request.businessValueInr())
                .replacementCostInr(request.replacementCostInr())
                .internetExposed(request.internetExposed() != null ? request.internetExposed() : false)
                .criticalityScore(request.criticalityScore())
                .dataSensitivity(request.dataSensitivity())
                .annualRevenueImpact(request.annualRevenueImpact())
                .metadata(request.metadata())
                .build();

        if (asset.getCriticalityScore() == null) {
            asset.setCriticalityScore(criticalityService.calculateCriticality(asset));
        }

        Asset saved = assetRepository.save(asset);
        return toDTO(saved);
    }

    public AssetDTO getAsset(UUID id) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new AssetNotFoundException("Asset not found with id: " + id));
        return toDTO(asset);
    }

    public AssetDTO updateAsset(UUID id, AssetCreateRequest request) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new AssetNotFoundException("Asset not found with id: " + id));

        asset.setName(request.name());
        asset.setAssetType(request.assetType());
        asset.setEnvironment(request.environment());
        asset.setOwner(request.owner());
        asset.setDepartment(request.department());
        asset.setIpAddress(request.ipAddress());
        asset.setBusinessValueInr(request.businessValueInr());
        asset.setReplacementCostInr(request.replacementCostInr());
        asset.setInternetExposed(request.internetExposed());
        asset.setDataSensitivity(request.dataSensitivity());
        asset.setAnnualRevenueImpact(request.annualRevenueImpact());
        asset.setMetadata(request.metadata());

        if (request.criticalityScore() != null) {
            asset.setCriticalityScore(request.criticalityScore());
        } else {
            asset.setCriticalityScore(criticalityService.calculateCriticality(asset));
        }

        Asset saved = assetRepository.save(asset);
        return toDTO(saved);
    }

    public void deleteAsset(UUID id) {
        if (!assetRepository.existsById(id)) {
            throw new AssetNotFoundException("Asset not found with id: " + id);
        }
        assetRepository.deleteById(id);
    }

    public AssetDTO recalculateCriticality(UUID id) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new AssetNotFoundException("Asset not found with id: " + id));

        asset.setCriticalityScore(criticalityService.calculateCriticality(asset));
        Asset saved = assetRepository.save(asset);
        return toDTO(saved);
    }

    public AssetDTO toDTO(Asset asset) {
        return new AssetDTO(
                asset.getId(),
                asset.getName(),
                asset.getAssetType(),
                asset.getEnvironment(),
                asset.getOwner(),
                asset.getDepartment(),
                asset.getIpAddress(),
                asset.getBusinessValueInr(),
                asset.getReplacementCostInr(),
                asset.getInternetExposed(),
                asset.getCriticalityScore(),
                asset.getDataSensitivity(),
                asset.getAnnualRevenueImpact(),
                asset.getMetadata(),
                asset.getCreatedAt(),
                asset.getUpdatedAt()
        );
    }
}
