package com.example.backend.service.impl;

import com.example.backend.entity.PassengerHotzone;
import com.example.backend.repository.PassengerHotzoneRepository;
import com.example.backend.service.PassengerHotzoneService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PassengerHotzoneServiceImpl implements PassengerHotzoneService {
    private final PassengerHotzoneRepository repo;

    public PassengerHotzoneServiceImpl(PassengerHotzoneRepository repo) {
        this.repo = repo;
    }

    @Override
    public List<PassengerHotzone> getAllHotzones() {
        return repo.findAll();
    }
} 