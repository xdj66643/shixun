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
import com.example.backend.service.MailService;
import com.example.backend.entity.FaceLog;
import com.example.backend.repository.FaceLogRepository;
import org.springframework.core.io.FileSystemResource;


import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import jakarta.validation.Valid;
import com.example.backend.common.ApiResponse;
import com.example.backend.service.TextCaptchaService;
import java.io.File;
import java.util.Arrays;

@RestController
@RequestMapping("/api/auth")
public class    AuthController {

    private final VerificationCodeRepository verificationCodeRepository;

    private final AuthService authService;

    private final UserRepository userRepository;

    private final TextCaptchaService textCaptchaService;

    private final LoginService loginService;

    private final MailService mailService;

    private final FaceLogRepository faceLogRepository;


    public AuthController(AuthService authService, UserRepository userRepository, TextCaptchaService textCaptchaService, VerificationCodeRepository verificationCodeRepository, LoginService loginService, MailService mailService, FaceLogRepository faceLogRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
        this.textCaptchaService = textCaptchaService;
        this.verificationCodeRepository = verificationCodeRepository;
        this.loginService = loginService;
        this.mailService = mailService;
        this.faceLogRepository = faceLogRepository;
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
        // 1. 校验用户名是否存在
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());
        if (!userOpt.isPresent()) {
            return ApiResponse.error(401, "用户不存在");
        }
    
        // 2. 校验验证码
        ResponseEntity<String> captchaResp = textCaptchaService.verifyCaptcha(request.getCaptchaId(), request.getCaptcha());
        if (!captchaResp.getStatusCode().is2xxSuccessful() || !"验证通过".equals(captchaResp.getBody())) {
            return ApiResponse.error(400, "验证码错误");
        }
    
        // 3. 校验密码
        if (!userOpt.get().getPassword().equals(request.getPassword())) {
            return ApiResponse.error(401, "密码错误");
        }
    
        // 4. 登录成功
        Map<String, Object> data = new HashMap<>();
        data.put("token", "your-jwt-token"); // 这里应生成真实token
        data.put("user", userOpt.get());
        return ApiResponse.success(data);
    }
    
    @PostMapping("/send")
    public ApiResponse<String> sendCode(@Valid @RequestBody VerificationCodeRequest request) {
        String email = request.getContact();
        // 只允许邮箱
        if (email == null || email.isEmpty() || !email.contains("@")) {
            return ApiResponse.error(400, "请输入有效的邮箱地址");
        }
        // 查找用户
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (!userOpt.isPresent()) {
            return ApiResponse.error(404, "用户不存在");
        }
        // 生成验证码
        String code = String.valueOf((int)((Math.random() * 9 + 1) * 100000));
        // 发送邮件
        mailService.sendCode(email, code);
        // 保存到数据库
        VerificationCode verificationCode = new VerificationCode();
        verificationCode.setTargetValue(email);
        verificationCode.setCode(code);
        verificationCode.setTargetType(VerificationCode.TargetType.EMAIL);
        verificationCode.setCreatedAt(java.time.LocalDateTime.now());
        verificationCode.setExpiredAt(java.time.LocalDateTime.now().plusMinutes(5));
        verificationCodeRepository.save(verificationCode);
        return ApiResponse.success("验证码已发送到邮箱");
    }

    @PostMapping("/login/code")
    public ResponseEntity<ApiResponse<Map<String, Object>>> loginWithCode(@Valid @RequestBody VerificationLoginRequest request) {
       return loginService.loginWithVerificationCode(request);
    }

    @PostMapping("/login/face")
    public ApiResponse<Map<String, Object>> loginWithFace(@RequestParam("faceImage") MultipartFile faceImage) {
      try {
        // 1. 获取项目根目录绝对路径，保存图片到Facerecognition/security_logs，并命名
        String basePath = System.getProperty("user.dir");
        File logDir = new File(basePath, "Facerecognition/security_logs");
        if (!logDir.exists()) logDir.mkdirs();
        int successCount = (int) Arrays.stream(logDir.listFiles())
            .filter(f -> f.getName().startsWith("success") && f.getName().endsWith(".jpg"))
            .count();
        int failureCount = (int) Arrays.stream(logDir.listFiles())
            .filter(f -> f.getName().startsWith("failure") && f.getName().endsWith(".jpg"))
            .count();
        // 2. 先假定失败，后面如识别成功再覆盖
        boolean recognized = false;
        String reason = "人脸识别失败";
        User logUser = null;
        String saveName = "failure" + (failureCount + 1) + ".jpg";
        String savePath = logDir.getPath() + File.separator + saveName;
        faceImage.transferTo(new File(savePath));
        // 3. 调用Python服务
        String pythonUrl = "http://localhost:5001/api/recognize";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        FileSystemResource fileResource = new FileSystemResource(new File(savePath));
        body.add("faceImage", fileResource);
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
                    recognized = true;
                    reason = "识别成功";
                    logUser = userOpt.get();
                    // 更新登录时间
                    logUser.setUpdatedAt(LocalDateTime.now());
                    userRepository.save(logUser);
                    // 重新命名为successN.jpg
                    saveName = "success" + (successCount + 1) + ".jpg";
                    String newSavePath = logDir.getPath() + File.separator + saveName;
                    new File(savePath).renameTo(new File(newSavePath));
                    savePath = newSavePath;
                    Map<String, Object> data = new HashMap<>();
                    data.put("token", "your-jwt-token");
                    data.put("user", userOpt.get());
                    // 日志保存
                    FaceLog log = new FaceLog();
                    log.setUser(logUser);
                    log.setImagePath(savePath);
                    log.setRecognized(true);
                    log.setReason(reason);
                    faceLogRepository.save(log);
                    return ApiResponse.success(data);
                } else {
                    reason = "未找到用户";
                }
            }
        }
        // 失败日志保存
        FaceLog log = new FaceLog();
        log.setUser(logUser);
        log.setImagePath(savePath);
        log.setRecognized(false);
        log.setReason(reason);
        faceLogRepository.save(log);
        return ApiResponse.error(401, reason);
      } catch (Exception e) {
        // 异常日志保存
        String basePath = System.getProperty("user.dir");
        File logDir = new File(basePath, "Facerecognition/security_logs");
        if (!logDir.exists()) logDir.mkdirs();
        int failureCount = (int) Arrays.stream(logDir.listFiles())
            .filter(f -> f.getName().startsWith("failure") && f.getName().endsWith(".jpg"))
            .count();
        String saveName = "failure" + (failureCount + 1) + ".jpg";
        String savePath = logDir.getPath() + File.separator + saveName;
        try { faceImage.transferTo(new File(savePath)); } catch (Exception ignore) {}
        FaceLog log = new FaceLog();
        log.setUser(null);
        log.setImagePath(savePath);
        log.setRecognized(false);
        log.setReason("服务异常: " + e.getMessage());
        faceLogRepository.save(log);
        return ApiResponse.error(500, "服务异常: " + e.getMessage());
      }
    }
}

