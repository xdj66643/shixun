// src/main/java/com/example/backend/service/impl/TextCaptchaServiceImpl.java
package com.example.backend.service.impl;

import com.example.backend.entity.TextCaptcha;
import com.example.backend.repository.TextCaptchaRepository;
import com.example.backend.service.TextCaptchaService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class TextCaptchaServiceImpl implements TextCaptchaService {

    private final TextCaptchaRepository captchaRepo;

    public TextCaptchaServiceImpl(TextCaptchaRepository captchaRepo) {
        this.captchaRepo = captchaRepo;
    }

    @Override
    public ResponseEntity<TextCaptcha> generateCaptcha() {
        // 这里简单模拟，实际应生成图片和正确顺序
        String captchaId = UUID.randomUUID().toString();
        String correctSequence = "ABCD"; // 实际应随机生成
        TextCaptcha captcha = new TextCaptcha();
        captcha.setCaptchaId(captchaId);
        captcha.setCorrectSequence(correctSequence);
        captcha.setExpiredAt(LocalDateTime.now().plusMinutes(3));
        captchaRepo.save(captcha);
        return ResponseEntity.ok(captcha);
    }

    @Override
    public ResponseEntity<String> verifyCaptcha(String captchaId, String userSequence) {
        return captchaRepo.findByCaptchaId(captchaId)
                .filter(c -> c.getExpiredAt().isAfter(LocalDateTime.now()))
                .map(c -> c.getCorrectSequence().equalsIgnoreCase(userSequence)
                        ? ResponseEntity.ok("验证通过")
                        : ResponseEntity.status(400).body("验证码错误"))
                .orElse(ResponseEntity.status(404).body("验证码不存在或已过期"));
    }
}