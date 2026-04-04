package com.example.capstone.dto;

public class BulkSubmissionItem {
    private Long examId;
    private String language;
    private String code;

    public Long getExamId() { return examId; }
    public void setExamId(Long examId) { this.examId = examId; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
}