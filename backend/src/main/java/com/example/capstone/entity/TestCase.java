package com.example.capstone.entity;

import jakarta.persistence.*;

@Entity
public class TestCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long examId;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String input;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String expectedOutput;

    public Long getId() {
        return id;
    }

    public Long getExamId() {
        return examId;
    }

    public void setExamId(Long examId) {
        this.examId = examId;
    }

    public String getInput() {
        return input;
    }

    public void setInput(String input) {
        this.input = input;
    }

    public String getExpectedOutput() {
        return expectedOutput;
    }

    public void setExpectedOutput(String expectedOutput) {
        this.expectedOutput = expectedOutput;
    }
}