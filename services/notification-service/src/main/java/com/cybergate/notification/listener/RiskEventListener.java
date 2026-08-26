package com.cybergate.notification.listener;

import com.cybergate.notification.model.RiskNotification;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Map;

@Component
public class RiskEventListener implements MessageListener {

    private static final Logger log = LoggerFactory.getLogger(RiskEventListener.class);

    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    public RiskEventListener(SimpMessagingTemplate messagingTemplate, ObjectMapper objectMapper) {
        this.messagingTemplate = messagingTemplate;
        this.objectMapper = objectMapper;
    }

    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            String body = new String(message.getBody());
            RiskNotification notification = objectMapper.readValue(body, RiskNotification.class);
            if (notification.getTimestamp() == null) {
                notification.setTimestamp(LocalDateTime.now());
            }
            messagingTemplate.convertAndSend("/topic/risk/updated", notification);
            log.info("Broadcast risk notification for asset: {}", notification.getAssetId());
        } catch (Exception e) {
            log.error("Failed to process risk event: {}", e.getMessage());
        }
    }

    public void onIngestionMessage(Message message, byte[] pattern) {
        try {
            String body = new String(message.getBody());
            Map<String, Object> event = objectMapper.readValue(body, Map.class);
            messagingTemplate.convertAndSend("/topic/ingestion/event", event);
            log.info("Broadcast ingestion event");
        } catch (Exception e) {
            log.error("Failed to process ingestion event: {}", e.getMessage());
        }
    }
}
