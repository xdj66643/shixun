package com.example.backend.service.impl;

import com.example.backend.entity.VehicleTrajectory;
import com.example.backend.repository.VehicleTrajectoryRepository;
import com.example.backend.service.VehicleTrajectoryService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VehicleTrajectoryServiceImpl implements VehicleTrajectoryService {
    private final VehicleTrajectoryRepository repo;

    public VehicleTrajectoryServiceImpl(VehicleTrajectoryRepository repo) {
        this.repo = repo;
    }

    @Override
    public List<VehicleTrajectory> getAllTrajectories() {
        return repo.findAll();
    }
} 