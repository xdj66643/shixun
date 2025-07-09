package com.example.backend.service.impl;

import com.example.backend.common.ApiResponse;
import com.example.backend.dto.VerificationLoginRequest;
import com.example.backend.entity.User;
import com.example.backend.entity.VerificationCode;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.VerificationCodeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class LoginService {

    private final VerificationCodeRepository codeRepo;
    private final UserRepository userRepo;

    public LoginService(VerificationCodeRepository codeRepo, UserRepository userRepo) {
        this.codeRepo = codeRepo;
        this.userRepo = userRepo;
    }

    public ResponseEntity<ApiResponse<Map<String, Object>>> loginWithVerificationCode(VerificationLoginRequest request) {
        var codes = codeRepo.findByTargetValueAndTargetType(
                request.getTarget(),
                VerificationCode.TargetType.valueOf(request.getType())
        );
    
        Optional<VerificationCode> validCode = codes.stream()
                .filter(code -> code.getCode().equals(request.getCode()) &&
                        code.getExpiredAt().isAfter(LocalDateTime.now()) &&
                        !code.getVerified())
                .findFirst();
    
        if (validCode.isPresent()) {
            validCode.get().setVerified(true);
            codeRepo.save(validCode.get());
    
            Optional<User> userOpt = request.getType().equals("EMAIL")
                    ? userRepo.findByEmail(request.getTarget())
                    : userRepo.findByPhone(request.getTarget());
    
            if (userOpt.isPresent()) {
                Map<String, Object> data = new HashMap<>();
                data.put("token", "your-jwt-token"); // 这里应生成真实token
                data.put("user", userOpt.get());
                return ResponseEntity.ok(ApiResponse.success("登录成功", data));
            } else {
                return ResponseEntity.status(404).body(ApiResponse.error(404, "用户不存在"));
            }
        }
    
        return ResponseEntity.status(401).body(ApiResponse.error(401, "验证码无效或已过期"));
    }
}
