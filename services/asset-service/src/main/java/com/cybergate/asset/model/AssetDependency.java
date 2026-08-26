package com.cybergate.asset.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "asset_dependencies", schema = "asset")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetDependency {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID assetId;

    @Column(nullable = false)
    private UUID dependsOnId;

    @Column(nullable = false)
    private String dependencyType;

    private Integer criticality;

    @Column(nullable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
    }
}
