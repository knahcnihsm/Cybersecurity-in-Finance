package com.cybergate.gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RouteConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("auth-service", r -> r
                        .path("/api/auth/**")
                        .filters(f -> f.stripPrefix(0))
                        .uri("http://${AUTH_SERVICE_HOST:auth-service}:8081"))
                .route("asset-service", r -> r
                        .path("/api/assets/**")
                        .filters(f -> f.stripPrefix(0))
                        .uri("http://${ASSET_SERVICE_HOST:asset-service}:8082"))
                .route("vulnerability-service", r -> r
                        .path("/api/vulnerabilities/**")
                        .filters(f -> f.stripPrefix(0))
                        .uri("http://${VULNERABILITY_SERVICE_HOST:vulnerability-service}:8083"))
                .route("control-service", r -> r
                        .path("/api/controls/**")
                        .filters(f -> f.stripPrefix(0))
                        .uri("http://${CONTROL_SERVICE_HOST:control-service}:8084"))
                .route("ingestion-service", r -> r
                        .path("/api/ingestion/**")
                        .filters(f -> f.stripPrefix(0))
                        .uri("http://${INGESTION_SERVICE_HOST:ingestion-service}:8085"))
                .route("risk-engine", r -> r
                        .path("/api/risk/**")
                        .filters(f -> f.stripPrefix(0))
                        .uri("http://${RISK_ENGINE_HOST:risk-engine}:8090"))
                .route("investment-optimizer", r -> r
                        .path("/api/investment/**")
                        .filters(f -> f.stripPrefix(0))
                        .uri("http://${INVESTMENT_OPTIMIZER_HOST:investment-optimizer}:8091"))
                .route("ai-service", r -> r
                        .path("/api/ai/**")
                        .filters(f -> f.stripPrefix(0))
                        .uri("http://${AI_SERVICE_HOST:ai-service}:8092"))
                .build();
    }
}
