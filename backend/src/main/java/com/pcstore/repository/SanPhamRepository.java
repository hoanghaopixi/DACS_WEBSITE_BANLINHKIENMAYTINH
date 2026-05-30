package com.pcstore.repository;

import com.pcstore.entity.SanPham;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SanPhamRepository extends JpaRepository<SanPham, Long> {
    @Override
    @EntityGraph(attributePaths = {"danhMuc", "thuongHieu"})
    List<SanPham> findAll();

    @Override
    @EntityGraph(attributePaths = {"danhMuc", "thuongHieu"})
    Optional<SanPham> findById(Long id);

    @EntityGraph(attributePaths = {"danhMuc", "thuongHieu"})
    List<SanPham> findTop8ByOrderByMaSPDesc();

    @Query("""
            select sp from SanPham sp
            left join sp.danhMuc dm
            left join sp.thuongHieu th
            where lower(sp.tenSP) like lower(concat('%', :keyword, '%'))
               or lower(coalesce(sp.moTa, '')) like lower(concat('%', :keyword, '%'))
               or lower(coalesce(dm.tenDanhMuc, '')) like lower(concat('%', :keyword, '%'))
               or lower(coalesce(th.tenThuongHieu, '')) like lower(concat('%', :keyword, '%'))
            order by sp.maSP desc
            """)
    @EntityGraph(attributePaths = {"danhMuc", "thuongHieu"})
    List<SanPham> searchByKeyword(String keyword);

    @EntityGraph(attributePaths = {"danhMuc", "thuongHieu"})
    List<SanPham> findByMaSPIn(List<Long> ids);

    @Query(value = "SELECT dm.TenDanhMuc, COUNT(sp.MaSP) " +
                   "FROM DanhMuc dm " +
                   "LEFT JOIN SanPham sp ON dm.MaDanhMuc = sp.MaDanhMuc " +
                   "GROUP BY dm.MaDanhMuc, dm.TenDanhMuc", nativeQuery = true)
    List<Object[]> getCategoryStats();
    
    @EntityGraph(attributePaths = {"danhMuc", "thuongHieu"})
    List<SanPham> findByDanhMuc_TenDanhMucContainingIgnoreCase(String keyword);

    long countByDanhMuc_MaDanhMuc(Long maDanhMuc);
}
