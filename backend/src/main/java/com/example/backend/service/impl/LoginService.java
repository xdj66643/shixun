package com.example.backend.service.impl;

import com.example.backend.dto.VerificationLoginRequest;
import com.example.backend.entity.User;
import com.example.backend.entity.VerificationCode;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.VerificationCodeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class LoginService {

    private final VerificationCodeRepository codeRepo;
    private final UserRepository userRepo;

    public LoginService(VerificationCodeRepository codeRepo, UserRepository userRepo) {
        this.codeRepo = codeRepo;
        this.userRepo = userRepo;
    }

    public ResponseEntity<String> loginWithVerificationCode(VerificationLoginRequest request) {
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

            return userOpt.map(user -> ResponseEntity.ok("登录成功：" + user.getUsername()))
                    .orElse(ResponseEntity.status(404).body("用户不存在"));
        }

        return ResponseEntity.status(401).body("验证码无效或已过期");
    }
}
