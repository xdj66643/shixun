package com.example.backend.repository;

import com.example.backend.entity.DetectionVideo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DetectionVideoRepository extends JpaRepository<DetectionVideo, Long> {
    DetectionVideo findTopBySourcePathOrderByIdDesc(String sourcePath);
    DetectionVideo findBySourcePath(String sourcePath);
}
