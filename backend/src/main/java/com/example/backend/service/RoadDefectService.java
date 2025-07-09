package com.example.backend.service;

import com.example.backend.entity.RoadDefect;
import java.util.List;

public interface RoadDefectService {
    List<RoadDefect> getDefectsByVideoId(Long videoId);
}