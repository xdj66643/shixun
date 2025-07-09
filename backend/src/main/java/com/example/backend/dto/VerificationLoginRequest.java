package com.example.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
@Schema(description = "验证码登录请求")
public class VerificationLoginRequest {
    @Schema(description = "目标邮箱或手机号")
    private String target;

    @Schema(description = "验证码")
    private String code;

    @Schema(description = "类型：PHONE 或 EMAIL")
    private String type;

    public String getTarget() {
        return target;
    }

    public void setTarget(String target) {
        this.target = target;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}
