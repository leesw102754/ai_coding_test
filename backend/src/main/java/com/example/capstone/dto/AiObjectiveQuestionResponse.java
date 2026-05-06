package com.example.capstone.dto;

public class AiObjectiveQuestionResponse {

    private String title;
    private String description;
    private String choice1;
    private String choice2;
    private String choice3;
    private String choice4;
    private Integer correctAnswer;
    private String explanation;
    private String difficulty;
    private Integer point;
    private String source;

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getChoice1() {
        return choice1;
    }

    public String getChoice2() {
        return choice2;
    }

    public String getChoice3() {
        return choice3;
    }

    public String getChoice4() {
        return choice4;
    }

    public Integer getCorrectAnswer() {
        return correctAnswer;
    }

    public String getExplanation() {
        return explanation;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public Integer getPoint() {
        return point;
    }

    public String getSource() {
        return source;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setChoice1(String choice1) {
        this.choice1 = choice1;
    }

    public void setChoice2(String choice2) {
        this.choice2 = choice2;
    }

    public void setChoice3(String choice3) {
        this.choice3 = choice3;
    }

    public void setChoice4(String choice4) {
        this.choice4 = choice4;
    }

    public void setCorrectAnswer(Integer correctAnswer) {
        this.correctAnswer = correctAnswer;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public void setPoint(Integer point) {
        this.point = point;
    }

    public void setSource(String source) {
        this.source = source;
    }
}