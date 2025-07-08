package com.example.backend.controller;

import com.example.backend.common.ApiResponse;
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
    public ApiResponse<List<PassengerHotzone>> getHotzones() {
        return ApiResponse.success(hotzoneService.getAllHotzones());
    }

    @GetMapping("/statistics")
    public ApiResponse<List<TrafficStatistic>> getStatistics() {
        return ApiResponse.success(statisticService.getAllStatistics());
    }

    @GetMapping("/trajectories")
    public ApiResponse<List<VehicleTrajectory>> getTrajectories() {
        return ApiResponse.success(trajectoryService.getAllTrajectories());
    }
} 