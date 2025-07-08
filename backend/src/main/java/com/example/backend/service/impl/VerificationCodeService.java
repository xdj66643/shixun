package com.example.backend.service.impl;

import com.example.backend.dto.VerificationCodeRequest;
import com.example.backend.entity.VerificationCode;
import com.example.backend.repository.VerificationCodeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
public class VerificationCodeService {

    private final VerificationCodeRepository codeRepo;

    public VerificationCodeService(VerificationCodeRepository codeRepo) {
        this.codeRepo = codeRepo;
    }

    public ResponseEntity<String> sendVerificationCode(VerificationCodeRequest request) {
        String code = String.valueOf(new Random().nextInt(899999) + 100000);
        VerificationCode vc = new VerificationCode();
        vc.setTargetType(VerificationCode.TargetType.valueOf(request.getType()));
        vc.setTargetValue(request.getTarget());
        vc.setCode(code);
        vc.setExpiredAt(LocalDateTime.now().plusMinutes(5));
        vc.setVerified(false);
        codeRepo.save(vc);
        return ResponseEntity.ok("验证码已发送（模拟）：" + code);
    }
}