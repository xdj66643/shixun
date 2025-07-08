package com.example.backend.service;

import com.example.backend.entity.TextCaptcha;
import org.springframework.http.ResponseEntity;

public interface TextCaptchaService {
    ResponseEntity<TextCaptcha> generateCaptcha();
    ResponseEntity<String> verifyCaptcha(String captchaId, String userSequence);
}