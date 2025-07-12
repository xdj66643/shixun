package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "detection_videos")
public class DetectionVideo {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String sourcePath;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSourcePath() {
        return sourcePath;
    }

    public void setSourcePath(String sourcePath) {
        this.sourcePath = sourcePath;
    }

    public User getUploadUser() {
        return uploadUser;
    }

    public void setUploadUser(User uploadUser) {
        this.uploadUser = uploadUser;
    }

    public Boolean getProcessed() {
        return processed;
    }

    public void setProcessed(Boolean processed) {
        this.processed = processed;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    private Integer duration; // 秒
    private Long size; // 字节
    private String status; // processing/completed/failed
    private Integer defectCount = 0;

    public Integer getDuration() { return duration; }
    public void setDuration(Integer duration) { this.duration = duration; }
    public Long getSize() { return size; }
    public void setSize(Long size) { this.size = size; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Integer getDefectCount() { return defectCount; }
    public void setDefectCount(Integer defectCount) { this.defectCount = defectCount; }

    @ManyToOne
    @JoinColumn(name = "upload_user")
    private User uploadUser;

    private Boolean processed = false;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
