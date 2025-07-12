package com.example.backend.controller;

import com.example.backend.service.ImportRoadDefectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/import-defect")
public class ImportRoadDefectController {
    @Autowired
    private ImportRoadDefectService importRoadDefectService;

    @PostMapping
    public String importDefect(@RequestParam String jsonPath) {
        try {
            importRoadDefectService.importDefectsFromJson(jsonPath);
            return "导入成功";
        } catch (Exception e) {
            e.printStackTrace();
            return "导入失败: " + e.getMessage();
        }
    }
} 