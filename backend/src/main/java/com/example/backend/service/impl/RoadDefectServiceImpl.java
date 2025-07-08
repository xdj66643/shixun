// src/main/java/com/example/backend/service/impl/RoadDefectServiceImpl.java
package com.example.backend.service.impl;

import com.example.backend.entity.RoadDefect;
import com.example.backend.repository.RoadDefectRepository;
import com.example.backend.service.RoadDefectService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoadDefectServiceImpl implements RoadDefectService {

    private final RoadDefectRepository defectRepo;

    public RoadDefectServiceImpl(RoadDefectRepository defectRepo) {
        this.defectRepo = defectRepo;
    }

    @Override
    public List<RoadDefect> getDefectsByVideoId(Long videoId) {
        return defectRepo.findByVideo_Id(videoId);
    }
}
