package com.example.backend.service;

import com.example.backend.dto.VerificationCodeRequest;
import com.example.backend.dto.VerificationLoginRequest;
import org.springframework.http.ResponseEntity;
import com.example.backend.common.ApiResponse;
import java.util.Map;

public interface AuthService {
    ResponseEntity<String> sendVerificationCode(VerificationCodeRequest request);
    ResponseEntity<ApiResponse<Map<String, Object>>> loginWithVerificationCode(VerificationLoginRequest request);
    ResponseEntity<String> loginWithFace(String fakeFaceId); // 模拟人脸识别
}
