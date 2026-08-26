package com.cybergate.control.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "security_controls", schema = "control")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SecurityControl {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ControlType controlType;

    private String description;

    private BigDecimal implementationCostInr;

    private BigDecimal annualMaintenanceInr;

    private BigDecimal maxRiskReduction;

    private Integer implementationTimeDays;

    private Integer maturityLevels;

    @Column(nullable = false)
    private OffsetDateTime createdAt;

    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        updatedAt = OffsetDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
