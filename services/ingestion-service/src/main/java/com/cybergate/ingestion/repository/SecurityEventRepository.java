package com.cybergate.ingestion.repository;

import com.cybergate.ingestion.model.EventType;
import com.cybergate.ingestion.model.SecurityEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SecurityEventRepository extends JpaRepository<SecurityEvent, UUID> {

    List<SecurityEvent> findByEventType(EventType eventType);

    List<SecurityEvent> findBySourceAsset(UUID sourceAsset);

    List<SecurityEvent> findByProcessedFalse();
}
