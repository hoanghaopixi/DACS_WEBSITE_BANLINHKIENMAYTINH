package com.pcstore.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class DanhGiaRequest {
    private Long maSP;
    private Integer diemSao;
    private String noiDung;
    private List<Media> mediaList;

    @Data
    public static class Media {
        private String url;
        private String loai; // IMAGE or VIDEO
    }
}
