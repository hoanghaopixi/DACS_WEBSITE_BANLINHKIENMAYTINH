package com.pcstore.config;

import com.pcstore.security.RestAuthenticationEntryPoint;
import com.pcstore.security.TokenAuthenticationFilter;
import com.pcstore.security.oauth2.CustomOAuth2UserService;
import com.pcstore.security.oauth2.OAuth2AuthenticationFailureHandler;
import com.pcstore.security.oauth2.OAuth2AuthenticationSuccessHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@EnableMethodSecurity(
        securedEnabled = true,
        jsr250Enabled = true,
        prePostEnabled = true
)
public class SecurityConfig {

    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;
    private final OAuth2AuthenticationFailureHandler oAuth2AuthenticationFailureHandler;

    @Bean
    public TokenAuthenticationFilter tokenAuthenticationFilter() {
        return new TokenAuthenticationFilter();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configure(http))
                // IF_REQUIRED: Only creates session when needed (OAuth2 flow needs it)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                .csrf(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(new RestAuthenticationEntryPoint())
                )
                .authorizeHttpRequests(authz -> authz
                        .requestMatchers("/",
                                "/error",
                                "/favicon.ico",
                                "/assets/**",
                                "/static/**",
                                "/public/**")
                        .permitAll()
                        .requestMatchers("/api/auth/**", "/oauth2/**", "/login/oauth2/**",
                                "/api/san-pham/**", "/api/danh-muc/**", "/api/thuong-hieu/**",
                                "/api/bai-viet/**", "/api/cart/**", "/api/upload/**",
                                "/api/don-hang/checkout", "/api/don-hang/khach-hang/**",
                                "/api/khuyen-mai/*/validate", "/api/quang-cao/**",
                                "/api/danh-gia/san-pham/**", "/api/chat/**")
                        .permitAll()
                        // Admin-only API endpoints
                        .requestMatchers("/api/tai-khoan/**", "/api/nhan-vien/**",
                                "/api/thong-ke/**",
                                "/api/nha-cung-cap/**", "/api/phieu-nhap/**",
                                "/api/hoa-don/**", "/api/gio-hang/**")
                        .hasRole("ADMIN")
                        .anyRequest()
                        .authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                        .authorizationEndpoint(authorizationEndpoint -> authorizationEndpoint
                                .baseUri("/oauth2/authorize")
                        )
                        .redirectionEndpoint(redirectionEndpoint -> redirectionEndpoint
                                .baseUri("/oauth2/callback/*")
                        )
                        .userInfoEndpoint(userInfoEndpoint -> userInfoEndpoint
                                .userService(customOAuth2UserService)
                        )
                        .successHandler(oAuth2AuthenticationSuccessHandler)
                        .failureHandler(oAuth2AuthenticationFailureHandler)
                );

        http.addFilterBefore(tokenAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
