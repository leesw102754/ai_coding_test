package com.example.capstone.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Getter @Setter
public class ExamRecord {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String studentId;   // 학번
    private String studentName; // 이름
    private Integer totalScore; // 최종 합산 점수
    private Integer warningCount; // 총 경고 횟수 (나중에 프론트에서 받아올 곳)
    private LocalDateTime endTime; // 시험 종료 시간
}
