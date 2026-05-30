package com.pcstore.service.impl;

import com.pcstore.entity.QuangCao;
import com.pcstore.exception.ResourceNotFoundException;
import com.pcstore.repository.QuangCaoRepository;
import com.pcstore.service.QuangCaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class QuangCaoServiceImpl implements QuangCaoService {

    private final QuangCaoRepository quangCaoRepository;

    @Override
    public List<QuangCao> getAll() {
        return quangCaoRepository.findAll();
    }

    @Override
    public QuangCao getById(Long id) {
        return quangCaoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy quảng cáo ID: " + id));
    }

    @Override
    public QuangCao create(QuangCao qc) {
        return quangCaoRepository.save(qc);
    }

    @Override
    public QuangCao update(Long id, QuangCao qc) {
        QuangCao existing = getById(id);
        existing.setTieuDe(qc.getTieuDe());
        existing.setHinhAnh(qc.getHinhAnh());
        existing.setLinkRedirect(qc.getLinkRedirect());
        return quangCaoRepository.save(existing);
    }

    @Override
    public void delete(Long id) {
        getById(id);
        quangCaoRepository.deleteById(id);
    }
}
