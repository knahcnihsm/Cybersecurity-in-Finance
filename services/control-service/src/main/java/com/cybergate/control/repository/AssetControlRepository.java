package com.cybergate.control.repository;

import com.cybergate.control.model.AssetControl;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AssetControlRepository extends JpaRepository<AssetControl, UUID> {

    List<AssetControl> findByAssetId(UUID assetId);

    List<AssetControl> findByControlId(UUID controlId);
}
