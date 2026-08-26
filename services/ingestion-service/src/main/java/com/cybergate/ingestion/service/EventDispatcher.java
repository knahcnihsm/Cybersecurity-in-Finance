package com.cybergate.ingestion.service;

import com.cybergate.ingestion.model.SecurityEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class EventDispatcher {

    private static final String VULNERABILITY_CHANNEL = "security.events.vulnerability";
    private static final String CONTROL_CHANNEL = "security.events.control";
    private static final String ASSET_CHANNEL = "security.events.asset";

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    @Autowired
    public EventDispatcher(StringRedisTemplate redisTemplate, ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    public void dispatch(SecurityEvent event) {
        String channel = resolveChannel(event);
        try {
            String payload = objectMapper.writeValueAsString(event);
            redisTemplate.convertAndSend(channel, payload);
        } catch (Exception e) {
            throw new RuntimeException("Failed to dispatch event to channel: " + channel, e);
        }
    }

    private String resolveChannel(SecurityEvent event) {
        return switch (event.getEventType()) {
            case VULNERABILITY_DETECTED, VULNERABILITY_UPDATED, VULNERABILITY_REMEDIATED ->
                    VULNERABILITY_CHANNEL;
            case CONTROL_STATUS_CHANGED -> CONTROL_CHANNEL;
            case ASSET_CREATED, ASSET_MODIFIED -> ASSET_CHANNEL;
            default -> "security.events.default";
        };
    }
}
