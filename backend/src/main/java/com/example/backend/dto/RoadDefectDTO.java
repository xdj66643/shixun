package com.example.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class RoadDefectDTO {
    @JsonProperty("defect_type")
    private String defectType;
    @JsonProperty("position")
    private String position;
    @JsonProperty("area")
    private Float area;
    @JsonProperty("confidence")
    private Float confidence;
    @JsonProperty("image_path")
    private String imagePath;
    @JsonProperty("video_path")
    private String videoPath;

    public String getDefectType() { return defectType; }
    public void setDefectType(String defectType) { this.defectType = defectType; }
    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }
    public Float getArea() { return area; }
    public void setArea(Float area) { this.area = area; }
    public Float getConfidence() { return confidence; }
    public void setConfidence(Float confidence) { this.confidence = confidence; }
    public String getImagePath() { return imagePath; }
    public void setImagePath(String imagePath) { this.imagePath = imagePath; }
    public String getVideoPath() { return videoPath; }
    public void setVideoPath(String videoPath) { this.videoPath = videoPath; }
} 