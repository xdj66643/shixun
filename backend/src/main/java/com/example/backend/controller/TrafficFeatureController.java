package com.example.backend.controller;

import com.example.backend.entity.PassengerHotzone;
import com.example.backend.entity.TrafficStatistic;
import com.example.backend.entity.VehicleTrajectory;
import com.example.backend.service.PassengerHotzoneService;
import com.example.backend.service.TrafficStatisticService;
import com.example.backend.service.VehicleTrajectoryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/traffic")
public class TrafficFeatureController {
    private final PassengerHotzoneService hotzoneService;
    private final TrafficStatisticService statisticService;
    private final VehicleTrajectoryService trajectoryService;

    public TrafficFeatureController(PassengerHotzoneService hotzoneService,
                                   TrafficStatisticService statisticService,
                                   VehicleTrajectoryService trajectoryService) {
        this.hotzoneService = hotzoneService;
        this.statisticService = statisticService;
        this.trajectoryService = trajectoryService;
    }

    @GetMapping("/hotzones")
    public List<PassengerHotzone> getHotzones() {
        return hotzoneService.getAllHotzones();
    }

    @GetMapping("/statistics")
    public List<TrafficStatistic> getStatistics() {
        return statisticService.getAllStatistics();
    }

    @GetMapping("/trajectories")
    public List<VehicleTrajectory> getTrajectories() {
        return trajectoryService.getAllTrajectories();
    }
} 