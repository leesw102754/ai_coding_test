package com.example.capstone.dto;

import com.example.capstone.entity.Submission;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class SubmissionResponse {

    private Long id;
    private Long examId;
    private String studentName;
    private String studentId;
    private String language;
    private String status;
    private boolean isCorrect;
    private LocalDateTime submitTime;

    private String aiSummary;
    private String aiWrongReason;
    private String aiSolutionDirection;
    private String aiImprovement;

    private Integer earnedPoint;

    public SubmissionResponse(Submission s) {
        this.id = s.getId();
        this.examId = s.getExamId();
        this.studentName = s.getStudentName();
        this.studentId = s.getStudentId();
        this.language = s.getLanguage();
        this.status = s.getStatus();
        this.isCorrect = s.getStatus() != null &&
                s.getStatus().trim().equalsIgnoreCase("accepted");
        this.submitTime = s.getSubmitTime();

        this.aiSummary = s.getAiSummary();
        this.aiWrongReason = s.getAiWrongReason();
        this.aiSolutionDirection = s.getAiSolutionDirection();
        this.aiImprovement = s.getAiImprovement();
	this.earnedPoint = s.getEarnedPoint();
    }
}