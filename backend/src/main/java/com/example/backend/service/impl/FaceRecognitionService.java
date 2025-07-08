package com.example.backend.service.impl;

import com.example.backend.entity.FaceLog;
import com.example.backend.entity.User;
import com.example.backend.repository.FaceLogRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class FaceRecognitionService {

    private final UserRepository userRepo;
    private final FaceLogRepository faceLogRepo;

    public FaceRecognitionService(UserRepository userRepo, FaceLogRepository faceLogRepo) {
        this.userRepo = userRepo;
        this.faceLogRepo = faceLogRepo;
    }

    public ResponseEntity<String> loginWithFace(String fakeFaceId) {
        Optional<User> userOpt = userRepo.findAll().stream()
                .filter(u -> fakeFaceId.equals(u.getFaceId()))
                .findFirst();

        FaceLog log = new FaceLog();
        log.setImagePath(fakeFaceId);
        log.setRecognized(userOpt.isPresent());
        log.setCreatedAt(LocalDateTime.now());
        userOpt.ifPresent(log::setUser);
        log.setReason(userOpt.isPresent() ? "识别成功" : "未匹配人脸");
        faceLogRepo.save(log);

        return userOpt.map(user -> ResponseEntity.ok("人脸登录成功：" + user.getUsername()))
                .orElse(ResponseEntity.status(401).body("识别失败"));
    }
}
