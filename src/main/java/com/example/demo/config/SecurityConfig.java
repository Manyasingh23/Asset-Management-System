
package com.example.demo.config;

import com.example.demo.security.JwtFilter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())

            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            .authorizeHttpRequests(auth -> auth

                // Public pages
                .requestMatchers(
                    "/",
                    "/index.html",
                    "/dashboard.html",
                    "/signup.html",
                    "/style.css",
                    "/app.js",
                    "/dashboard.js",
                    "/signup.js",
                    "/error"
                ).permitAll()

                // Public login and signup endpoints
                .requestMatchers(
                    "/api/users/login",
                    "/api/users/signup/request-otp",
                    "/api/users/signup/verify-otp"
                ).permitAll()

                // Asset APIs
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/assets/**"
                ).authenticated()

                .requestMatchers(
                    HttpMethod.POST,
                    "/api/assets/**"
                ).hasRole("ADMIN")

                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/assets/**"
                ).hasRole("ADMIN")

                .requestMatchers(
                    HttpMethod.DELETE,
                    "/api/assets/**"
                ).hasRole("ADMIN")

                // Employee APIs
                .requestMatchers(
                    "/api/employees/**"
                ).hasRole("ADMIN")

                // All other requests require authentication
                .anyRequest().authenticated()
            )

            .addFilterBefore(
                jwtFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}