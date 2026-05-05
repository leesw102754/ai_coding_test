package com.example.capstone.dto;
import com.fasterxml.jackson.annotation.JsonProperty;

public class AiAnalyzeRequest {

    @JsonProperty("problem_title")
    private String problemTitle;

    @JsonProperty("problem_description")
    private String problemDescription;

   @JsonProperty("problem_constraints")
   private String problemConstraints;

    @JsonProperty("language")
    private String language;

    @JsonProperty("student_code")
    private String studentCode;

    @JsonProperty("judge_result")
    private JudgeResult judgeResult;

    public String getProblemTitle() {
        return problemTitle;
    }

    public void setProblemTitle(String problemTitle) {
        this.problemTitle = problemTitle;
    }

    public String getProblemDescription() {
        return problemDescription;
    }

    public void setProblemDescription(String problemDescription) {
        this.problemDescription = problemDescription;
    }

   public String getProblemConstraints() {
       return problemConstraints;
   }

   public void setProblemConstraints(String problemConstraints) {
       this.problemConstraints = problemConstraints;
   }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getStudentCode() {
        return studentCode;
    }

    public void setStudentCode(String studentCode) {
        this.studentCode = studentCode;
    }

    public JudgeResult getJudgeResult() {
        return judgeResult;
    }

    public void setJudgeResult(JudgeResult judgeResult) {
        this.judgeResult = judgeResult;
    }
}