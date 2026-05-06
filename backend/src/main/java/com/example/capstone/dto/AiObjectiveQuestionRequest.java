package com.example.capstone.dto;

public class AiObjectiveQuestionRequest {

    private Long categoryId;
    private String topic;
    private String difficulty;
    private Integer point;

    public Long getCategoryId() {
        return categoryId;
    }

    public String getTopic() {
        return topic;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public Integer getPoint() {
        return point;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public void setPoint(Integer point) {
        this.point = point;
    }
}