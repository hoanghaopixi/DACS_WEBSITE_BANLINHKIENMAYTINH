package com.pcstore.repository;

import com.pcstore.entity.Huyen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HuyenRepository extends JpaRepository<Huyen, Long> {
    List<Huyen> findByTinh_MaTinh(Long maTinh);
}
