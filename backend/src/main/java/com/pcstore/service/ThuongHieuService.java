package com.pcstore.service;

import com.pcstore.entity.ThuongHieu;
import java.util.List;

public interface ThuongHieuService {
    List<ThuongHieu> getAll();
    ThuongHieu getById(Long id);
    ThuongHieu create(ThuongHieu thuongHieu);
    ThuongHieu update(Long id, ThuongHieu thuongHieu);
    void delete(Long id);
}
