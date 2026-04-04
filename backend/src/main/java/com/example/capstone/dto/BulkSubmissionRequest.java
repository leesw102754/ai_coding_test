package com.example.capstone.dto;

import java.util.List;

public class BulkSubmissionRequest {
    private String studentName;
    private String studentId;
    private List<BulkSubmissionItem> submissions;

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public List<BulkSubmissionItem> getSubmissions() { return submissions; }
    public void setSubmissions(List<BulkSubmissionItem> submissions) { this.submissions = submissions; }
}