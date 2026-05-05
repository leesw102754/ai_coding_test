package com.example.capstone.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import java.time.LocalDateTime;

@Entity
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long examId;

    private String studentName;

    private String studentId;

    private String language;

    @Column(columnDefinition = "TEXT")
    private String code;

    private String status;

    private Integer earnedPoint;

    private LocalDateTime submitTime;

    @Column(columnDefinition = "TEXT")
    private String aiSummary;

    @Column(columnDefinition = "TEXT")
    private String aiWrongReason;

    @Column(columnDefinition = "TEXT")
    private String aiSolutionDirection;

    @Column(columnDefinition = "TEXT")
    private String aiImprovement;

    public Long getId() {
        return id;
    }

    public Long getExamId() {
        return examId;
    }

    public String getStudentName() {
        return studentName;
    }

    public String getStudentId() {
        return studentId;
    }

    public String getLanguage() {
        return language;
    }

    public String getCode() {
        return code;
    }

    public String getStatus() {
        return status;
    }

    public Integer getEarnedPoint() {
        return earnedPoint;
    }

    public LocalDateTime getSubmitTime() {
        return submitTime;
    }

    public String getAiSummary() {
        return aiSummary;
    }

    public String getAiWrongReason() {
        return aiWrongReason;
    }

    public String getAiSolutionDirection() {
        return aiSolutionDirection;
    }

    public String getAiImprovement() {
        return aiImprovement;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setExamId(Long examId) {
        this.examId = examId;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setEarnedPoint(Integer earnedPoint) {
        this.earnedPoint = earnedPoint;
    }

    public void setSubmitTime(LocalDateTime submitTime) {
        this.submitTime = submitTime;
    }

    public void setAiSummary(String aiSummary) {
        this.aiSummary = aiSummary;
    }

    public void setAiWrongReason(String aiWrongReason) {
        this.aiWrongReason = aiWrongReason;
    }

    public void setAiSolutionDirection(String aiSolutionDirection) {
        this.aiSolutionDirection = aiSolutionDirection;
    }

    public void setAiImprovement(String aiImprovement) {
        this.aiImprovement = aiImprovement;
    }
}