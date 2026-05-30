package com.pcstore.repository;

import com.pcstore.entity.KhachHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface KhachHangRepository extends JpaRepository<KhachHang, Long> {
    boolean existsByEmailIgnoreCase(String email);
    boolean existsBySdt(String sdt);
    java.util.Optional<KhachHang> findByEmailIgnoreCase(String email);
}
