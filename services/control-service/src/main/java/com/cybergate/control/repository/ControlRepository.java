package com.cybergate.control.repository;

import com.cybergate.control.model.ControlType;
import com.cybergate.control.model.SecurityControl;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ControlRepository extends JpaRepository<SecurityControl, UUID> {

    List<SecurityControl> findByControlType(ControlType controlType);
}
