package com.cybergate.notification.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Map;

@Controller
public class WebSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/subscribe")
    public void subscribe(String topic) {
        messagingTemplate.convertAndSend("/topic/" + topic, Map.of(
                "status", "subscribed",
                "topic", topic
        ));
    }

    public void sendToUser(String userId, Object payload) {
        messagingTemplate.convertAndSendToUser(userId, "/queue/notifications", payload);
    }

    public List<String> getSubscribedTopics() {
        return List.of("/topic/risk/updated", "/topic/ingestion/event");
    }
}
