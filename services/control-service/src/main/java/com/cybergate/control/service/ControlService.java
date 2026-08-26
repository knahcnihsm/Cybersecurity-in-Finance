package com.cybergate.control.service;

import com.cybergate.control.dto.ControlCreateRequest;
import com.cybergate.control.dto.ControlDTO;
import com.cybergate.control.exception.ControlNotFoundException;
import com.cybergate.control.model.ControlType;
import com.cybergate.control.model.SecurityControl;
import com.cybergate.control.repository.ControlRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ControlService {

    private final ControlRepository controlRepository;

    public List<ControlDTO> listControls(ControlType controlType) {
        List<SecurityControl> controls;

        if (controlType != null) {
            controls = controlRepository.findByControlType(controlType);
        } else {
            controls = controlRepository.findAll();
        }

        return controls.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public ControlDTO createControl(ControlCreateRequest request) {
        SecurityControl control = SecurityControl.builder()
                .name(request.name())
                .controlType(request.controlType())
                .description(request.description())
                .implementationCostInr(request.implementationCostInr())
                .annualMaintenanceInr(request.annualMaintenanceInr())
                .maxRiskReduction(request.maxRiskReduction())
                .implementationTimeDays(request.implementationTimeDays())
                .maturityLevels(request.maturityLevels())
                .build();

        SecurityControl saved = controlRepository.save(control);
        return toDTO(saved);
    }

    public ControlDTO getControl(UUID id) {
        SecurityControl control = controlRepository.findById(id)
                .orElseThrow(() -> new ControlNotFoundException("Control not found with id: " + id));
        return toDTO(control);
    }

    public ControlDTO updateControl(UUID id, ControlCreateRequest request) {
        SecurityControl control = controlRepository.findById(id)
                .orElseThrow(() -> new ControlNotFoundException("Control not found with id: " + id));

        control.setName(request.name());
        control.setControlType(request.controlType());
        control.setDescription(request.description());
        control.setImplementationCostInr(request.implementationCostInr());
        control.setAnnualMaintenanceInr(request.annualMaintenanceInr());
        control.setMaxRiskReduction(request.maxRiskReduction());
        control.setImplementationTimeDays(request.implementationTimeDays());
        control.setMaturityLevels(request.maturityLevels());

        SecurityControl saved = controlRepository.save(control);
        return toDTO(saved);
    }

    public ControlDTO toDTO(SecurityControl control) {
        return new ControlDTO(
                control.getId(),
                control.getName(),
                control.getControlType(),
                control.getDescription(),
                control.getImplementationCostInr(),
                control.getAnnualMaintenanceInr(),
                control.getMaxRiskReduction(),
                control.getImplementationTimeDays(),
                control.getMaturityLevels(),
                control.getCreatedAt(),
                control.getUpdatedAt()
        );
    }
}
