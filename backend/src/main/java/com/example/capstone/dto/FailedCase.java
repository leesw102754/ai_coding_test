package com.example.capstone.dto;
import com.fasterxml.jackson.annotation.JsonProperty;

public class FailedCase {

    @JsonProperty("input")
    private String input;

    @JsonProperty("expected_output")
    private String expectedOutput;

    @JsonProperty("actual_output")
    private String actualOutput;

    @JsonProperty("reason")
    private String reason;

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

    public String getActualOutput() {
        return actualOutput;
    }

    public void setActualOutput(String actualOutput) {
        this.actualOutput = actualOutput;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}