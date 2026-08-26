package com.cybergate.asset.dto;

import com.cybergate.asset.model.AssetType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record AssetCreateRequest(
        @NotBlank String name,
        @NotNull AssetType assetType,
        @NotBlank String environment,
        String owner,
        String department,
        String ipAddress,
        BigDecimal businessValueInr,
        BigDecimal replacementCostInr,
        Boolean internetExposed,
        Integer criticalityScore,
        String dataSensitivity,
        BigDecimal annualRevenueImpact,
        String metadata
) {}
