package com.example.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
@Schema(description = "用户登录请求")
public class UserLoginRequest {
    @Schema(description = "用户名", example = "john_doe")
    private String username;

    @Schema(description = "密码", example = "123456")
    private String password;
}
