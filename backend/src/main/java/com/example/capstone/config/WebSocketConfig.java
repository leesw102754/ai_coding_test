package com.example.capstone.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // 클라이언트가 메시지를 구독(Subscribe)할 때 사용하는 경로
        config.enableSimpleBroker("/topic");

        // 클라이언트가 메시지를 보낼(Send) 때 사용하는 접두사
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 웹소켓 연결 엔드포인트 설정: /ws-api
        registry.addEndpoint("/ws-api")
                .setAllowedOriginPatterns("*"); // CORS 허용: 모든 도메인에서 접속 가능
    }
}