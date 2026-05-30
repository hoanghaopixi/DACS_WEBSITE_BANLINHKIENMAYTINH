package com.pcstore.service;

import com.pcstore.entity.QuangCao;

import java.util.List;

public interface QuangCaoService {
    List<QuangCao> getAll();
    QuangCao getById(Long id);
    QuangCao create(QuangCao qc);
    QuangCao update(Long id, QuangCao qc);
    void delete(Long id);
}
