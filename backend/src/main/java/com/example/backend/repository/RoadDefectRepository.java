package com.example.backend.repository;

import com.example.backend.entity.RoadDefect;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface RoadDefectRepository extends JpaRepository<RoadDefect, Long> {
    List<RoadDefect> findByVideo_Id(Long videoId);

    @Transactional
    @Modifying
    @Query("UPDATE RoadDefect d SET d.processed = true WHERE d.id IN :ids")
    void updateProcessedByIds(List<Long> ids);

    long countByProcessedTrue();
}
