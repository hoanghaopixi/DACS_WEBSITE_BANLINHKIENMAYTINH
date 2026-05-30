package com.pcstore.repository;

import com.pcstore.entity.PhieuNhap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhieuNhapRepository extends JpaRepository<PhieuNhap, Long> {
    List<PhieuNhap> findAllByOrderByMaPhieuNhapDesc();
}
