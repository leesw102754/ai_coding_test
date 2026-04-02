package com.example.capstone.dto;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.ArrayList;
import java.util.List;

public class JudgeResult {

    @JsonProperty("status")
    private String status;

    @JsonProperty("error_type_hint")
    private String errorTypeHint;

    @JsonProperty("stdout")
    private String stdout;

    @JsonProperty("stderr")
    private String stderr;

    @JsonProperty("compile_output")
    private String compileOutput;

    @JsonProperty("execution_time_ms")
    private Integer executionTimeMs;

    @JsonProperty("memory_kb")
    private Integer memoryKb;

    @JsonProperty("failed_cases")
    private List<FailedCase> failedCases;

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getErrorTypeHint() {
        return errorTypeHint;
    }

    public void setErrorTypeHint(String errorTypeHint) {
        this.errorTypeHint = errorTypeHint;
    }

    public String getStdout() {
        return stdout;
    }

    public void setStdout(String stdout) {
        this.stdout = stdout;
    }

    public String getStderr() {
        return stderr;
    }

    public void setStderr(String stderr) {
        this.stderr = stderr;
    }

    public String getCompileOutput() {
        return compileOutput;
    }

    public void setCompileOutput(String compileOutput) {
        this.compileOutput = compileOutput;
    }

    public Integer getExecutionTimeMs() {
        return executionTimeMs;
    }

    public void setExecutionTimeMs(Integer executionTimeMs) {
        this.executionTimeMs = executionTimeMs;
    }

    public Integer getMemoryKb() {
        return memoryKb;
    }

    public void setMemoryKb(Integer memoryKb) {
        this.memoryKb = memoryKb;
    }

    public List<FailedCase> getFailedCases() {
        return failedCases;
    }

    public void setFailedCases(List<FailedCase> failedCases) {
        this.failedCases = failedCases;
    }
}