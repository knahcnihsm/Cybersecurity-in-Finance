package com.cybergate.notification.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RiskNotification {

    private String type;
    private String assetId;
    private String assetName;
    private Double previousRisk;
    private Double currentRisk;
    private Double previousEAL;
    private Double currentEAL;
    private Double delta;
    private LocalDateTime timestamp;
    private String message;
}
