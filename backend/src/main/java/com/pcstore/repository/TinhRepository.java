package com.pcstore.repository;

import com.pcstore.entity.Tinh;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TinhRepository extends JpaRepository<Tinh, Long> {
}
