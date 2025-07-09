package com.example.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
@Schema(description = "用户注册请求")
public class UserRegisterRequest {
    @Schema(description = "用户名", example = "john_doe")
    private String username;

    @Schema(description = "密码", example = "123456")
    private String password;

    @Schema(description = "邮箱", example = "john@example.com")
    private String email;

    @Schema(description = "手机号", example = "13812345678")
    private String phone;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}

