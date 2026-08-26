package com.cybergate.notification.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisConfig {

    @Bean
    public RedisMessageListenerContainer redisMessageListenerContainer(
            RedisConnectionFactory connectionFactory,
            MessageListenerAdapter riskEventListenerAdapter,
            MessageListenerAdapter ingestionEventListenerAdapter) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        container.addMessageListener(riskEventListenerAdapter, new ChannelTopic("risk.events.updated"));
        container.addMessageListener(ingestionEventListenerAdapter, new ChannelTopic("security.events.vulnerability"));
        container.addMessageListener(ingestionEventListenerAdapter, new ChannelTopic("security.events.control"));
        container.addMessageListener(ingestionEventListenerAdapter, new ChannelTopic("security.events.asset"));
        return container;
    }

    @Bean
    public MessageListenerAdapter riskEventListenerAdapter(
            com.cybergate.notification.listener.RiskEventListener listener) {
        return new MessageListenerAdapter(listener, "onMessage");
    }

    @Bean
    public MessageListenerAdapter ingestionEventListenerAdapter(
            com.cybergate.notification.listener.RiskEventListener listener) {
        return new MessageListenerAdapter(listener, "onIngestionMessage");
    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new Jackson2JsonRedisSerializer<>(ObjectMapper.class, Object.class));
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(new Jackson2JsonRedisSerializer<>(ObjectMapper.class, Object.class));
        template.afterPropertiesSet();
        return template;
    }
}
