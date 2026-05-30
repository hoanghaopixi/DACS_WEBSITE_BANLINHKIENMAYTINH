package com.pcstore.repository;

import com.pcstore.entity.QuangCao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuangCaoRepository extends JpaRepository<QuangCao, Long> {
}
