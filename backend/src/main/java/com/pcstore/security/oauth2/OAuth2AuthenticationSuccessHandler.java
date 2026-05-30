package com.pcstore.security.oauth2;

import com.pcstore.config.AppConfig;
import com.pcstore.security.TokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URI;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final TokenProvider tokenProvider;
    private final AppConfig appConfig;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        String targetUrl = determineTargetUrl(request, response, authentication);

        log.info("=== OAuth2 SUCCESS === Redirecting to: {}", targetUrl);

        if (response.isCommitted()) {
            log.debug("Response has already been committed. Unable to redirect to " + targetUrl);
            return;
        }

        clearAuthenticationAttributes(request);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    protected String determineTargetUrl(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
        // Try to get redirect_uri from session attribute (saved during authorization request)
        String redirectUri = (String) request.getSession().getAttribute("oauth2_redirect_uri");
        
        if (redirectUri == null || redirectUri.isEmpty()) {
            // Fallback: use the first authorized redirect URI from config
            redirectUri = appConfig.getAuthorizedRedirectUris().isEmpty() 
                ? "http://localhost:5173/oauth2/redirect" 
                : appConfig.getAuthorizedRedirectUris().get(0);
        }

        if (!isAuthorizedRedirectUri(redirectUri)) {
            log.warn("Unauthorized redirect URI: {}, using default", redirectUri);
            redirectUri = appConfig.getAuthorizedRedirectUris().isEmpty()
                ? "http://localhost:5173/oauth2/redirect"
                : appConfig.getAuthorizedRedirectUris().get(0);
        }

        String token = tokenProvider.createToken(authentication);
        log.info("Generated JWT token for OAuth2 user, redirecting to: {}", redirectUri);

        return UriComponentsBuilder.fromUriString(redirectUri)
                .queryParam("token", token)
                .build().toUriString();
    }

    private boolean isAuthorizedRedirectUri(String uri) {
        URI clientRedirectUri = URI.create(uri);

        return appConfig.getAuthorizedRedirectUris()
                .stream()
                .anyMatch(authorizedRedirectUri -> {
                    URI authorizedURI = URI.create(authorizedRedirectUri);
                    if(authorizedURI.getHost().equalsIgnoreCase(clientRedirectUri.getHost())
                            && authorizedURI.getPort() == clientRedirectUri.getPort()) {
                        return true;
                    }
                    return false;
                });
    }
}
