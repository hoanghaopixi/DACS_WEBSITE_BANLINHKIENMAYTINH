package com.pcstore.repository;

import com.pcstore.entity.Xa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface XaRepository extends JpaRepository<Xa, Long> {
    List<Xa> findByHuyen_MaHuyen(Long maHuyen);
}
