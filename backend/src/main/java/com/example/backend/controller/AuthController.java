package com.example.backend.controller;

import com.example.backend.common.MultipartInputStreamFileResource;
import com.example.backend.dto.VerificationCodeRequest;
import com.example.backend.dto.VerificationLoginRequest;
import com.example.backend.entity.VerificationCode;
import com.example.backend.repository.VerificationCodeRepository;
import com.example.backend.service.AuthService;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import com.example.backend.dto.UserRegisterRequest;
import com.example.backend.dto.UserLoginRequest;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.impl.LoginService;


import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import jakarta.validation.Valid;
import com.example.backend.common.ApiResponse;
import com.example.backend.service.TextCaptchaService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final VerificationCodeRepository verificationCodeRepository;

    private final AuthService authService;

    private final UserRepository userRepository;

    private final TextCaptchaService textCaptchaService;

    private final LoginService loginService;


    public AuthController(AuthService authService, UserRepository userRepository, TextCaptchaService textCaptchaService, VerificationCodeRepository verificationCodeRepository, LoginService loginService) {
        this.authService = authService;
        this.userRepository = userRepository;
        this.textCaptchaService = textCaptchaService;
        this.verificationCodeRepository = verificationCodeRepository;
        this.loginService = loginService;
    }

    // 注册接口
    @PostMapping("/register")
    public ApiResponse<String> register(@Valid @RequestBody UserRegisterRequest request) {
        // 简单校验，实际应完善
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return ApiResponse.error(400, "用户名已存在");
        }
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        userRepository.save(user);
        return ApiResponse.success("注册成功");
    }

    // 用户名密码登录接口
    @PostMapping("/login")
    public ApiResponse<Map<String, Object>> login(@Valid @RequestBody UserLoginRequest request) {
        // 1. 校验验证码
        ResponseEntity<String> captchaResp = textCaptchaService.verifyCaptcha(request.getCaptchaId(), request.getCaptcha());
        if (!captchaResp.getStatusCode().is2xxSuccessful() || !"验证通过".equals(captchaResp.getBody())) {
        return ApiResponse.error(400, "验证码错误");
}
    
        // 2. 校验用户名和密码
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());
        if (userOpt.isPresent() && userOpt.get().getPassword().equals(request.getPassword())) {
            Map<String, Object> data = new HashMap<>();
            data.put("token", "your-jwt-token"); // 这里应生成真实token
            data.put("user", userOpt.get());
            return ApiResponse.success(data);
        }
        return ApiResponse.error(401, "用户名或密码错误");
    }
    
    @PostMapping("/send")
    public ApiResponse<String> sendCode(@Valid @RequestBody VerificationCodeRequest request) {
        String targetValue = request.getContact();
        // targetValue 不能为空
        if (targetValue == null || targetValue.isEmpty()) {
            return ApiResponse.error(400, "联系方式不能为空");
        }
        // 查找用户
        Optional<User> userOpt = userRepository.findByEmail(targetValue);
        if (!userOpt.isPresent()) {
            userOpt = userRepository.findByPhone(targetValue);
        }
        if (!userOpt.isPresent()) {
            return ApiResponse.error(404, "用户不存在");
        }
        // 判断类型
        VerificationCode.TargetType type = targetValue.contains("@") ? VerificationCode.TargetType.EMAIL : VerificationCode.TargetType.PHONE;
        // 生成验证码
        String code = String.valueOf((int)((Math.random() * 9 + 1) * 100000));
        System.out.println("【调试用】发送验证码到 " + targetValue + "，验证码：" + code);
        // 保存到数据库
        VerificationCode verificationCode = new VerificationCode();
        verificationCode.setTargetValue(targetValue);
        verificationCode.setCode(code);
        verificationCode.setTargetType(type);
        verificationCode.setCreatedAt(java.time.LocalDateTime.now());
        // TODO: 设置 expiredAt 字段
        verificationCode.setExpiredAt(java.time.LocalDateTime.now().plusMinutes(5));
        verificationCodeRepository.save(verificationCode);
        return ApiResponse.success("验证码已发送");
    }

    @PostMapping("/login/code")
    public ResponseEntity<ApiResponse<Map<String, Object>>> loginWithCode(@Valid @RequestBody VerificationLoginRequest request) {
       return loginService.loginWithVerificationCode(request);
    }

    @PostMapping("/login/face")
    public ApiResponse<Map<String, Object>> loginWithFace(@RequestParam("faceImage") MultipartFile faceImage) {
      try {
        // 1. 转发图片到 Python 服务
        String pythonUrl = "http://localhost:5001/api/recognize";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
    
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("faceImage", new MultipartInputStreamFileResource(faceImage.getInputStream(), faceImage.getOriginalFilename()));
    
        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<Map> response = restTemplate.postForEntity(pythonUrl, requestEntity, Map.class);
    
        Map<String, Object> result = response.getBody();
        if (result != null && Boolean.TRUE.equals(result.get("success"))) {
            Map<String, Object> dataMap = (Map<String, Object>) result.get("data");
            if (dataMap != null) {
                String username = (String) dataMap.get("username");
                Optional<User> userOpt = userRepository.findByUsername(username);
                if (userOpt.isPresent()) {
                    Map<String, Object> data = new HashMap<>();
                    data.put("token", "your-jwt-token"); // 生成真实token
                    data.put("user", userOpt.get());
                    return ApiResponse.success(data);
                } else {
                    return ApiResponse.error(404, "未找到用户");
                }
            } else {
                return ApiResponse.error(401, "人脸识别失败");
            }
        } else {
            return ApiResponse.error(401, "人脸识别失败");
        }
      } catch (Exception e) {
        return ApiResponse.error(500, "服务异常: " + e.getMessage());
      }
    }
}