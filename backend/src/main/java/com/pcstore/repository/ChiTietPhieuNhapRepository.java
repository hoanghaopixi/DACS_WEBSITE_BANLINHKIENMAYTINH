package com.pcstore.repository;

import com.pcstore.entity.ChiTietPhieuNhap;
import com.pcstore.entity.ChiTietPhieuNhapId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChiTietPhieuNhapRepository extends JpaRepository<ChiTietPhieuNhap, ChiTietPhieuNhapId> {
    List<ChiTietPhieuNhap> findByPhieuNhap_MaPhieuNhap(Long maPhieuNhap);
}
