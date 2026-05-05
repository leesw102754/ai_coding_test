package com.example.capstone.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import java.time.LocalDateTime;

@Entity
public class ExamRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String studentId;

    private String studentName;

    private Integer totalScore;

    private Integer warningCount;

    private LocalDateTime endTime;

    public Long getId() {
        return id;
    }

    public String getStudentId() {
        return studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public Integer getTotalScore() {
        return totalScore;
    }

    public Integer getWarningCount() {
        return warningCount;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public void setTotalScore(Integer totalScore) {
        this.totalScore = totalScore;
    }

    public void setWarningCount(Integer warningCount) {
        this.warningCount = warningCount;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }
}