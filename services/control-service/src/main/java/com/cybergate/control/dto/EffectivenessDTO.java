package com.cybergate.control.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record EffectivenessDTO(
        UUID assetId,
        BigDecimal overallEffectiveness,
        BigDecimal overallCoverage,
        Integer controlsImplemented,
        Integer controlsTotal,
        BigDecimal averageMaturityLevel
) {}
