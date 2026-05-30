package com.pcstore.repository;

import com.pcstore.entity.BaiViet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BaiVietRepository extends JpaRepository<BaiViet, Long> {
    List<BaiViet> findAllByOrderByMaBaiVietDesc();
}
