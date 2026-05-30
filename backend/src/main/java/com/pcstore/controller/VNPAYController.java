package com.pcstore.controller;

import com.pcstore.entity.DonHang;
import com.pcstore.entity.HoaDon;
import com.pcstore.repository.DonHangRepository;
import com.pcstore.repository.HoaDonRepository;
import com.pcstore.service.VNPAYService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/api/vnpay")
public class VNPAYController {

    @Autowired
    private VNPAYService vnpayService;

    @Autowired
    private DonHangRepository donHangRepository;

    @Autowired
    private HoaDonRepository hoaDonRepository;

    @GetMapping("/create-payment")
    public org.springframework.http.ResponseEntity<?> createPayment(
            @RequestParam("amount") BigDecimal amount,
            @RequestParam("orderInfo") String orderInfo,
            @RequestParam("txnRef") String txnRef,
            HttpServletRequest request) {
        String paymentUrl = vnpayService.createOrder(request, amount, orderInfo, txnRef);
        return org.springframework.http.ResponseEntity.ok(java.util.Map.of("url", paymentUrl));
    }

    @GetMapping("/payment-return")
    public void paymentReturn(HttpServletRequest request, HttpServletResponse response) throws IOException {
        int paymentStatus = vnpayService.orderReturn(request);
        String vnp_TxnRef = request.getParameter("vnp_TxnRef");
        String vnp_TransactionNo = request.getParameter("vnp_TransactionNo");
        String vnp_BankCode = request.getParameter("vnp_BankCode");
        String vnp_PayDate = request.getParameter("vnp_PayDate");
        String vnp_OrderInfo = request.getParameter("vnp_OrderInfo");
        String vnp_AmountStr = request.getParameter("vnp_Amount");

        if (paymentStatus == 1) {
            // Success
            if (vnp_TxnRef != null) {
                if (vnp_TxnRef.startsWith("DH_")) {
                    Long maDonHang = Long.parseLong(vnp_TxnRef.substring(3));
                    Optional<DonHang> donHangOpt = donHangRepository.findById(maDonHang);
                    if (donHangOpt.isPresent()) {
                        DonHang dh = donHangOpt.get();
                        
                        // Prevent duplicate updates
                        Optional<HoaDon> existingHoaDon = hoaDonRepository.findByDonHang_MaDonHang(maDonHang);
                        if (existingHoaDon.isEmpty()) {
                            // Update DonHang
                            dh.setTrangThai("Đã xác nhận");
                            donHangRepository.save(dh);

                            // Auto create HoaDon
                            HoaDon hoaDon = HoaDon.builder()
                                    .donHang(dh)
                                    .tongTien(dh.getTongTien())
                                    .trangThaiThanhToan("Đã thanh toán")
                                    .hinhThucThanhToan("VNPay")
                                    .thoiDiemThanhToan(LocalDateTime.now())
                                    .khuyenMai(dh.getSoTienGiam())
                                    .maKM(dh.getMaKM())
                                    .vnpTxnRef(vnp_TxnRef)
                                    .vnpTransactionNo(vnp_TransactionNo)
                                    .vnpBankCode(vnp_BankCode)
                                    .vnpPayDate(vnp_PayDate)
                                    .vnpOrderInfo(vnp_OrderInfo)
                                    .build();
                            hoaDonRepository.save(hoaDon);
                        }
                    }
                } else if (vnp_TxnRef.startsWith("HD_")) {
                    Long maHoaDon = Long.parseLong(vnp_TxnRef.substring(3));
                    Optional<HoaDon> hoaDonOpt = hoaDonRepository.findById(maHoaDon);
                    if (hoaDonOpt.isPresent()) {
                        HoaDon hd = hoaDonOpt.get();
                        if (!"Đã thanh toán".equals(hd.getTrangThaiThanhToan())) {
                            hd.setTrangThaiThanhToan("Đã thanh toán");
                            hd.setHinhThucThanhToan("VNPay");
                            hd.setThoiDiemThanhToan(LocalDateTime.now());
                            hd.setVnpTxnRef(vnp_TxnRef);
                            hd.setVnpTransactionNo(vnp_TransactionNo);
                            hd.setVnpBankCode(vnp_BankCode);
                            hd.setVnpPayDate(vnp_PayDate);
                            hd.setVnpOrderInfo(vnp_OrderInfo);
                            hoaDonRepository.save(hd);
                            
                            // Cập nhật DonHang thành Hoàn thành
                            DonHang dh = hd.getDonHang();
                            if (dh != null && !"Hoàn thành".equals(dh.getTrangThai())) {
                                dh.setTrangThai("Hoàn thành");
                                donHangRepository.save(dh);
                            }
                        }
                    }
                }
            }
            response.sendRedirect("http://localhost:5173/payment-result?status=success&orderId=" + vnp_TxnRef + "&transactionId=" + vnp_TransactionNo);
        } else {
            // Failed or Invalid Signature
            response.sendRedirect("http://localhost:5173/payment-result?status=fail&orderId=" + vnp_TxnRef);
        }
    }

    @GetMapping("/payment-ipn")
    public org.springframework.http.ResponseEntity<?> paymentIpn(HttpServletRequest request) {
        int paymentStatus = vnpayService.orderReturn(request);
        String vnp_TxnRef = request.getParameter("vnp_TxnRef");
        String vnp_TransactionNo = request.getParameter("vnp_TransactionNo");
        String vnp_BankCode = request.getParameter("vnp_BankCode");
        String vnp_PayDate = request.getParameter("vnp_PayDate");
        String vnp_OrderInfo = request.getParameter("vnp_OrderInfo");

        if (paymentStatus == 1) {
            // Success
            if (vnp_TxnRef != null) {
                if (vnp_TxnRef.startsWith("DH_")) {
                    Long maDonHang = Long.parseLong(vnp_TxnRef.substring(3));
                    Optional<DonHang> donHangOpt = donHangRepository.findById(maDonHang);
                    if (donHangOpt.isPresent()) {
                        DonHang dh = donHangOpt.get();
                        Optional<HoaDon> existingHoaDon = hoaDonRepository.findByDonHang_MaDonHang(maDonHang);
                        if (existingHoaDon.isEmpty()) {
                            dh.setTrangThai("Đã xác nhận");
                            donHangRepository.save(dh);

                            HoaDon hoaDon = HoaDon.builder()
                                    .donHang(dh)
                                    .tongTien(dh.getTongTien())
                                    .trangThaiThanhToan("Đã thanh toán")
                                    .hinhThucThanhToan("VNPay")
                                    .thoiDiemThanhToan(LocalDateTime.now())
                                    .khuyenMai(dh.getSoTienGiam())
                                    .maKM(dh.getMaKM())
                                    .vnpTxnRef(vnp_TxnRef)
                                    .vnpTransactionNo(vnp_TransactionNo)
                                    .vnpBankCode(vnp_BankCode)
                                    .vnpPayDate(vnp_PayDate)
                                    .vnpOrderInfo(vnp_OrderInfo)
                                    .build();
                            hoaDonRepository.save(hoaDon);
                        }
                    } else {
                        return org.springframework.http.ResponseEntity.ok(java.util.Map.of("RspCode", "01", "Message", "Order not found"));
                    }
                } else if (vnp_TxnRef.startsWith("HD_")) {
                    Long maHoaDon = Long.parseLong(vnp_TxnRef.substring(3));
                    Optional<HoaDon> hoaDonOpt = hoaDonRepository.findById(maHoaDon);
                    if (hoaDonOpt.isPresent()) {
                        HoaDon hd = hoaDonOpt.get();
                        if (!"Đã thanh toán".equals(hd.getTrangThaiThanhToan())) {
                            hd.setTrangThaiThanhToan("Đã thanh toán");
                            hd.setHinhThucThanhToan("VNPay");
                            hd.setThoiDiemThanhToan(LocalDateTime.now());
                            hd.setVnpTxnRef(vnp_TxnRef);
                            hd.setVnpTransactionNo(vnp_TransactionNo);
                            hd.setVnpBankCode(vnp_BankCode);
                            hd.setVnpPayDate(vnp_PayDate);
                            hd.setVnpOrderInfo(vnp_OrderInfo);
                            hoaDonRepository.save(hd);
                            
                            DonHang dh = hd.getDonHang();
                            if (dh != null && !"Hoàn thành".equals(dh.getTrangThai())) {
                                dh.setTrangThai("Hoàn thành");
                                donHangRepository.save(dh);
                            }
                        }
                    } else {
                        return org.springframework.http.ResponseEntity.ok(java.util.Map.of("RspCode", "01", "Message", "Order not found"));
                    }
                }
            }
            return org.springframework.http.ResponseEntity.ok(java.util.Map.of("RspCode", "00", "Message", "Confirm Success"));
        } else if (paymentStatus == 0) {
            return org.springframework.http.ResponseEntity.ok(java.util.Map.of("RspCode", "02", "Message", "Order already confirmed or failed"));
        } else {
            return org.springframework.http.ResponseEntity.ok(java.util.Map.of("RspCode", "97", "Message", "Invalid Checksum"));
        }
    }
}
