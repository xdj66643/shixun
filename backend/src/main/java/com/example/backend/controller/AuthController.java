package com.example.backend.controller;

import com.example.backend.dto.VerificationCodeRequest;
import com.example.backend.dto.VerificationLoginRequest;
import com.example.backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.example.backend.dto.UserRegisterRequest;
import com.example.backend.dto.UserLoginRequest;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import java.util.Optional;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    private final UserRepository userRepository;

    public AuthController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    // 注册接口
    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody UserRegisterRequest request) {
        // 简单校验，实际应完善
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("用户名已存在");
        }
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        userRepository.save(user);
        return ResponseEntity.ok("注册成功");
    }

    // 用户名密码登录接口
    @PostMapping("/login")
    public ResponseEntity<String> login(@Valid @RequestBody UserLoginRequest request) {
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());
        if (userOpt.isPresent() && userOpt.get().getPassword().equals(request.getPassword())) {
            return ResponseEntity.ok("登录成功");
        }
        return ResponseEntity.status(401).body("用户名或密码错误");
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
    public ResponseEntity<String> loginWithFace(@RequestParam("faceImage") MultipartFile faceImage) {
        // 实际项目应提取faceId，这里模拟
        String fakeFaceId = "face123.jpg";
        return authService.loginWithFace(fakeFaceId);
    }
}