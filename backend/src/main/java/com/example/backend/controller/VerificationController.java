package com.example.backend.controller;

import com.example.backend.dto.VerificationCodeRequest;
import com.example.backend.dto.VerificationLoginRequest;
import com.example.backend.entity.VerificationCode;
import com.example.backend.entity.User;
import com.example.backend.repository.VerificationCodeRepository;
import com.example.backend.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Tag(name = "验证码登录", description = "支持邮箱/手机验证码登录")
@RestController
@RequestMapping("/api/verify")
public class VerificationController {

    @Autowired
    private VerificationCodeRepository codeRepo;

    @Autowired
    private UserRepository userRepo;

    @Operation(summary = "发送验证码")
    @PostMapping("/send")
    public ResponseEntity<String> sendCode(@RequestBody VerificationCodeRequest request) {
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

    @Operation(summary = "验证码登录")
    @PostMapping("/login")
    public ResponseEntity<String> loginWithCode(@RequestBody VerificationLoginRequest request) {
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