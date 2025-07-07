package com.example.backend.repository;

import com.example.backend.entity.TextCaptcha;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TextCaptchaRepository extends JpaRepository<TextCaptcha, Long> {
    Optional<TextCaptcha> findByCaptchaId(String captchaId);
}
