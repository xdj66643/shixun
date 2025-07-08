// src/main/java/com/example/backend/service/impl/DetectionVideoServiceImpl.java
package com.example.backend.service.impl;

import com.example.backend.entity.DetectionVideo;
import com.example.backend.repository.DetectionVideoRepository;
import com.example.backend.service.DetectionVideoService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class DetectionVideoServiceImpl implements DetectionVideoService {

    private final DetectionVideoRepository videoRepo;

    public DetectionVideoServiceImpl(DetectionVideoRepository videoRepo) {
        this.videoRepo = videoRepo;
    }

    @Override
    public ResponseEntity<String> uploadVideo(MultipartFile file, Long userId) {
        // 这里只做模拟，实际应保存文件并记录
        DetectionVideo video = new DetectionVideo();
        video.setSourcePath(file.getOriginalFilename());
        // video.setUploadUser(...); // 需要根据userId查User
        videoRepo.save(video);
        return ResponseEntity.ok("上传成功");
    }

    @Override
    public List<DetectionVideo> getAllVideos() {
        return videoRepo.findAll();
    }
}
