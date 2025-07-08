// src/main/java/com/example/backend/service/impl/TextCaptchaServiceImpl.java
package com.example.backend.service.impl;

import com.example.backend.entity.TextCaptcha;
import com.example.backend.repository.TextCaptchaRepository;
import com.example.backend.service.TextCaptchaService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.UUID;

@Service
public class TextCaptchaServiceImpl implements TextCaptchaService {

    private final TextCaptchaRepository captchaRepo;

    public TextCaptchaServiceImpl(TextCaptchaRepository captchaRepo) {
        this.captchaRepo = captchaRepo;
    }

    public static String randomString(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++) {
            int idx = (int) (Math.random() * chars.length());
            sb.append(chars.charAt(idx));
        }
        return sb.toString();
    }

    @Override
    public ResponseEntity<TextCaptcha> generateCaptcha() {
        String captchaId = UUID.randomUUID().toString();
        String correctSequence = randomString(4);; // 实际应随机生成

        // 1. 生成图片
        int width = 120, height = 40;
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = image.createGraphics();
        g.setColor(Color.WHITE);
        g.fillRect(0, 0, width, height);
        g.setColor(Color.BLACK);
        g.setFont(new Font("Arial", Font.BOLD, 24));
        g.drawString(correctSequence, 20, 28);
        g.dispose();

        // 2. 转为base64
        String base64Image = "";
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            ImageIO.write(image, "png", baos);
            byte[] bytes = baos.toByteArray();
            base64Image = Base64.getEncoder().encodeToString(bytes);
        } catch (Exception e) {
            e.printStackTrace();
        }

        // 3. 设置到TextCaptcha
        TextCaptcha captcha = new TextCaptcha();
        captcha.setCaptchaId(captchaId);
        captcha.setCorrectSequence(correctSequence);
        captcha.setExpiredAt(LocalDateTime.now().plusMinutes(3));
        captcha.setImage("data:image/png;base64," + base64Image); // 关键

        captchaRepo.save(captcha);
        return ResponseEntity.ok(captcha);
    }

    @Override
    public ResponseEntity<String> verifyCaptcha(String captchaId, String userSequence) {
        return captchaRepo.findByCaptchaId(captchaId)
                .filter(c -> c.getExpiredAt().isAfter(LocalDateTime.now()))
                .map(c -> c.getCorrectSequence().equalsIgnoreCase(userSequence)
                        ? ResponseEntity.ok("验证通过")
                        : ResponseEntity.status(400).body("验证码错误"))
                .orElse(ResponseEntity.status(404).body("验证码不存在或已过期"));
    }
}