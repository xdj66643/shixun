package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Data
@Entity
@Table(name = "passenger_hotzones")
public class PassengerHotzone {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String regionName;
    private Double longitude;
    private Double latitude;
    private Integer pickupCount;
    private LocalDate date;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRegionName() {
        return regionName;
    }

    public void setRegionName(String regionName) {
        this.regionName = regionName;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Integer getPickupCount() {
        return pickupCount;
    }

    public void setPickupCount(Integer pickupCount) {
        this.pickupCount = pickupCount;
    }
}

