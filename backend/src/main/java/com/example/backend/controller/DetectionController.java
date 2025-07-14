package com.example.backend.controller;

import com.example.backend.common.ApiResponse;
import com.example.backend.entity.DetectionVideo;
import com.example.backend.entity.RoadDefect;
import com.example.backend.service.DetectionVideoService;
import com.example.backend.service.RoadDefectService;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.io.File;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import com.example.backend.repository.DetectionVideoRepository;
import com.example.backend.repository.RoadDefectRepository;
import com.example.backend.repository.PassengerHotzoneRepository;
import com.example.backend.repository.VehicleTrajectoryRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import jakarta.servlet.http.HttpServletResponse;
import java.net.URLEncoder;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/detection")
public class DetectionController {

    private final DetectionVideoService videoService;
    private final RoadDefectService defectService;
    private final DetectionVideoRepository detectionVideoRepository;
    private final RoadDefectRepository roadDefectRepository;
    private final PassengerHotzoneRepository passengerHotzoneRepository;
    private final VehicleTrajectoryRepository vehicleTrajectoryRepository;

    public DetectionController(DetectionVideoService videoService, RoadDefectService defectService,
                              DetectionVideoRepository detectionVideoRepository,
                              RoadDefectRepository roadDefectRepository,
                              PassengerHotzoneRepository passengerHotzoneRepository,
                              VehicleTrajectoryRepository vehicleTrajectoryRepository) {
        this.videoService = videoService;
        this.defectService = defectService;
        this.detectionVideoRepository = detectionVideoRepository;
        this.roadDefectRepository = roadDefectRepository;
        this.passengerHotzoneRepository = passengerHotzoneRepository;
        this.vehicleTrajectoryRepository = vehicleTrajectoryRepository;
    }

    @PostMapping("/upload")
    public ApiResponse<String> uploadVideo(@RequestParam("file") MultipartFile file, @RequestParam("userId") Long userId) {
        return ApiResponse.success(videoService.uploadVideo(file, userId).getBody());
    }

    @GetMapping("/videos")
    public ApiResponse<List<DetectionVideo>> getAllVideos() {
        return ApiResponse.success(videoService.getAllVideos());
    }

    @GetMapping("/defects")
    public ApiResponse<List<RoadDefect>> getDefectsByVideo(@RequestParam("videoId") Long videoId) {
        return ApiResponse.success(defectService.getDefectsByVideoId(videoId));
    }

    @PostMapping("/defect/process")
    public ApiResponse<String> processDefects(@RequestBody Map<String, List<Long>> body) {
        List<Long> defectIds = body.get("defectIds");
        defectService.processDefects(defectIds);
        return ApiResponse.success("处理成功");
    }

    @GetMapping("/dashboard/stats")
    public ApiResponse<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalVideos", detectionVideoRepository.count());
        stats.put("totalDefects", roadDefectRepository.count());
        stats.put("totalHotzones", passengerHotzoneRepository.count());
        // 统计已处理病害数量
        long processedDefects = roadDefectRepository.countByProcessedTrue();
        stats.put("processedDefects", processedDefects);
        return ApiResponse.success(stats);
    }

    @GetMapping("/report/download")
    public ResponseEntity<Resource> downloadReport(@RequestParam("videoId") Long videoId) {
        DetectionVideo video = detectionVideoRepository.findById(videoId).orElse(null);
        if (video == null) {
            return ResponseEntity.notFound().build();
        }
        String filename = "result_" + video.getSourcePath() + ".json";
        File file = new File(filename);
        if (!file.exists()) {
            // 兼容文件可能在 backend 目录下
            file = new File("backend/" + filename);
            if (!file.exists()) {
                // 兼容文件可能在 RoadDamage 目录下
                file = new File("RoadDamage/" + filename);
                if (!file.exists()) {
                    return ResponseEntity.notFound().build();
                }
            }
        }
        Resource resource = new FileSystemResource(file);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }

    @GetMapping("/report/downloadExcel")
    public void downloadExcelReport(@RequestParam("videoId") Long videoId, HttpServletResponse response) throws Exception {
        DetectionVideo video = detectionVideoRepository.findById(videoId).orElse(null);
        if (video == null) {
            response.setStatus(404);
            return;
        }
        List<RoadDefect> defects = roadDefectRepository.findByVideo_Id(videoId);
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("病害报告");
        Row header = sheet.createRow(0);
        String[] headers = {"病害类型", "位置", "面积", "置信度", "图片路径", "是否已处理", "检测时间"};
        for (int i = 0; i < headers.length; i++) {
            header.createCell(i).setCellValue(headers[i]);
        }
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        for (int i = 0; i < defects.size(); i++) {
            RoadDefect d = defects.get(i);
            Row row = sheet.createRow(i + 1);
            row.createCell(0).setCellValue(d.getDefectType());
            row.createCell(1).setCellValue(d.getPosition());
            row.createCell(2).setCellValue(d.getArea() != null ? d.getArea() : 0);
            row.createCell(3).setCellValue(d.getConfidence() != null ? d.getConfidence() : 0);
            row.createCell(4).setCellValue(d.getImagePath() != null ? d.getImagePath() : "");
            row.createCell(5).setCellValue(Boolean.TRUE.equals(d.getProcessed()) ? "已处理" : "未处理");
            row.createCell(6).setCellValue(d.getCreatedAt() != null ? fmt.format(d.getCreatedAt()) : "");
        }
        for (int i = 0; i < headers.length; i++) sheet.autoSizeColumn(i);
        String filename = "report_" + video.getSourcePath() + ".xlsx";
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=" + URLEncoder.encode(filename, "UTF-8"));
        workbook.write(response.getOutputStream());
        workbook.close();
    }
}
