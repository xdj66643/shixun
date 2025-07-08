package com.example.backend.controller;

import com.example.backend.entity.FaceLog;
import com.example.backend.entity.User;
import com.example.backend.repository.FaceLogRepository;
import com.example.backend.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Optional;

@Tag(name = "人脸登录", description = "上传图像进行人脸登录（模拟）")
@RestController
@RequestMapping("/api/face")
public class FaceLoginController {

    @Autowired
    private FaceLogRepository faceLogRepo;

    @Autowired
    private UserRepository userRepo;

    @Operation(summary = "人脸识别登录")
    @PostMapping("/login")
    public ResponseEntity<String> loginWithFace(@RequestParam("faceImage") MultipartFile faceImage) {
        String fakeExtractedId = "face123.jpg"; // 模拟提取结果

        Optional<User> userOpt = userRepo.findAll().stream()
                .filter(u -> fakeExtractedId.equals(u.getFaceId()))
                .findFirst();

        FaceLog log = new FaceLog();
        log.setImagePath(fakeExtractedId);
        log.setRecognized(userOpt.isPresent());
        log.setCreatedAt(LocalDateTime.now());

        userOpt.ifPresent(log::setUser);
        log.setReason(userOpt.isPresent() ? "识别成功" : "未匹配人脸");
        faceLogRepo.save(log);

        return userOpt.map(user -> ResponseEntity.ok("人脸登录成功：" + user.getUsername()))
                .orElse(ResponseEntity.status(401).body("识别失败"));
    }
}

