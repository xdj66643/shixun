package com.example.backend.controller;

import com.example.backend.dto.VerificationCodeRequest;
import com.example.backend.dto.VerificationLoginRequest;
import com.example.backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/send")
    public ResponseEntity<String> sendCode(@Valid @RequestBody VerificationCodeRequest request) {
        return authService.sendVerificationCode(request);
    }

    @PostMapping("/login/code")
    public ResponseEntity<String> loginWithCode(@Valid @RequestBody VerificationLoginRequest request) {
        return authService.loginWithVerificationCode(request);
    }

    @PostMapping("/login/face")
    public ResponseEntity<String> loginWithFace(@RequestParam String fakeFaceId) {
        return authService.loginWithFace(fakeFaceId);
    }
}