package com.cybergate.ingestion.dto;

public record AssetEvent(
        String name,
        String assetType,
        String environment,
        Double criticalityScore,
        Double businessValueInr
) {}
