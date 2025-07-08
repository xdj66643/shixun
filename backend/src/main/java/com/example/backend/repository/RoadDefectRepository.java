package com.example.backend.repository;

import com.example.backend.entity.RoadDefect;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoadDefectRepository extends JpaRepository<RoadDefect, Long> {
    List<RoadDefect> findByVideo_Id(Long videoId);
}
