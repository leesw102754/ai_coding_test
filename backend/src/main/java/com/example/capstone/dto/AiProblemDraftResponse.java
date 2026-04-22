package com.example.capstone.dto;

import java.util.List;

public class AiProblemDraftResponse {

    private String title;
    private String description;
    private String difficulty;
    private List<AiProblemDraftTestCase> testCases;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public List<AiProblemDraftTestCase> getTestCases() {
        return testCases;
    }

    public void setTestCases(List<AiProblemDraftTestCase> testCases) {
        this.testCases = testCases;
    }
}