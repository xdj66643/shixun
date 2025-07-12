// src/main/java/com/example/backend/service/impl/DetectionVideoServiceImpl.java
package com.example.backend.service.impl;

import com.example.backend.entity.DetectionVideo;
import com.example.backend.entity.User;
import com.example.backend.repository.DetectionVideoRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.DetectionVideoService;
import com.example.backend.service.ImportRoadDefectService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.List;

@Service
public class DetectionVideoServiceImpl implements DetectionVideoService {

    private final DetectionVideoRepository videoRepo;
    private final UserRepository userRepository;
    private final ImportRoadDefectService importRoadDefectService;

    public DetectionVideoServiceImpl(DetectionVideoRepository videoRepo, UserRepository userRepository, ImportRoadDefectService importRoadDefectService) {
        this.videoRepo = videoRepo;
        this.userRepository = userRepository;
        this.importRoadDefectService = importRoadDefectService;
    }

    @Override
    public ResponseEntity<String> uploadVideo(MultipartFile file, Long userId) {
        DetectionVideo video = new DetectionVideo();
        String saveDir = "uploads/";
        File dir = new File(saveDir);
        if (!dir.exists()) dir.mkdirs();
        // 自动生成唯一文件名，防止重复
        String savePath = new File("uploads", file.getOriginalFilename()).getAbsolutePath();
        try (FileOutputStream fos = new FileOutputStream(savePath)) {
            fos.write(file.getBytes());
        } catch (IOException e) {
            return ResponseEntity.status(500).body("视频保存失败: " + e.getMessage());
        }
        video.setSourcePath(file.getOriginalFilename());
        if (userId != null) {
            userRepository.findById(userId).ifPresent(video::setUploadUser);
        }
        video.setCreatedAt(java.time.LocalDateTime.now());
        video.setStatus("processing");
        video.setDefectCount(0);
        video.setSize(new File(savePath).length());
        // 获取视频时长
        double duration = 0;
        try {
            String ffprobePath = "C:\\Users\\ezmoney\\Downloads\\ffmpeg-7.1.1-essentials_build\\ffmpeg-7.1.1-essentials_build\\bin\\ffprobe.exe";
            ProcessBuilder pb = new ProcessBuilder(ffprobePath, "-v", "error", "-show_entries",
                "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", savePath);
            Process process = pb.start();
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String durationStr = reader.readLine();
            System.out.println("ffprobe输出: " + durationStr);
            if (durationStr != null) {
                duration = Double.parseDouble(durationStr);
            }
        } catch (Exception e) {
            System.out.println("获取视频时长失败: " + e.getMessage());
            e.printStackTrace();
        }
        System.out.println("最终写入duration: " + (int)duration);
        video.setDuration((int)duration);
        videoRepo.save(video);
        // 调用python脚本检测，并收集详细输出
        try {
            String resultJsonName = "result_" + file.getOriginalFilename() + ".json";
            ProcessBuilder pb = new ProcessBuilder(
                "python", "../RoadDamage/detect_video.py", savePath, file.getOriginalFilename(), resultJsonName
            );
            pb.directory(new File(System.getProperty("user.dir")));
            pb.redirectErrorStream(true); // 合并标准输出和错误输出
            Process process = pb.start();
            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
            }
            int exitCode = process.waitFor();
            if (exitCode != 0) {
                return ResponseEntity.status(500).body("检测脚本执行失败:\n" + output.toString());
            }
            importRoadDefectService.importDefectsFromJson("../RoadDamage/" + resultJsonName);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("检测或导入失败: " + e.getMessage());
        }
        return ResponseEntity.ok("上传并检测完成");
    }

    @Override
    public List<DetectionVideo> getAllVideos() {
        return videoRepo.findAll();
    }
}
