package com.cybergate.control.dto;

import com.cybergate.control.model.ControlType;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record ControlDTO(
        UUID id,
        String name,
        ControlType controlType,
        String description,
        BigDecimal implementationCostInr,
        BigDecimal annualMaintenanceInr,
        BigDecimal maxRiskReduction,
        Integer implementationTimeDays,
        Integer maturityLevels,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {}
