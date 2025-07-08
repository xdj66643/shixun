package com.example.backend.service.impl;

import com.example.backend.entity.TrafficStatistic;
import com.example.backend.repository.TrafficStatisticRepository;
import com.example.backend.service.TrafficStatisticService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TrafficStatisticServiceImpl implements TrafficStatisticService {
    private final TrafficStatisticRepository repo;

    public TrafficStatisticServiceImpl(TrafficStatisticRepository repo) {
        this.repo = repo;
    }

    @Override
    public List<TrafficStatistic> getAllStatistics() {
        return repo.findAll();
    }
} 