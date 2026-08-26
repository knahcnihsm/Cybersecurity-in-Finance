package com.cybergate.control.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "asset_controls", schema = "control")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetControl {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID assetId;

    @Column(nullable = false)
    private UUID controlId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssetControlStatus status;

    private BigDecimal coverageScore;

    private BigDecimal effectivenessScore;

    private Integer maturityLevel;

    private OffsetDateTime implementedAt;

    private OffsetDateTime lastVerifiedAt;

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
