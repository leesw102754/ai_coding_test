package com.example.capstone.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class Submission {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long examId;        // 어떤 시험의 답안인지

    // 이 부분을 두 개로 나눕니다.
    private String studentId;   // 학번 (예: 20261234)
    private String studentName; // 이름 (예: 홍길동)

    private String language; 

    @Column(columnDefinition = "TEXT")
    private String code;        // 학생이 작성한 소스 코드

    private LocalDateTime submitTime; // 제출 시간

    @Column(columnDefinition = "TEXT")
    private String aiSummary;           // 요약

    @Column(columnDefinition = "TEXT")
    private String aiWrongReason;       // 틀린 이유

    @Column(columnDefinition = "TEXT")
    private String aiSolutionDirection; // 해결 방향

    @Column(columnDefinition = "TEXT")
    private String aiImprovement;      // 개선 피드백

    private String status;
}
