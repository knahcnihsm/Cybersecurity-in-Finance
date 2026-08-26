package com.cybergate.control.service;

import com.cybergate.control.dto.AssetControlCreateRequest;
import com.cybergate.control.dto.EffectivenessDTO;
import com.cybergate.control.exception.ControlNotFoundException;
import com.cybergate.control.model.AssetControl;
import com.cybergate.control.model.AssetControlStatus;
import com.cybergate.control.repository.AssetControlRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class EffectivenessService {

    private final AssetControlRepository assetControlRepository;

    public EffectivenessDTO calculateEffectiveness(UUID assetId) {
        List<AssetControl> assetControls = assetControlRepository.findByAssetId(assetId);

        if (assetControls.isEmpty()) {
            return new EffectivenessDTO(
                    assetId,
                    BigDecimal.ZERO,
                    BigDecimal.ZERO,
                    0,
                    0,
                    BigDecimal.ZERO
            );
        }

        int implemented = (int) assetControls.stream()
                .filter(ac -> ac.getStatus() == AssetControlStatus.IMPLEMENTED || ac.getStatus() == AssetControlStatus.VERIFIED)
                .count();

        int total = assetControls.size();

        BigDecimal overallCoverage = assetControls.stream()
                .filter(ac -> ac.getCoverageScore() != null)
                .map(AssetControl::getCoverageScore)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(new BigDecimal(total), 4, RoundingMode.HALF_UP);

        BigDecimal overallEffectiveness = assetControls.stream()
                .filter(ac -> ac.getEffectivenessScore() != null)
                .map(AssetControl::getEffectivenessScore)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(new BigDecimal(total), 4, RoundingMode.HALF_UP);

        BigDecimal avgMaturity = assetControls.stream()
                .filter(ac -> ac.getMaturityLevel() != null)
                .map(ac -> new BigDecimal(ac.getMaturityLevel()))
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(new BigDecimal(total), 2, RoundingMode.HALF_UP);

        return new EffectivenessDTO(
                assetId,
                overallEffectiveness,
                overallCoverage,
                implemented,
                total,
                avgMaturity
        );
    }

    public AssetControl createAssetControl(AssetControlCreateRequest request) {
        AssetControl assetControl = AssetControl.builder()
                .assetId(request.assetId())
                .controlId(request.controlId())
                .status(request.status())
                .coverageScore(request.coverageScore())
                .effectivenessScore(request.effectivenessScore())
                .maturityLevel(request.maturityLevel())
                .build();

        if (request.status() == AssetControlStatus.IMPLEMENTED || request.status() == AssetControlStatus.VERIFIED) {
            assetControl.setImplementedAt(OffsetDateTime.now());
        }

        return assetControlRepository.save(assetControl);
    }

    public List<AssetControl> getAssetControls(UUID assetId) {
        return assetControlRepository.findByAssetId(assetId);
    }

    public AssetControl updateAssetControlStatus(UUID assetControlId, AssetControlStatus newStatus) {
        AssetControl assetControl = assetControlRepository.findById(assetControlId)
                .orElseThrow(() -> new ControlNotFoundException("Asset control not found with id: " + assetControlId));

        assetControl.setStatus(newStatus);

        if (newStatus == AssetControlStatus.IMPLEMENTED || newStatus == AssetControlStatus.VERIFIED) {
            assetControl.setImplementedAt(OffsetDateTime.now());
            assetControl.setLastVerifiedAt(OffsetDateTime.now());
        }

        return assetControlRepository.save(assetControl);
    }
}
