package com.example.backend.service;

import com.example.backend.entity.DetectionVideo;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface DetectionVideoService {
    ResponseEntity<String> uploadVideo(MultipartFile file, Long userId);
    List<DetectionVideo> getAllVideos();
}
