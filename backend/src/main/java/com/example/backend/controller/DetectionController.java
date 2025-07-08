package com.example.backend.controller;

import com.example.backend.entity.DetectionVideo;
import com.example.backend.entity.RoadDefect;
import com.example.backend.service.DetectionVideoService;
import com.example.backend.service.RoadDefectService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/detection")
public class DetectionController {

    private final DetectionVideoService videoService;
    private final RoadDefectService defectService;

    public DetectionController(DetectionVideoService videoService, RoadDefectService defectService) {
        this.videoService = videoService;
        this.defectService = defectService;
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadVideo(@RequestParam("file") MultipartFile file, @RequestParam("userId") Long userId) {
        return videoService.uploadVideo(file, userId);
    }

    @GetMapping("/videos")
    public List<DetectionVideo> getAllVideos() {
        return videoService.getAllVideos();
    }

    @GetMapping("/defects")
    public List<RoadDefect> getDefectsByVideo(@RequestParam("videoId") Long videoId) {
        return defectService.getDefectsByVideoId(videoId);
    }
}
