package com.example.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
@Schema(description = "验证码发送请求")
public class VerificationCodeRequest {
    @Schema(description = "目标邮箱或手机号", example = "user@example.com 或 13812345678")
    private String target;

    @Schema(description = "目标类型", example = "EMAIL 或 PHONE")
    private String type;

    public String getTarget() {
        return target;
    }

    public void setTarget(String target) {
        this.target = target;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}
