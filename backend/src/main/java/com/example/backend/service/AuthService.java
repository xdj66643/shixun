package com.example.backend.service;

import com.example.backend.dto.VerificationCodeRequest;
import com.example.backend.dto.VerificationLoginRequest;
import org.springframework.http.ResponseEntity;

public interface AuthService {
    ResponseEntity<String> sendVerificationCode(VerificationCodeRequest request);
    ResponseEntity<String> loginWithVerificationCode(VerificationLoginRequest request);
    ResponseEntity<String> loginWithFace(String fakeFaceId); // 模拟人脸识别
}
