package com.cybergate.asset.dto;

import com.cybergate.asset.model.AssetType;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record AssetDTO(
        UUID id,
        String name,
        AssetType assetType,
        String environment,
        String owner,
        String department,
        String ipAddress,
        BigDecimal businessValueInr,
        BigDecimal replacementCostInr,
        Boolean internetExposed,
        Integer criticalityScore,
        String dataSensitivity,
        BigDecimal annualRevenueImpact,
        String metadata,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {}
