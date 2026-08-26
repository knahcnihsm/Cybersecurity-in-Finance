package com.cybergate.control.dto;

import com.cybergate.control.model.ControlType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ControlCreateRequest(
        @NotBlank String name,
        @NotNull ControlType controlType,
        String description,
        BigDecimal implementationCostInr,
        BigDecimal annualMaintenanceInr,
        BigDecimal maxRiskReduction,
        Integer implementationTimeDays,
        Integer maturityLevels
) {}
