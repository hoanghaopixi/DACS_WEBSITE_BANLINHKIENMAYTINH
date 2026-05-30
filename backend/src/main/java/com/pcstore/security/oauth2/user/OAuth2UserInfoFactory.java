package com.pcstore.security.oauth2.user;

import com.pcstore.exception.OAuth2AuthenticationProcessingException;

import java.util.Map;

import com.pcstore.entity.TaiKhoan;

public class OAuth2UserInfoFactory {

    public static OAuth2UserInfo getOAuth2UserInfo(String registrationId, Map<String, Object> attributes) {
        if(registrationId.equalsIgnoreCase(TaiKhoan.AuthProvider.google.name())) {
            return new GoogleOAuth2UserInfo(attributes);
        } else {
            throw new OAuth2AuthenticationProcessingException("Sorry! Login with " + registrationId + " is not supported yet.");
        }
    }
}
