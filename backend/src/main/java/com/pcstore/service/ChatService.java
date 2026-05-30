package com.pcstore.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pcstore.dto.request.ChatRequest;
import com.pcstore.dto.response.ChatResponse;
import com.pcstore.entity.SanPham;
import com.pcstore.entity.TaiKhoan;
import com.pcstore.repository.SanPhamRepository;
import com.pcstore.repository.TaiKhoanRepository;
import com.pcstore.entity.ChatSession;
import com.pcstore.entity.ChatMessage;
import com.pcstore.repository.ChatSessionRepository;
import com.pcstore.repository.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.text.Normalizer;
import java.util.regex.Pattern;

@Service
public class ChatService {

    @Autowired
    private SanPhamRepository sanPhamRepository;

    @Autowired
    private TaiKhoanRepository taiKhoanRepository;

    @Autowired
    private ChatSessionRepository chatSessionRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent}")
    private String geminiApiUrl;

    public static String removeAccents(String s) {
        if (s == null) return "";
        String temp = Normalizer.normalize(s, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return pattern.matcher(temp).replaceAll("").replace('đ','d').replace('Đ','D').toLowerCase();
    }

    public ChatResponse processChat(ChatRequest request) {
        String userMessage = request.getMessage();
        String userMsgNorm = removeAccents(userMessage);
        ChatResponse response = new ChatResponse();
        
        // Lấy MaKH từ TaiKhoan (FK chat_sessions.user_id → khachhang.MaKH)
        Long currentCustomerId = null;
        try {
            Object principal = org.springframework.security.core.context.SecurityContextHolder
                    .getContext().getAuthentication().getPrincipal();
            if (principal instanceof com.pcstore.security.UserPrincipal) {
                Long maTK = ((com.pcstore.security.UserPrincipal) principal).getId();
                TaiKhoan tk = taiKhoanRepository.findById(maTK).orElse(null);
                if (tk != null && tk.getKhachHang() != null) {
                    currentCustomerId = tk.getKhachHang().getMaKH();
                }
                // Admin không có KhachHang → currentCustomerId = null (OK)
            }
        } catch (Exception ignored) {}

        String sessionId = request.getSessionId();
        ChatSession chatSession = null;
        try {
            if (sessionId == null || sessionId.trim().isEmpty()) {
                sessionId = UUID.randomUUID().toString();
                chatSession = ChatSession.builder()
                    .id(sessionId)
                    .userId(currentCustomerId)
                    .status("ACTIVE")
                    .build();
                chatSessionRepository.save(chatSession);
            } else {
                chatSession = chatSessionRepository.findById(sessionId).orElse(null);
                if (chatSession == null) {
                    chatSession = ChatSession.builder()
                        .id(sessionId)
                        .userId(currentCustomerId)
                        .status("ACTIVE")
                        .build();
                    chatSessionRepository.save(chatSession);
                } else if (chatSession.getUserId() == null && currentCustomerId != null) {
                    chatSession.setUserId(currentCustomerId);
                    chatSessionRepository.save(chatSession);
                }
            }
        } catch (Exception e) {
            // FK hoặc DB error → vẫn cho chat, chỉ không lưu session
            System.err.println("ChatService: Session error - " + e.getMessage());
            chatSession = null;
            sessionId = UUID.randomUUID().toString();
        }
        response.setSessionId(sessionId);

        if (chatSession != null) {
            ChatMessage userMsg = ChatMessage.builder()
                .id(UUID.randomUUID().toString())
                .session(chatSession)
                .senderType("USER")
                .messageText(request.getMessage())
                .build();
            chatMessageRepository.save(userMsg);
        }

        // 1. Phân tích ý định & RAG: Tìm sản phẩm
        List<SanPham> sanPhams = sanPhamRepository.findAll();
        List<SanPham> filteredSanPhams = new ArrayList<>();
        
        // Trích xuất các danh mục hiện có từ CSDL (dạng không dấu)
        List<String> dbCategoriesNorm = sanPhams.stream()
                .filter(p -> p.getDanhMuc() != null && p.getDanhMuc().getTenDanhMuc() != null)
                .map(p -> removeAccents(p.getDanhMuc().getTenDanhMuc()))
                .distinct()
                .collect(Collectors.toList());

        // Lọc thông minh: Kết hợp danh mục từ DB và từ khóa tùy chỉnh (so sánh không dấu)
        filteredSanPhams = sanPhams.stream().filter(p -> {
            String tenSpNorm = removeAccents(p.getTenSP());
            String tenDmNorm = (p.getDanhMuc() != null && p.getDanhMuc().getTenDanhMuc() != null) 
                            ? removeAccents(p.getDanhMuc().getTenDanhMuc()) : "";
            
            // 1. Kiểm tra khớp danh mục trong DB
            for (String category : dbCategoriesNorm) {
                if (userMsgNorm.contains(category) && tenDmNorm.contains(category)) {
                    return true;
                }
            }

            // 2. Fallback cho các từ khóa phổ biến (VGA, CPU, Màn hình, v.v.)
            boolean isVGA = userMsgNorm.contains("vga") || userMsgNorm.contains("card") || userMsgNorm.contains("gpu");
            if (isVGA && (tenSpNorm.contains("rtx") || tenSpNorm.contains("gtx") || tenSpNorm.contains("rx") || tenSpNorm.contains("vga"))) return true;
            
            boolean isCPU = userMsgNorm.contains("cpu") || userMsgNorm.contains("chip") || userMsgNorm.contains("core");
            if (isCPU && (tenSpNorm.contains("cpu") || tenSpNorm.contains("core") || tenSpNorm.contains("ryzen") || tenSpNorm.contains("intel"))) return true;
            
            boolean isManHinh = userMsgNorm.contains("man hinh") || userMsgNorm.contains("monitor");
            if (isManHinh && (tenSpNorm.contains("man") || tenDmNorm.contains("man"))) return true;
            
            // 3. Khớp từ khóa từng phần (word match)
            String[] words = userMsgNorm.split("\\s+");
            for (String w : words) {
                // Áp dụng so sánh gần đúng cơ bản (từ khóa dài > 3 ký tự)
                if (w.length() > 3 && tenSpNorm.contains(w)) return true;
            }
            
            return false;
        }).limit(30).collect(Collectors.toList());

        // Nếu vẫn không có dữ liệu (hỏi chung chung), bốc đại sản phẩm để AI có context
        if (filteredSanPhams.isEmpty() || userMsgNorm.contains("build") || userMsgNorm.contains("cau hinh") || userMsgNorm.contains("re nhat")) {
             boolean isBuildPC = userMsgNorm.contains("build") || userMsgNorm.contains("cau hinh") || userMsgNorm.contains("pc");
             if (isBuildPC) {
                 java.util.List<String> requiredCategories = java.util.Arrays.asList("cpu", "main", "ram", "vga", "nguon", "case", "ssd", "hdd", "man hinh");
                 filteredSanPhams = new ArrayList<>();
                 for (String cat : requiredCategories) {
                     filteredSanPhams.addAll(sanPhams.stream()
                         .filter(p -> p.getDanhMuc() != null && removeAccents(p.getDanhMuc().getTenDanhMuc()).contains(cat))
                         .limit(3)
                         .collect(Collectors.toList()));
                 }
                 if (filteredSanPhams.size() < 10) {
                     filteredSanPhams.addAll(sanPhams.stream().limit(10).collect(Collectors.toList()));
                 }
             } else {
                 filteredSanPhams = sanPhams.stream().limit(20).collect(Collectors.toList());
             }
        }

        // (Bỏ qua việc nạp sẵn suggestedProducts, sẽ lọc lại sau khi có câu trả lời của AI)

        // 3. Nếu chưa có API Key, fallback về mock text
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty() || geminiApiKey.contains("YOUR_API_KEY")) {
            response.setReplyText("Đây là dữ liệu mock (Backend chưa cấu hình Gemini API Key). Dựa trên yêu cầu của bạn, cửa hàng có các linh kiện phù hợp bên dưới:");
            List<ChatResponse.SuggestedProduct> fallbackProducts = filteredSanPhams.stream().limit(4).map(p -> {
                ChatResponse.SuggestedProduct sp = new ChatResponse.SuggestedProduct();
                sp.setProductId(p.getMaSP()); sp.setName(p.getTenSP()); sp.setPrice(p.getGiaBan()); sp.setImage(p.getHinhAnh() != null ? p.getHinhAnh() : "https://via.placeholder.com/80"); return sp;
            }).collect(Collectors.toList());
            response.setSuggestedProducts(fallbackProducts);
            return response;
        }

        // 4. Xây dựng Context chi tiết (thương hiệu, tồn kho, bảo hành)
        String contextData = filteredSanPhams.stream()
                .map(p -> {
                    StringBuilder sb = new StringBuilder();
                    sb.append("[ID:").append(p.getMaSP()).append("] ").append(p.getTenSP());
                    if (p.getThuongHieu() != null && p.getThuongHieu().getTenThuongHieu() != null) {
                        sb.append(" | TH: ").append(p.getThuongHieu().getTenThuongHieu());
                    }
                    if (p.getDanhMuc() != null) sb.append(" | DM: ").append(p.getDanhMuc().getTenDanhMuc());
                    sb.append(" | Giá: ").append(String.format("%,.0f", p.getGiaBan())).append("đ");
                    if (p.getGiaKM() != null && p.getGiaKM().compareTo(java.math.BigDecimal.ZERO) > 0) {
                        sb.append(" (KM: ").append(String.format("%,.0f", p.getGiaKM())).append("đ)");
                    }
                    sb.append(" | Tồn: ").append(p.getSoLuongTon() != null ? p.getSoLuongTon() : 0);
                    if (p.getBaoHanh() != null && p.getBaoHanh() > 0) sb.append(" | BH: ").append(p.getBaoHanh()).append("th");
                    return sb.toString();
                })
                .collect(Collectors.joining("\n"));

        // 5. Prompt NGHIÊM NGẶT - chống bịa sản phẩm
        String prompt = "Bạn là 'Trợ lý HHPC' của cửa hàng Hoàng Hảo PC.\n\n"
                + "=== QUY TẮC BẮT BUỘC ===\n"
                + "1. CHỈ ĐƯỢC gợi ý sản phẩm CÓ TRONG danh sách kho hàng bên dưới. TUYỆT ĐỐI KHÔNG bịa/nghĩ ra sản phẩm nào KHÔNG CÓ trong danh sách.\n"
                + "2. Khi gợi ý, PHẢI ghi ĐÚNG tên và giá như trong danh sách, kèm tag [ID:x].\n"
                + "3. Nếu kho không có sản phẩm phù hợp, nói thật: 'Hiện kho chưa có SP phù hợp, bạn liên hệ cửa hàng nhé!'\n"
                + "4. Trả lời ngắn gọn, dùng Markdown, thân thiện.\n"
                + "5. Nếu khách yêu cầu BUILD PC / cấu hình máy, PHẢI tư vấn ĐẦY ĐỦ TẤT CẢ các linh kiện sau (không được thiếu bất kỳ mục nào):\n"
                + "   - CPU (Bộ vi xử lý)\n"
                + "   - Mainboard (Bo mạch chủ)\n"
                + "   - RAM (Bộ nhớ)\n"
                + "   - VGA/GPU (Card đồ họa)\n"
                + "   - SSD/HDD (Ổ cứng)\n"
                + "   - PSU/Nguồn (Bộ nguồn)\n"
                + "   - Case/Vỏ máy tính\n"
                + "   - Phím/Chuột/Tai nghe\n"
                + "   Nếu kho thiếu loại nào, ghi rõ: 'Kho chưa có [loại linh kiện], bạn liên hệ cửa hàng để được hỗ trợ.'\n"
                + "   Cuối cùng TỔNG GIÁ cả bộ PC.\n"
                + "6. Từ chối lịch sự nếu hỏi ngoài lề (không liên quan linh kiện/PC).\n"
                + "7. Hiển thị giá VNĐ, ví dụ: 7.400.000đ.\n\n"
                + "=== KHO HÀNG (chỉ có bấy nhiêu, KHÔNG bịa thêm) ===\n" + contextData + "\n\n"
                + "=== KHÁCH HỎI ===\n"
                + "\"" + request.getMessage() + "\"";

        // 5. Gửi request tới Gemini API
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("X-goog-api-key", geminiApiKey);

            String requestBody = "{\n" +
                    "  \"contents\": [{\n" +
                    "    \"parts\":[{\"text\": \"" + prompt.replace("\"", "\\\"").replace("\n", " ") + "\"}]\n" +
                    "  }]\n" +
                    "}";

            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);
            String url = geminiApiUrl;

            ResponseEntity<String> apiResponse = restTemplate.postForEntity(url, entity, String.class);
            
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(apiResponse.getBody());
            String aiText = root.path("candidates").get(0)
                                .path("content").path("parts").get(0)
                                .path("text").asText();
                                
            // Xử lý: Trích xuất TẤT CẢ sản phẩm AI đề cập (ID tag + tên)
            List<ChatResponse.SuggestedProduct> finalUIProducts = new ArrayList<>();
            java.util.Set<Long> addedIds = new java.util.HashSet<>();
            
            // 1. Ưu tiên parse [ID:x] tags
            for (SanPham p : filteredSanPhams) {
                String idTag = "[ID:" + p.getMaSP() + "]";
                if (aiText.contains(idTag)) {
                    ChatResponse.SuggestedProduct sp = new ChatResponse.SuggestedProduct();
                    sp.setProductId(p.getMaSP());
                    sp.setName(p.getTenSP());
                    sp.setPrice(p.getGiaBan());
                    sp.setImage(p.getHinhAnh() != null ? p.getHinhAnh() : "https://via.placeholder.com/80");
                    finalUIProducts.add(sp);
                    addedIds.add(p.getMaSP());
                    aiText = aiText.replace(idTag, "");
                }
            }
            
            // 2. BỔ SUNG: tìm thêm SP mà AI nhắc tên nhưng không có tag ID (tránh trùng)
            for (SanPham p : filteredSanPhams) {
                if (addedIds.contains(p.getMaSP())) continue;
                if (aiText.toLowerCase().contains(p.getTenSP().toLowerCase())) {
                    ChatResponse.SuggestedProduct sp = new ChatResponse.SuggestedProduct();
                    sp.setProductId(p.getMaSP());
                    sp.setName(p.getTenSP());
                    sp.setPrice(p.getGiaBan());
                    sp.setImage(p.getHinhAnh() != null ? p.getHinhAnh() : "https://via.placeholder.com/80");
                    finalUIProducts.add(sp);
                    addedIds.add(p.getMaSP());
                }
            }
            
            // Dọn dẹp tag còn sót lại
            aiText = aiText.replaceAll("\\[ID:\\d+\\]", "").trim();
            response.setReplyText(aiText);

            if (!finalUIProducts.isEmpty()) {
                response.setSuggestedProducts(finalUIProducts);
            }
            
        } catch (Exception e) {
            e.printStackTrace();
            response.setReplyText("Xin lỗi, hệ thống AI đang quá tải. Bạn xem tạm các sản phẩm bên dưới nhé!");
            // Hiển thị ngẫu nhiên tối đa 10 SP từ CSDL
            try {
                List<SanPham> allProducts = sanPhamRepository.findAll();
                java.util.Collections.shuffle(allProducts);
                List<ChatResponse.SuggestedProduct> randomProducts = allProducts.stream()
                    .limit(10)
                    .map(p -> {
                        ChatResponse.SuggestedProduct sp = new ChatResponse.SuggestedProduct();
                        sp.setProductId(p.getMaSP());
                        sp.setName(p.getTenSP());
                        sp.setPrice(p.getGiaBan());
                        sp.setImage(p.getHinhAnh() != null ? p.getHinhAnh() : "https://via.placeholder.com/80");
                        return sp;
                    }).collect(Collectors.toList());
                response.setSuggestedProducts(randomProducts);
            } catch (Exception ignored) {}
        }

        if (chatSession != null && response.getReplyText() != null) {
            ChatMessage aiMsg = ChatMessage.builder()
                .id(UUID.randomUUID().toString())
                .session(chatSession)
                .senderType("BOT")
                .messageText(response.getReplyText())
                .build();
            chatMessageRepository.save(aiMsg);
        }

        return response;
    }
}
