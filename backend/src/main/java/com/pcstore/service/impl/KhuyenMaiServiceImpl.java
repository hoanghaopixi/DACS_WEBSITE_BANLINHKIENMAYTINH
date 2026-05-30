package com.pcstore.service.impl;

import com.pcstore.entity.KhuyenMai;
import com.pcstore.exception.ResourceNotFoundException;
import com.pcstore.repository.KhuyenMaiRepository;
import com.pcstore.service.KhuyenMaiService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class KhuyenMaiServiceImpl implements KhuyenMaiService {

    private final KhuyenMaiRepository khuyenMaiRepository;

    @Override
    public List<KhuyenMai> getAll() {
        return khuyenMaiRepository.findAll();
    }

    @Override
    public KhuyenMai getById(Long id) {
        return khuyenMaiRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khuyến mãi ID: " + id));
    }

    @Override
    public KhuyenMai create(KhuyenMai km) {
        return khuyenMaiRepository.save(km);
    }

    @Override
    public KhuyenMai update(Long id, KhuyenMai km) {
        KhuyenMai existing = getById(id);
        existing.setTenKM(km.getTenKM());
        existing.setPhanTramGiam(km.getPhanTramGiam());
        existing.setNgayBatDau(km.getNgayBatDau());
        existing.setNgayKetThuc(km.getNgayKetThuc());
        existing.setDieuKienApDung(km.getDieuKienApDung());
        return khuyenMaiRepository.save(existing);
    }

    @Override
    public void delete(Long id) {
        getById(id); // throws if not found
        khuyenMaiRepository.deleteById(id);
    }

    @Override
    public KhuyenMai validateForCustomer(Long maKM, Long maKH) {
        KhuyenMai km = getById(maKM);
        LocalDateTime now = LocalDateTime.now();

        // Check date validity
        if (now.isBefore(km.getNgayBatDau())) {
            throw new IllegalArgumentException("Mã khuyến mãi chưa có hiệu lực.");
        }
        if (now.isAfter(km.getNgayKetThuc())) {
            throw new IllegalArgumentException("Mã khuyến mãi đã hết hạn.");
        }

        // Check if customer already used this coupon
        int usageCount = khuyenMaiRepository.countUsageByCustomer(maKH, maKM);
        if (usageCount > 0) {
            throw new IllegalArgumentException("Bạn đã sử dụng mã khuyến mãi này rồi.");
        }

        return km;
    }
}
