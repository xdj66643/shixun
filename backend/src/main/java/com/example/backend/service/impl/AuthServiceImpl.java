package com.example.backend.service.impl;

import com.example.backend.dto.VerificationCodeRequest;
import com.example.backend.dto.VerificationLoginRequest;
import com.example.backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private final VerificationCodeService verificationCodeService;
    private final LoginService loginService;
    private final FaceRecognitionService faceRecognitionService;

    public AuthServiceImpl(VerificationCodeService verificationCodeService,
                           LoginService loginService,
                           FaceRecognitionService faceRecognitionService) {
        this.verificationCodeService = verificationCodeService;
        this.loginService = loginService;
        this.faceRecognitionService = faceRecognitionService;
    }

    @Override
    public ResponseEntity<String> sendVerificationCode(VerificationCodeRequest request) {
        return verificationCodeService.sendVerificationCode(request);
    }

    @Override
    public ResponseEntity<String> loginWithVerificationCode(VerificationLoginRequest request) {
        return loginService.loginWithVerificationCode(request);
    }

    @Override
    public ResponseEntity<String> loginWithFace(String fakeFaceId) {
        return faceRecognitionService.loginWithFace(fakeFaceId);
    }
}
