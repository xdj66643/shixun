package com.example.backend.controller;

import com.example.backend.entity.TextCaptcha;
import com.example.backend.service.TextCaptchaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/captcha")
public class TextCaptchaController {

    private final TextCaptchaService textCaptchaService;

    public TextCaptchaController(TextCaptchaService textCaptchaService) {
        this.textCaptchaService = textCaptchaService;
    }

    @GetMapping("/generate")
    public ResponseEntity<TextCaptcha> generateCaptcha() {
        return textCaptchaService.generateCaptcha();
    }

    @PostMapping("/verify")
    public ResponseEntity<String> verifyCaptcha(@RequestParam String captchaId, @RequestParam String userSequence) {
        return textCaptchaService.verifyCaptcha(captchaId, userSequence);
    }
}