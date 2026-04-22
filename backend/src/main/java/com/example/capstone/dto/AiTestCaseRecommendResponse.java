package com.example.capstone.dto;

import java.util.List;

public class AiTestCaseRecommendResponse {

    private List<AiRecommendedTestCase> recommendedTestCases;

    public List<AiRecommendedTestCase> getRecommendedTestCases() {
        return recommendedTestCases;
    }

    public void setRecommendedTestCases(List<AiRecommendedTestCase> recommendedTestCases) {
        this.recommendedTestCases = recommendedTestCases;
    }
}