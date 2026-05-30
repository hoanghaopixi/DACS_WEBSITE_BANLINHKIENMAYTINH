package com.pcstore.repository;

import com.pcstore.entity.VaiTro;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VaiTroRepository extends JpaRepository<VaiTro, Long> {
    Optional<VaiTro> findByTenVaiTroIgnoreCase(String tenVaiTro);
}
