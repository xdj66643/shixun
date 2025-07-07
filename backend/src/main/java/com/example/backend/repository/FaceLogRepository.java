package com.example.backend.repository;

import com.example.backend.entity.FaceLog;
import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FaceLogRepository extends JpaRepository<FaceLog, Long> {
    List<FaceLog> findByUser(User user);
}
