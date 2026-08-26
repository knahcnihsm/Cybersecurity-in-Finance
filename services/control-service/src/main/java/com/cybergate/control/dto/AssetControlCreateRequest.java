package com.cybergate.control.dto;

import com.cybergate.control.model.AssetControlStatus;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record AssetControlCreateRequest(
        @NotNull UUID assetId,
        @NotNull UUID controlId,
        @NotNull AssetControlStatus status,
        BigDecimal coverageScore,
        BigDecimal effectivenessScore,
        Integer maturityLevel
) {}
