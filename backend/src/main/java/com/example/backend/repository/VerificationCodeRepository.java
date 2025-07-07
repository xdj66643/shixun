package com.example.backend.repository;

import com.example.backend.entity.VerificationCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VerificationCodeRepository extends JpaRepository<VerificationCode, Long> {
    List<VerificationCode> findByTargetValueAndTargetType(String value, VerificationCode.TargetType type);
}

