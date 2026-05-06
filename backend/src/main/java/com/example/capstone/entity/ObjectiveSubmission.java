package com.example.capstone.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import java.time.LocalDateTime;

@Entity
public class ObjectiveSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long categoryId;
    private Long questionId;

    private String studentId;
    private String studentName;

    private Integer selectedAnswer;
    private Integer correctAnswer;
    private Boolean correct;

    private Integer earnedPoint;
    private LocalDateTime submitTime;

    public Long getId() {
        return id;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public Long getQuestionId() {
        return questionId;
    }

    public String getStudentId() {
        return studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public Integer getSelectedAnswer() {
        return selectedAnswer;
    }

    public Integer getCorrectAnswer() {
        return correctAnswer;
    }

    public Boolean getCorrect() {
        return correct;
    }

    public Integer getEarnedPoint() {
        return earnedPoint;
    }

    public LocalDateTime getSubmitTime() {
        return submitTime;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public void setSelectedAnswer(Integer selectedAnswer) {
        this.selectedAnswer = selectedAnswer;
    }

    public void setCorrectAnswer(Integer correctAnswer) {
        this.correctAnswer = correctAnswer;
    }

    public void setCorrect(Boolean correct) {
        this.correct = correct;
    }

    public void setEarnedPoint(Integer earnedPoint) {
        this.earnedPoint = earnedPoint;
    }

    public void setSubmitTime(LocalDateTime submitTime) {
        this.submitTime = submitTime;
    }
}