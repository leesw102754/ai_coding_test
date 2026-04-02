package com.example.capstone.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class AiAnalyzeResponse {

    @JsonProperty("error_type")
    private String errorType;

    @JsonProperty("summary")
    private String summary;

    @JsonProperty("wrong_reason")
    private String wrongReason;

    @JsonProperty("solution_direction")
    private String solutionDirection;

    @JsonProperty("improvement_feedback")
    private String improvementFeedback;

    public String getErrorType() {
        return errorType;
    }

    public void setErrorType(String errorType) {
        this.errorType = errorType;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getWrongReason() {
        return wrongReason;
    }

    public void setWrongReason(String wrongReason) {
        this.wrongReason = wrongReason;
    }

    public String getSolutionDirection() {
        return solutionDirection;
    }

    public void setSolutionDirection(String solutionDirection) {
        this.solutionDirection = solutionDirection;
    }

    public String getImprovementFeedback() {
        return improvementFeedback;
    }

    public void setImprovementFeedback(String improvementFeedback) {
        this.improvementFeedback = improvementFeedback;
    }
}