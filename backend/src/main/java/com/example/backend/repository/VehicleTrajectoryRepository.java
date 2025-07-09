package com.example.backend.repository;

import com.example.backend.entity.VehicleTrajectory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VehicleTrajectoryRepository extends JpaRepository<VehicleTrajectory, Long> {
}
