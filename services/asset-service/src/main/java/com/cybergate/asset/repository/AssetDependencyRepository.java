package com.cybergate.asset.repository;

import com.cybergate.asset.model.AssetDependency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AssetDependencyRepository extends JpaRepository<AssetDependency, UUID> {

    List<AssetDependency> findByAssetId(UUID assetId);

    List<AssetDependency> findByDependsOnId(UUID dependsOnId);
}
