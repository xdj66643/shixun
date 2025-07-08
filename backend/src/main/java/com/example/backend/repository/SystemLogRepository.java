package com.example.backend.repository;

import com.example.backend.entity.SystemLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SystemLogRepository extends JpaRepository<SystemLog, Long> {
    List<SystemLog> findByLevel(SystemLog.Level level);
}

