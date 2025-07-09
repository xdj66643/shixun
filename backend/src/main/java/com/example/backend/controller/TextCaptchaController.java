package com.example.backend.controller;

import com.example.backend.common.ApiResponse;
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
    public ApiResponse<TextCaptcha> generateCaptcha() {
        return ApiResponse.success(textCaptchaService.generateCaptcha().getBody());
    }

    @PostMapping("/verify")
    public ApiResponse<String> verifyCaptcha(@RequestParam String captchaId, @RequestParam String userSequence) {
        return ApiResponse.success(textCaptchaService.verifyCaptcha(captchaId, userSequence).getBody());
    }
}