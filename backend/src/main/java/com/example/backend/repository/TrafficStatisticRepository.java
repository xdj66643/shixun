package com.example.backend.repository;

import com.example.backend.entity.TrafficStatistic;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TrafficStatisticRepository extends JpaRepository<TrafficStatistic, Long> {
}

