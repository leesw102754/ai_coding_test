package com.example.capstone.dto;

import com.example.capstone.entity.Submission;

public class BulkSubmissionResultItem {
    private Long examId;
    private String status;
    private Submission submission;
    private AiAnalyzeResponse aiFeedback;

    public Long getExamId() { return examId; }
    public void setExamId(Long examId) { this.examId = examId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Submission getSubmission() { return submission; }
    public void setSubmission(Submission submission) { this.submission = submission; }

    public AiAnalyzeResponse getAiFeedback() { return aiFeedback; }
    public void setAiFeedback(AiAnalyzeResponse aiFeedback) { this.aiFeedback = aiFeedback; }
}