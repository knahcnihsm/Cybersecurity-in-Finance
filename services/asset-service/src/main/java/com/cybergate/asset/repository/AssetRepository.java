package com.cybergate.asset.repository;

import com.cybergate.asset.model.Asset;
import com.cybergate.asset.model.AssetType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AssetRepository extends JpaRepository<Asset, UUID> {

    List<Asset> findByAssetType(AssetType assetType);

    List<Asset> findByDepartment(String department);

    List<Asset> findByInternetExposed(Boolean internetExposed);

    List<Asset> findByCriticalityScoreGreaterThanEqual(Integer criticalityScore);
}
