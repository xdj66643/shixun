package com.example.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
@Schema(description = "人脸登录请求")
public class FaceLoginRequest {

    @Schema(description = "上传的人脸图像")
    private MultipartFile faceImage;

}
