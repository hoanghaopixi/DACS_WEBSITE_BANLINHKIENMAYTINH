package com.pcstore.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve uploaded product images from the upload directory
        registry.addResourceHandler("/api/upload/product-images/**")
                .addResourceLocations("file:upload/product-images/");
        
        // Serve uploaded post images
        registry.addResourceHandler("/api/upload/post-images/**")
                .addResourceLocations("file:upload/post-images/");

        // Serve uploaded avatar images
        registry.addResourceHandler("/api/upload/avatars/**")
                .addResourceLocations("file:upload/avatars/");

        // Serve uploaded ad banner images
        registry.addResourceHandler("/api/upload/ad-banners/**")
                .addResourceLocations("file:upload/ad-banners/");
    }
}
