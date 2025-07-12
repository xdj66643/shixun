package com.example.backend.service;

import com.example.backend.dto.RoadDefectDTO;
import com.example.backend.entity.DetectionVideo;
import com.example.backend.entity.RoadDefect;
import com.example.backend.repository.DetectionVideoRepository;
import com.example.backend.repository.RoadDefectRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.List;

@Service
public class ImportRoadDefectService {
    @Autowired
    private RoadDefectRepository roadDefectRepository;
    @Autowired
    private DetectionVideoRepository detectionVideoRepository;

    public void importDefectsFromJson(String jsonPath) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        List<RoadDefectDTO> defectList = mapper.readValue(
                new File(jsonPath),
                new TypeReference<List<RoadDefectDTO>>() {}
        );
        int count = 0;
        DetectionVideo video = null;
        for (RoadDefectDTO dto : defectList) {
            System.out.println("查找视频: " + dto.getVideoPath());
            RoadDefect defect = new RoadDefect();
            defect.setDefectType(dto.getDefectType());
            defect.setPosition(dto.getPosition());
            defect.setArea(dto.getArea());
            defect.setConfidence(dto.getConfidence());
            defect.setImagePath(dto.getImagePath());
            video = detectionVideoRepository.findTopBySourcePathOrderByIdDesc(dto.getVideoPath());
            System.out.println("查找结果: " + video);
            defect.setVideo(video);
            try {
                roadDefectRepository.save(defect);
                System.out.println("已保存病害: " + defect);
            } catch (Exception e) {
                System.out.println("保存病害失败: " + e.getMessage());
                e.printStackTrace();
            }
            count++;
        }
        // 更新视频状态和病害数
        if (video != null) {
            video.setStatus("completed");
            video.setDefectCount(count);
            detectionVideoRepository.save(video);
        }
    }
} 